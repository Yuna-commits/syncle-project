package com.nullpointer.domain.auth.controller;

import com.nullpointer.domain.auth.dto.request.AuthRequest;
import com.nullpointer.domain.auth.dto.request.PasswordRequest;
import com.nullpointer.domain.auth.dto.request.VerificationRequest;
import com.nullpointer.domain.auth.dto.response.LoginResponse;
import com.nullpointer.domain.auth.dto.response.PasswordVerifyResponse;
import com.nullpointer.domain.auth.service.AuthService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.enums.VerificationType;
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
    // 회원가입 (정보 저장 + 코드 발송)
    @PostMapping("/signup")
    public ApiResponse<String> signup(@Valid @RequestBody AuthRequest.Signup req) {
        authService.signup(req); // 내부에서 sendVerificationCode 호출
        return ApiResponse.success("인증 코드 발송 성공");
    }

    // 인증코드 재발송 (이메일만 사용, 프론트에서 시간 제한)
    @PostMapping("/signup/resend")
    public ApiResponse<String> resendSignupCode(@Valid @RequestBody VerificationRequest.EmailOnly req) {
        authService.sendVerificationCode(req.getEmail(), VerificationType.SIGNUP);
        return ApiResponse.success("인증 코드 발송 성공");
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
    public ApiResponse<LoginResponse> googleLogin(@Valid @RequestBody VerificationRequest.Token req) {
        LoginResponse response = authService.googleLogin(req.getToken());
        return ApiResponse.success(response);
    }

    // 로그아웃
    @PostMapping("/logout")
    public ApiResponse<String> logout(@RequestHeader(value = "Authorization", required = false) String bearerToken) {
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
    public ApiResponse<LoginResponse> reissue(@Valid @RequestBody VerificationRequest.Token req) {
        LoginResponse response = authService.reissue(req.getToken());
        return ApiResponse.success(response);
    }

    /**
     * 비밀번호 재설정
     */
    // 인증코드 발송
    @PostMapping("/password/code")
    public ApiResponse<String> sendPasswordResetCode(@Valid @RequestBody VerificationRequest.EmailOnly req) {
        authService.sendVerificationCode(req.getEmail(), VerificationType.PASSWORD_RESET);
        return ApiResponse.success("인증 코드 발송 성공");
    }

    // 인증코드 재발송
    @PostMapping("/password/resend")
    public ApiResponse<String> resendPwResetCode(@Valid @RequestBody VerificationRequest.EmailOnly req) {
        authService.sendVerificationCode(req.getEmail(), VerificationType.PASSWORD_RESET);
        return ApiResponse.success("인증 코드 발송 성공");
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
