package com.nullpointer.domain.user.service;

import com.nullpointer.domain.user.dto.SignupRequest;

public interface AuthService {

    // 회원가입
    void signup(SignupRequest signupRequest);

}
