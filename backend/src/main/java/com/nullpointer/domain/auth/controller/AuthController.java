package com.nullpointer.domain.auth.controller;

import com.nullpointer.domain.auth.dto.request.LoginRequest;
import com.nullpointer.domain.auth.dto.request.SignupRequest;
import com.nullpointer.domain.auth.dto.response.LoginResponse;
import com.nullpointer.domain.auth.service.AuthService;
import com.nullpointer.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 회원가입
    @PostMapping("/register")
    public ApiResponse<String> signup(@Valid @RequestBody SignupRequest req) {
        authService.signup(req);
        return ApiResponse.success("회원가입 성공");
    }

    // 이메일 인증
    @GetMapping("/email-verify")
    public ApiResponse<String> verifyEmail(@RequestParam String token) {
        authService.verifyEmailToken(token);
        return ApiResponse.success("이메일 인증 성공");
    }

    // 로그인
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        LoginResponse loginResponse = authService.login(req);
        return ApiResponse.success(loginResponse);
    }

}
