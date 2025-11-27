package com.nullpointer.domain.auth.service;

import com.nullpointer.domain.auth.dto.request.AuthRequest;
import com.nullpointer.domain.auth.dto.request.PasswordRequest;
import com.nullpointer.domain.auth.dto.request.VerificationRequest;
import com.nullpointer.domain.auth.dto.response.LoginResponse;
import com.nullpointer.domain.auth.dto.response.PasswordVerifyResponse;
import com.nullpointer.global.common.enums.VerificationType;

public interface AuthService {

    // 인증코드 발송
    void sendVerificationCode(String email, VerificationType type);

    /**
     * 회원가입
     */
    // 회원가입 (정보 저장 + 코드 발송)
    void signup(AuthRequest.Signup req);

    // 인증코드 검증 & 자동 로그인
    LoginResponse verifySignup(VerificationRequest.Code req);

    // 이메일 로그인
    LoginResponse login(AuthRequest.Login req);

    // 구글 로그인
    LoginResponse googleLogin(String idToken);

    // 로그아웃
    void logout(String accessToken);

    // 토큰 재발급
    LoginResponse reissue(String refreshToken);

    /**
     * 비밀번호 재설정
     */

    // 인증코드 검증 & 임시 토큰 발급
    PasswordVerifyResponse verifyPasswordResetCode(VerificationRequest.Code req);

    // 비밀번호 재설정
    void resetPassword(PasswordRequest.Reset req);

}
