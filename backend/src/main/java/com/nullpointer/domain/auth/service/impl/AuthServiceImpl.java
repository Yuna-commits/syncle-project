package com.nullpointer.domain.auth.service.impl;

import com.nullpointer.domain.auth.service.*;
import com.nullpointer.domain.user.dto.LoginRequest;
import com.nullpointer.domain.user.dto.LoginResponse;
import com.nullpointer.domain.user.dto.SignupRequest;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.domain.user.vo.enums.Provider;
import com.nullpointer.domain.user.vo.enums.UserStatus;
import com.nullpointer.domain.user.vo.enums.VerifyStatus;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.exception.ErrorCode;
import com.nullpointer.global.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final RegistrationService registrationService;
    private final EmailService emailService; // 이메일 전송
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final EmailVerificationService emailVerificationService; // Redis 서비스

    /**
     * 이메일 회원가입
     * 추가) 인증하지 않은 계정 정리, 메일 발송 실패 시 후처리
     */
    @Override
    public void signup(SignupRequest req) {

        /**
         * 회원가입과 메일 발송을 같은 트랜잭션에 두면,
         * 메일 발송 실패 시 롤백되어 DB INSERT가 취소됨
         * -> 회원가입과 메일 발송을 별도 메서드로 분리
         */
        // 회원가입 트랜잭션
        RegistrationService.RegistrationResult result =
                registrationService.registerLocalUser(req);

        // 7) 인증 메일 발송
        try {
            emailService.sendVerificationEmail(
                    result.user().getEmail(),
                    result.emailVerificationToken());
        } catch (MailException ex) {
            /**
             * 추가) 재발송 기능
             */
            log.error("인증 메일 전송 실패", ex);
        }
    }

    /**
     * 이메일 인증 토큰 검증
     */
    @Override
    @Transactional
    public void verifyEmailToken(String token) {

        // 1) Redis에서 token으로 userId, expireTime 조회
        Long userId = emailVerificationService.getUserIdByToken(token);
        LocalDateTime expireTime = emailVerificationService.getExpireTimeByToken(token);

        // 2) 토큰 존재, 만료 여부 확인
        if (userId == null || expireTime == null) {
            // TTL 종료 -> 완전히 만료된 토큰
            throw new BusinessException(ErrorCode.INVALID_VERIFICATION_TOKEN);
        }

        /**
         * Redis TTL은 key의 삭제 시점만 관리하기 때문에 만료 직전에는 key가 존재할 수 있음
         * -> 만료되기 직전에 인증을 시도하여, 현재 시간이 만료 예정 시간을 넘길 수도 있음
         * -> 만료된 토큰인데도 정상 인증이 가능해지는 경우를 방지
         */
        if (LocalDateTime.now().isAfter(expireTime)) {
            emailVerificationService.deleteToken(token); // 토큰 정리
            throw new BusinessException(ErrorCode.EXPIRED_VERIFICATION_TOKEN);
        }

        // 3) 사용자 조회
        UserVo user = userMapper.findById(userId);

        // 존재하지 않는 사용자인 경우
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        // 이미 인증된 사용자인 경우
        if (user.getVerifyStatus() == VerifyStatus.VERIFIED) {
            emailVerificationService.deleteToken(token); // 토큰 정리
            throw new BusinessException(ErrorCode.ALREADY_VERIFIED);
        }

        // -- 인증 성공 --
        // 4) user.verifyStatus 조건부 업데이트 (PENDING -> VERIFIED)
        // 현재 상태가 PENDING이면 VERIFIED 변경 후 1 반환
        int updated = userMapper.updateVerifyStatusIfCurrent(userId, VerifyStatus.PENDING, VerifyStatus.VERIFIED);

        // 이미 다른 요청에서 상태가 바뀐 경우
        if (updated == 0) {
            throw new BusinessException(ErrorCode.ALREADY_VERIFIED);
        }

        // 5) 인증 성공 후 Redis에서 토큰 삭제
        emailVerificationService.deleteToken(token);
    }

    /**
     * 이메일 로그인
     */
    @Override
    public LoginResponse login(LoginRequest req) {

        // 1) 이메일로 사용자 조회
        UserVo user = userMapper.findByEmail(req.getEmail());

        // -- 검증 --
        // 존재하지 않는 사용자인 경우
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        // 2) LOCAL(이메일 로그인)인지 확인
        if (user.getProvider() != Provider.LOCAL) {
            // 소셜 가입 계정과 이메일 가입 계정 구분
            throw new BusinessException(ErrorCode.LOGIN_PROVIDER_MISMATCH);
        }

        // 3) 비밀번호 검증
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }

        // 4) 이메일 인증 여부 확인 -> !VERIFIED이면 로그인 불가
        if (user.getVerifyStatus() != VerifyStatus.VERIFIED) {
            throw new BusinessException(ErrorCode.EMAIL_NOT_VERIFIED);
        }

        // 5) 계정 상태 확인 -> !ACTIVATED이면 로그인 불가
        if (user.getUserStatus() != UserStatus.ACTIVATED) {
            throw new BusinessException(ErrorCode.USER_STATUS_NOT_ACTIVE);
        }

        // -- 로그인 성공 --
        // 6) AccessToken, RefreshToken 생성
        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        // 7) RefreshToken Redis에 저장
        refreshTokenService.saveRefreshToken(user.getId(), refreshToken);

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

}
