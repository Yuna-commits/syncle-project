package com.nullpointer.domain.auth.controller;

import com.nullpointer.domain.auth.dto.request.AuthRequest;
import com.nullpointer.domain.auth.dto.request.PasswordRequest;
import com.nullpointer.domain.auth.dto.request.VerificationRequest;
import com.nullpointer.domain.auth.dto.response.LoginResponse;
import com.nullpointer.domain.auth.dto.response.PasswordVerifyResponse;
import com.nullpointer.domain.auth.service.AuthService;
import com.nullpointer.global.common.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 회원가입
     */
    // 인증코드 발송
    @PostMapping("/signup/code")
    public ApiResponse<String> sendSignupCode(@Valid @RequestBody AuthRequest.Signup req) {
        authService.sendSignupCode(req);
        return ApiResponse.success("이메일 인증 코드 발송 성공");
    }

    // 인증코드 검증 & 자동 로그인
    @PostMapping("/signup/verify")
    public ApiResponse<LoginResponse> verifySignup(@Valid @RequestBody VerificationRequest.Code req) {
        LoginResponse response = authService.verifySignup(req);
        return ApiResponse.success(response);
    }

    /**
     * 로그인
     */
    // 이메일 로그인
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody AuthRequest.Login req) {
        LoginResponse response = authService.login(req);
        return ApiResponse.success(response);
    }

    // 구글 로그인
    @PostMapping("/login/google")
    public ApiResponse<LoginResponse> googleLogin(@RequestBody VerificationRequest.Token req) {
        LoginResponse response = authService.googleLogin(req.getToken());
        return ApiResponse.success(response);
    }

    // 로그아웃
    @PostMapping("/logout")
    public ApiResponse<String> logout(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        // 헤더에서 Bearer 제거
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String accessToken = bearerToken.substring(7);
            authService.logout(accessToken);
        }

        return ApiResponse.success("로그아웃 성공");
    }

    // 토큰 재발급
    // 클라이언트가 보낸 Refresh Token을 받아 서비스에 전달, 갱신된 토큰 세트를 응답
    @PostMapping("/token/refresh")
    public ApiResponse<LoginResponse> reissue(@RequestBody VerificationRequest.Token req) {
        LoginResponse response = authService.reissue(req.getToken());
        return ApiResponse.success(response);
    }

    /**
     * 비밀번호 재설정
     */
    // 인증코드 발송
    @PostMapping("/password/code")
    public ApiResponse<String> sendPwCode(@Valid @RequestBody VerificationRequest.EmailOnly req) {
        authService.sendPasswordResetCode(req);
        return ApiResponse.success("비밀번호 재설정 인증 코드 발송 성공");
    }

    // 인증코드 검증 & 임시 토큰 발급
    @PostMapping("/password/verify")
    public ApiResponse<PasswordVerifyResponse> verifyPwCode(@Valid @RequestBody VerificationRequest.Code req) {
        PasswordVerifyResponse response = authService.verifyPasswordResetCode(req);
        return ApiResponse.success(response);
    }

    // 비밀번호 재설정
    @PatchMapping("/password/reset")
    public ApiResponse<String> resetPw(@Valid @RequestBody PasswordRequest.Reset req) {
        authService.resetPassword(req);
        return ApiResponse.success("비밀번호 재설정 성공");
    }

}
