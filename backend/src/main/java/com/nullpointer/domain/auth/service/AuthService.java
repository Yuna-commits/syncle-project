package com.nullpointer.domain.auth.service;

import com.nullpointer.domain.auth.dto.request.LoginRequest;
import com.nullpointer.domain.auth.dto.request.SignupRequest;
import com.nullpointer.domain.auth.dto.response.LoginResponse;

public interface AuthService {

    // 회원가입
    void signup(SignupRequest req);

    // 이메일 인증
    void verifyEmailToken(String token);

    // 로그인
    LoginResponse login(LoginRequest req);

}
