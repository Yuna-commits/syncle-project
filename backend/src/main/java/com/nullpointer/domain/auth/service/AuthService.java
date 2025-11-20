package com.nullpointer.domain.auth.service;

import com.nullpointer.domain.auth.dto.SignupRequest;

public interface AuthService {

    // 회원가입
    void signup(SignupRequest signupRequest);

}
