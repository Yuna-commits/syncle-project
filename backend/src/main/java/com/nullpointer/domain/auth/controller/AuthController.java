package com.nullpointer.domain.auth.controller;

import com.nullpointer.domain.auth.dto.request.GoogleLoginRequest;
import com.nullpointer.domain.auth.dto.request.LoginRequest;
import com.nullpointer.domain.auth.dto.request.ReissueRequest;
import com.nullpointer.domain.auth.dto.request.SignupRequest;
import com.nullpointer.domain.auth.dto.response.LoginResponse;
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

    // 이메일 로그인
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        LoginResponse response = authService.login(req);
        return ApiResponse.success(response);
    }

    // 구글 로그인
    @PostMapping("/login/google")
    public ApiResponse<LoginResponse> googleLogin(@RequestBody GoogleLoginRequest req) {
        LoginResponse response = authService.googleLogin(req.getIdToken());
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
    @PostMapping("/reissue")
    public ApiResponse<LoginResponse> reissue(@RequestBody ReissueRequest req) {
        LoginResponse response = authService.reissue(req.getRefreshToken());
        return ApiResponse.success(response);
    }

}
