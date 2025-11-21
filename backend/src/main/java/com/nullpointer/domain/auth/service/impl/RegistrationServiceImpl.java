package com.nullpointer.domain.auth.service.impl;

import com.nullpointer.domain.auth.service.EmailVerificationService;
import com.nullpointer.domain.auth.service.RegistrationService;
import com.nullpointer.domain.user.dto.SignupRequest;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final EmailVerificationService emailVerificationService; // Redis 서비스

    @Override
    public RegistrationResult registerLocalUser(SignupRequest req) {

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

        /**
         * 추가) 팀+보드+리스트 생성 트랜잭션
         */

        // 4) DB 저장
        userMapper.insertUser(user);

        // 5) 이메일 인증 토큰 생성
        String token = UUID.randomUUID().toString();

        // 6) Redis에 token -> (userId, expireTime) 저장
        emailVerificationService.saveToken(token, user.getId());

        return new RegistrationResult(user, token);
    }
}
