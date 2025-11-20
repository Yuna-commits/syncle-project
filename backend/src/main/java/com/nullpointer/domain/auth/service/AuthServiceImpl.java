package com.nullpointer.domain.auth.service;

import com.nullpointer.domain.auth.dto.SignupRequest;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Transactional
    @Override
    public void signup(SignupRequest req) {

        // 1. 이메일 중복 확인
        if (userMapper.existsByEmail(req.getEmail())) {
            throw new BusinessException(ErrorCode.USER_EMAIL_DUPLICATE);
        }

        // 2. 닉네임 중복 확인
        if (userMapper.existsByNickname(req.getNickname())) {
            throw new BusinessException(ErrorCode.USER_NICKNAME_DUPLICATE);
        }

        // 3. DTO -> VO
        UserVo user = UserVo.builder()
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword())) // 비밀번호 암호화
                .nickname(req.getNickname())
                .build();

        /*
          추가) 이메일 인증, 구글 회원가입, 팀+보드+리스트 생성 트랜잭션
         */
        
        // DB 저장
        userMapper.insertUser(user);
    }

}
