package com.nullpointer.domain.user.service.impl;

import com.nullpointer.domain.user.dto.SignupRequest;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.service.AuthService;
import com.nullpointer.domain.user.service.EmailService;
import com.nullpointer.domain.user.service.EmailVerificationService;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.domain.user.vo.enums.VerifyStatus;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final EmailVerificationService emailVerificationService; // Redis 서비스
    private final EmailService emailService; // 이메일 전송

    /**
     * 이메일 로그인으로 가정
     * 회원가입 -> 이메일 인증 -> (PENDING => VERIFIED) -> 로그인 가능
     * 추가) 인증하지 않은 계정 정리 기능
     */
    @Override
    @Transactional
    public void signup(SignupRequest req) {

        // 1) 이메일/닉네임 최종 중복 확인
        if (userMapper.existsByEmail(req.getEmail())) {
            throw new BusinessException(ErrorCode.USER_EMAIL_DUPLICATE);
        }

        if (userMapper.existsByNickname(req.getNickname())) {
            throw new BusinessException(ErrorCode.USER_NICKNAME_DUPLICATE);
        }

        // 2) 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(req.getPassword());

        // 3) DTO -> VO(provider=LOCAL, verifyStatus=PENDING, userStatus=ACTIVATED)
        UserVo user = UserVo.builder()
                .email(req.getEmail())
                .password(encodedPassword)
                .nickname(req.getNickname())
                .build();

        /*
          추가) 팀+보드+리스트 생성 트랜잭션
         */

        // 4) DB 저장
        userMapper.insertUser(user);

        // 5) 이메일 인증 토큰 생성
        String token = UUID.randomUUID().toString();

        // 6) Redis에 token -> userId 저장
        emailVerificationService.saveToken(token, user.getId());

        // 7) 인증 메일 발송
        emailService.sendVerificationEmail(user.getEmail(), token);
    }

    @Override
    @Transactional
    public void verifyEmailToken(String token) {

        // 1) Redis에서 token으로 userId, expireTime 조회
        Long userId = emailVerificationService.getUserIdByToken(token);
        LocalDateTime expireTime = emailVerificationService.getExpireTimeByToken(token);

        // -- 만료 여부 확인 --
        if (expireTime == null) {
            // TTL 종료 -> 완전히 만료된 토큰
            throw new BusinessException(ErrorCode.EXPIRED_VERIFICATION_TOKEN);
        }

        /**
         * Redis TTL은 key의 삭제 시점만 관리하기 때문에 만료 직전에는 key가 존재할 수 있음
         * -> 만료되기 직전에 인증을 시도하여, 현재 시간이 만료 예정 시간을 넘길 수도 있음
         * -> 만료된 토큰인데도 정상 인증이 가능해지는 경우를 방지
         */
        if (LocalDateTime.now().isAfter(expireTime)) {
            throw new BusinessException(ErrorCode.EXPIRED_VERIFICATION_TOKEN);
        }

        // -- 잘못된 토큰 --
        if (userId == null) {
            throw new BusinessException(ErrorCode.INVALID_VERIFICATION_TOKEN);
        }

        // 2) 사용자 조회
        UserVo user = userMapper.findById(userId);

        if (user == null) {
            // 존재하지 않는 사용자인 경우
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        if (user.getVerifyStatus() == VerifyStatus.VERIFIED) {
            // 이미 인증된 사용자인 경우
            throw new BusinessException(ErrorCode.ALREADY_VERIFIED);
        }

        // -- 인증 성공 --
        // 3) user.verifyStatus 업데이트 (PENDING -> VERIFIED)
        userMapper.updateVerifyStatus(userId, VerifyStatus.VERIFIED);

        // 4) Redis에서 토큰 삭제
        emailVerificationService.deleteToken(token);
    }

}
