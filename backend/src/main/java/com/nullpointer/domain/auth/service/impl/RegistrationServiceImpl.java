package com.nullpointer.domain.auth.service.impl;

import com.nullpointer.domain.auth.dto.request.SignupRequest;
import com.nullpointer.domain.auth.service.RegistrationService;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    public UserVo registerLocalUser(SignupRequest req) {

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
        UserVo newUser = UserVo.builder()
                .email(req.getEmail())
                .password(encodedPassword)
                .nickname(req.getNickname())
                .build();

        // 4) DB 저장
        userMapper.insertUser(newUser);

        /**
         * 추가) 팀+보드+리스트 생성 트랜잭션
         */

        return newUser;
    }
}
