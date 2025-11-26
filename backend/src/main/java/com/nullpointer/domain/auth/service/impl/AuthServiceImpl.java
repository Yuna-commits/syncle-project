package com.nullpointer.domain.auth.service.impl;

import com.nullpointer.domain.auth.dto.request.AuthRequest;
import com.nullpointer.domain.auth.dto.request.PasswordRequest;
import com.nullpointer.domain.auth.dto.request.VerificationRequest;
import com.nullpointer.domain.auth.dto.response.LoginResponse;
import com.nullpointer.domain.auth.dto.response.PasswordVerifyResponse;
import com.nullpointer.domain.auth.helper.VerificationCodeHelper;
import com.nullpointer.domain.auth.service.AuthService;
import com.nullpointer.domain.auth.service.EmailService;
import com.nullpointer.domain.auth.service.RegistrationService;
import com.nullpointer.domain.team.service.TeamService;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.domain.user.vo.enums.Provider;
import com.nullpointer.domain.user.vo.enums.UserStatus;
import com.nullpointer.domain.user.vo.enums.VerifyStatus;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.common.enums.RedisKeyType;
import com.nullpointer.global.common.enums.VerificationType;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.security.jwt.JwtTokenProvider;
import com.nullpointer.global.util.GoogleTokenVerifier;
import com.nullpointer.global.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final RegistrationService registrationService;
    private final EmailService emailService; // 이메일 전송
    private final UserMapper userMapper;
    private final VerificationCodeHelper codeHelper;

    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final RedisUtil redisUtil;
    private final GoogleTokenVerifier googleTokenVerifier;

    private final TeamService teamService;

    // ==================================================================
    // 1. 회원가입 (Signup)
    // ==================================================================

    /**
     * 1단계: 회원 정보 입력 & 인증코드 발송
     */
    @Override
    public void sendSignupCode(AuthRequest.Signup req) {
        // 1) DB 저장 (verifyStatus = PENDING)
        UserVo user = registrationService.registerLocalUser(req);

        // 2) 인증코드 생성, 저장
        String code = codeHelper.generateAndSaveCode(user.getEmail(), VerificationType.SIGNUP);

        // 3) 메일 발송
        emailService.sendVerificationEmail(user.getEmail(), code, VerificationType.SIGNUP);
    }

    /**
     * 2단계: 인증코드 검증 & 자동 로그인
     */
    @Override
    @Transactional
    public LoginResponse verifySignup(VerificationRequest.Code req) {
        // 1) 인증코드 검증
        codeHelper.verifyCode(req.getEmail(), req.getAuthCode(), VerificationType.SIGNUP);

        // 2) 이메일 인증 상태 변경 (PENDING -> VERIFIED)
        UserVo user = userMapper.findByEmail(req.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (user.getVerifyStatus() == VerifyStatus.VERIFIED) {
            throw new BusinessException(ErrorCode.ALREADY_VERIFIED);
        }

        // 3) 동시성 제어 상태 업데이트
        int updated = userMapper.updateVerifyStatusIfCurrent(user.getId(), VerifyStatus.PENDING, VerifyStatus.VERIFIED);

        if (updated == 0) {
            throw new BusinessException(ErrorCode.ALREADY_VERIFIED);
        }

        // 4) 기본 팀/보드 세트 생성
        teamService.createPersonalTeam(user.getId(), user.getNickname());

        // 5) 자동 로그인 (토큰 발급)
        return createLoginResponse(user);
    }

    // ==================================================================
    // 2. 로그인
    // ==================================================================

    /**
     * 이메일 로그인
     */
    @Override
    @Transactional(readOnly = true) // 단순 조회, 토큰 발급용
    public LoginResponse login(AuthRequest.Login req) {
        // 1) 이메일로 사용자 조회
        UserVo user = userMapper.findByEmail(req.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 2) 비즈니스 검증
        validateUserStatus(user, req.getPassword());

        return createLoginResponse(user);
    }

    /**
     * 구글 로그인
     */
    @Override
    @Transactional // 상황에 따라 DB 상태 변경이 일어나기 때문에 트랜잭션으로 관리
    public LoginResponse googleLogin(String idToken) {
        // 1) 구글 ID Token 검증, 정보 추출
        GoogleTokenVerifier.GoogleUserInfo googleUser = googleTokenVerifier.verify(idToken);

        // 2) 이메일로 사용자 조회
        UserVo user = userMapper.findByEmail(googleUser.email())
                .map(existingUser -> {
                    // 3-1) 기존 회원인 경우 -> Provider 확인
                    if (existingUser.getProvider() != Provider.GOOGLE) {
                        throw new BusinessException(ErrorCode.LOGIN_PROVIDER_MISMATCH);
                    }
                    return existingUser; // 검증에 통과하면 기존 유저 반환
                }).orElseGet(() -> {
                    // 3-2) 신규 회원인 경우 -> 회원가입 진행
                    UserVo newUser = UserVo
                            .builder()
                            .email(googleUser.email())
                            .password(passwordEncoder.encode(UUID.randomUUID().toString())) // 랜덤 비밀번호
                            .nickname(googleUser.name())
                            .profileImg(googleUser.pictureUrl())
                            .provider(Provider.GOOGLE)
                            .providerId(googleUser.providerId()) // sub 값 저장
                            .verifyStatus(VerifyStatus.VERIFIED)
                            .build();

                    // DB 저장
                    userMapper.insertUser(newUser);

                    // 기본 팀/보드 세트 생성
                    teamService.createPersonalTeam(newUser.getId(), newUser.getNickname());

                    return newUser;
                });

        // 4) 토큰 발급
        return createLoginResponse(user);
    }

    /**
     * 로그아웃
     */
    @Override
    public void logout(String accessToken) {
        // 1) Access Token 유효성 검증 (형식, 만료 여부)
        if (!jwtTokenProvider.validateToken(accessToken)) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }

        // 2) 토큰에서 userId와 만료 시간 추출
        Long userId = jwtTokenProvider.getUserId(accessToken);
        Long expiration = jwtTokenProvider.getExpiration(accessToken);

        // 3) Redis에서 해당 사용자의 Refresh Token 삭제 (재발급 차단 목적)
        String refreshTokenKey = RedisKeyType.REFRESH_TOKEN.getKey(userId);

        if (redisUtil.hasKey(refreshTokenKey)) {
            redisUtil.deleteData(refreshTokenKey);
        }

        // 4) Access Token 블랙리스트 등록 -> 남은 시간동안 사용 차단
        // 남은 시간 = 만료 시간 - 현재 시간
        long remainingTime = expiration - System.currentTimeMillis();

        if (remainingTime > 0) {
            redisUtil.setDataExpire(RedisKeyType.BLACKLIST.getKey(accessToken), "logout", remainingTime);
        }
    }

    /**
     * 토큰 재발급
     */
    @Override
    public LoginResponse reissue(String refreshToken) {
        // 1) Refresh Token 유효성 검사 (JWT 서명, 만료 여부 확인)
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        // 2) 토큰에서 userId 추출
        Long userId = jwtTokenProvider.getUserId(refreshToken);

        // 3) Redis에 저장된 토큰과 비교
        String redisKey = RedisKeyType.REFRESH_TOKEN.getKey(userId);
        String savedRefreshKey = redisUtil.getData(redisKey);

        if (savedRefreshKey == null || !savedRefreshKey.equals(refreshToken)) {
            throw new BusinessException(ErrorCode.REFRESH_TOKEN_NOT_FOUND);
        }

        // 4) 사용자 존재 여부, 활성화 상태 확인
        UserVo user = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (user.getUserStatus() != UserStatus.ACTIVATED) {
            throw new BusinessException(ErrorCode.USER_STATUS_NOT_ACTIVE);
        }

        // 5) Access, Refresh Token 둘 다 재발급
        return createLoginResponse(user);
    }

    // ==================================================================
    // 3. 비밀번호 재설정 (Password Reset)
    // ==================================================================

    /**
     * 1단계: 이메일 확인 & 인증코드 발송
     */
    @Override
    public void sendPasswordResetCode(VerificationRequest.EmailOnly req) {
        // 1) 사용자 검증
        if (userMapper.findByEmail(req.getEmail()).isEmpty()) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        // 2) 인증코드 생성, 저장
        String code = codeHelper.generateAndSaveCode(req.getEmail(), VerificationType.PASSWORD_RESET);

        // 3) 메일 발송
        emailService.sendVerificationEmail(req.getEmail(), code, VerificationType.PASSWORD_RESET);
    }

    /**
     * 2단계: 인증코드 검증 & 임시 토큰 발급
     */
    @Override
    public PasswordVerifyResponse verifyPasswordResetCode(VerificationRequest.Code req) {
        // 1) 인증코드 검증
        codeHelper.verifyCode(req.getEmail(), req.getAuthCode(), VerificationType.PASSWORD_RESET);

        // 2) 임시 토큰 발급
        String resetToken = UUID.randomUUID().toString();
        String redisKey = RedisKeyType.PASSWORD_RESET_TOKEN.getKey(req.getEmail());

        redisUtil.setDataExpire(redisKey, resetToken, RedisKeyType.PASSWORD_RESET_TOKEN.getDefaultTtl());

        return new PasswordVerifyResponse(resetToken);
    }

    /**
     * 3단계: 비밀번호 재설정
     */
    @Override
    @Transactional
    public void resetPassword(PasswordRequest.Reset req) {
        // 1) 임시 토큰 검증
        String redisKey = RedisKeyType.PASSWORD_RESET_TOKEN.getKey(req.getEmail());
        String savedToken = redisUtil.getData(redisKey);

        if (savedToken == null || !savedToken.equals(req.getResetToken())) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }

        // 2) 비밀번호 재설정
        UserVo user = userMapper.findByEmail(req.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        userMapper.updatePassword(user.getId(), passwordEncoder.encode(req.getNewPassword()));

        // 3) 로그아웃 처리 -> Reids에 저장된 Refresh Token 삭제
        redisUtil.deleteData(RedisKeyType.REFRESH_TOKEN.getKey(user.getId()));
        redisUtil.deleteData(redisKey);
    }

    /**
     * 로그인 토큰 발급, 응답 생성 메서드
     */
    private LoginResponse createLoginResponse(UserVo user) {
        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        redisUtil.setDataExpire(
                RedisKeyType.REFRESH_TOKEN.getKey(user.getId()), refreshToken, RedisKeyType.REFRESH_TOKEN.getDefaultTtl());

        return LoginResponse
                .builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    /**
     * 상태 검증
     */
    private void validateUserStatus(UserVo user, String inputPassword) {
        // A. LOCAL(이메일 로그인)인지 확인
        if (user.getProvider() != Provider.LOCAL) {
            // 소셜 가입 계정과 이메일 가입 계정 구분
            throw new BusinessException(ErrorCode.LOGIN_PROVIDER_MISMATCH);
        }

        // B. 비밀번호 검증
        if (!passwordEncoder.matches(inputPassword, user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }

        // C. 이메일 인증 여부 확인 -> !VERIFIED이면 로그인 불가
        if (user.getVerifyStatus() != VerifyStatus.VERIFIED) {
            throw new BusinessException(ErrorCode.EMAIL_NOT_VERIFIED);
        }

        // D. 계정 활성화 상태 확인 -> !ACTIVATED이면 로그인 불가
        if (user.getUserStatus() != UserStatus.ACTIVATED) {
            throw new BusinessException(ErrorCode.USER_STATUS_NOT_ACTIVE);
        }
    }

}
