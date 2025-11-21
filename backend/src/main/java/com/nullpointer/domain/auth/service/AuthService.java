package com.nullpointer.domain.auth.service;

import com.nullpointer.domain.user.dto.LoginRequest;
import com.nullpointer.domain.user.dto.LoginResponse;
import com.nullpointer.domain.user.dto.SignupRequest;

public interface AuthService {

    // 회원가입
    void signup(SignupRequest req);

    // 이메일 인증
    void verifyEmailToken(String token);

    // 로그인
    LoginResponse login(LoginRequest req);

}
