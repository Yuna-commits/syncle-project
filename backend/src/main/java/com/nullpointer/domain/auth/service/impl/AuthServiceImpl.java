package com.nullpointer.domain.auth.service.impl;

import com.nullpointer.domain.auth.dto.request.LoginRequest;
import com.nullpointer.domain.auth.dto.request.SignupRequest;
import com.nullpointer.domain.auth.dto.response.LoginResponse;
import com.nullpointer.domain.auth.service.AuthService;
import com.nullpointer.domain.auth.service.EmailService;
import com.nullpointer.domain.auth.service.RegistrationService;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.domain.user.vo.enums.Provider;
import com.nullpointer.domain.user.vo.enums.UserStatus;
import com.nullpointer.domain.user.vo.enums.VerifyStatus;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.exception.ErrorCode;
import com.nullpointer.global.security.jwt.JwtTokenProvider;
import com.nullpointer.global.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
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

    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    private final RedisUtil redisUtil;

    @Value("${app.email.verification-expiration-millis}")
    private long verificationExpirationMillis; // 인증 메일 유효 시간

    @Value("${app.jwt.refresh-expiration}")
    private Long refreshTokenExpiration; // Redis 저장용 만료 시간

    private static final String EMAIL_KEY_PREFIX = "np:auth:email:";

    /**
     * 이메일 회원가입 요청
     * 추가) 인증하지 않은 계정 정리, 메일 발송 실패 시 후처리
     */
    @Override
    public void signup(SignupRequest req) {

        /**
         * 회원가입과 메일 발송을 같은 트랜잭션에 두면,
         * 메일 발송 실패 시 롤백되어 DB INSERT가 취소됨
         * -> 회원가입과 메일 발송을 별도 메서드로 분리
         */
        // 1) 회원가입 트랜잭션
        UserVo newUser = registrationService.registerLocalUser(req);

        // 2) 인증 토큰 생성
        String token = UUID.randomUUID().toString();

        // 3) Redis 저장 (Key: "np:auth:email:{token}", Value: userId, TTL: 5분)
        redisUtil.setDataExpire(EMAIL_KEY_PREFIX + token, String.valueOf(newUser.getId()), verificationExpirationMillis);

        // 4) 인증 메일 발송 -> 실패 시 재발송 유도 (추가)
        try {
            emailService.sendVerificationEmail(newUser.getEmail(), token);
        } catch (MailException ex) {
            /**
             * 추가) 재발송 기능
             */
            log.error("회원가입 인증 메일 전송 실패 user={}: {}", newUser.getEmail(), ex.getMessage());
        }
    }

    /**
     * 이메일 인증 토큰 검증
     */
    @Override
    @Transactional
    public void verifyEmailToken(String token) {

        String key = EMAIL_KEY_PREFIX + token;

        // 1) Redis에서 token으로 userId 조회
        String userIdStr = redisUtil.getData(key);

        // 만료되었거나 잘못된 토큰인 경우
        if (userIdStr == null) {
            throw new BusinessException(ErrorCode.INVALID_VERIFICATION_TOKEN);
        }

        // 2) 사용자 조회
        Long userId = Long.valueOf(userIdStr);
        UserVo user = userMapper.findById(userId);

        // 존재하지 않는 사용자인 경우
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        // 이미 인증된 사용자인 경우
        if (user.getVerifyStatus() == VerifyStatus.VERIFIED) {
            redisUtil.deleteData(key); // 토큰 정리
            throw new BusinessException(ErrorCode.ALREADY_VERIFIED);
        }

        // 3) 동시성 이슈 방지를 위한 user.verifyStatus 조건부 업데이트 (PENDING -> VERIFIED)
        // 현재 상태가 PENDING이면 VERIFIED 변경 후 1 반환
        int updated = userMapper.updateVerifyStatusIfCurrent(userId, VerifyStatus.PENDING, VerifyStatus.VERIFIED);

        // 이미 다른 요청에서 상태가 바뀐 경우
        if (updated == 0) {
            throw new BusinessException(ErrorCode.ALREADY_VERIFIED);
        }

        // 5) 인증 성공 후 Redis에서 토큰 삭제
        redisUtil.deleteData(key);
    }

    /**
     * 이메일 로그인
     */
    @Override
    public LoginResponse login(LoginRequest req) {

        // 1) 이메일로 사용자 조회
        UserVo user = userMapper.findByEmail(req.getEmail());

        // 존재하지 않는 사용자인 경우
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        // 2) 비즈니스 검증
        validateUserStatus(user, req.getPassword());

        // 3) 토큰 생성
        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        // 4) RefreshToken Redis에 저장
        String key = "np:auth:refresh:" + user.getId();
        redisUtil.setDataExpire(key, refreshToken, refreshTokenExpiration);

        // 8) ResponseDTO 반환
        return LoginResponse
                .builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

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
