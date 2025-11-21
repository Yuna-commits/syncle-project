package com.nullpointer.domain.user.controller;

import com.nullpointer.domain.user.dto.SignupRequest;
import com.nullpointer.domain.user.service.AuthService;
import com.nullpointer.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<String> signup(@Valid @RequestBody SignupRequest req) {
        authService.signup(req);
        return ApiResponse.success("회원가입 성공");
    }

    @GetMapping("/email-verify")
    public ApiResponse<String> verifyEmail(@RequestParam String token) {
        authService.verifyEmailToken(token);
        return ApiResponse.success("이메일 인증 성공");
    }

}
