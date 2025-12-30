package com.nullpointer.domain.auth.service.impl;

import com.nullpointer.domain.auth.dto.request.AuthRequest;
import com.nullpointer.domain.auth.service.RegistrationService;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.domain.user.vo.enums.VerifyStatus;
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
    public UserVo registerLocalUser(AuthRequest.Signup req) {
        // 1) 이메일로 기존 사용자 조회
        UserVo existingUser = userMapper.findByEmail(req.getEmail()).orElse(null);

        // 2) 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(req.getPassword());

        /**
         * 회원가입 시 중복 이메일을 입력한 경우,
         * 미인증 상태면 덮어씌우고 가입이 가능하도록 수정
         */
        // 3-1) 신규 회원인 경우
        if (existingUser == null) {
            return createNewUser(req, encodedPassword);
        }

        // 3-2) 이메일이 이미 존재하는 경우
        // A. 이미 인증 완료된 계정이면 에러
        if (existingUser.getVerifyStatus() == VerifyStatus.VERIFIED) {
            throw new BusinessException(ErrorCode.ALREADY_VERIFIED);
        }

        // B. 미인증 계정이면 정보 덮어쓰기 (재가입 시도)
        return updatePendingUser(existingUser, req, encodedPassword);
    }

    private UserVo createNewUser(AuthRequest.Signup req, String encodedPassword) {
        // 닉네임 중복 확인
        validateNicknameForSignup(req.getNickname(), null);

        UserVo newUser = UserVo.builder()
                .email(req.getEmail())
                .password(encodedPassword)
                .nickname(req.getNickname())
                .build();

        // DB 저장
        userMapper.insertUser(newUser);

        return newUser;
    }

    private UserVo updatePendingUser(UserVo user, AuthRequest.Signup req, String encodedPassword) {
        // 닉네임이 변경되었으면 중복 확인
        if (!user.getNickname().equals(req.getNickname())) {
            // 중복된 닉네임이어도 사용자가 '나'이면 예외
            validateNicknameForSignup(req.getNickname(), user.getEmail());
            user.setNickname(req.getNickname());
        }

        // 정보 덮어쓰기
        user.setPassword(encodedPassword);

        // DB 업데이트
        userMapper.updateUser(user);

        return user;
    }

    // 닉네임 정밀 검사
    private void validateNicknameForSignup(String nickname, String myEmail) {
        userMapper.findByNickname(nickname).ifPresent(user -> {
            // 이미 인증된 사용자가 쓰고 있는 경우 -> 중복
            if (user.getVerifyStatus() == VerifyStatus.VERIFIED) {
                throw new BusinessException(ErrorCode.USER_NICKNAME_DUPLICATE);
            }
            // 미인증 사용자가 쓰고 있는데 나의 계정이 아닌 경우 -> 중복(선점됨)
            if (!user.getEmail().equals(myEmail)) {
                throw new BusinessException(ErrorCode.USER_NICKNAME_DUPLICATE);
            }
            // 통과
        });
    }
}
