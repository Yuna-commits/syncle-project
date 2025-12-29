package com.nullpointer.domain.auth.controller;

import com.nullpointer.domain.auth.dto.request.AuthRequest;
import com.nullpointer.domain.auth.dto.request.PasswordRequest;
import com.nullpointer.domain.auth.dto.request.VerificationRequest;
import com.nullpointer.domain.auth.dto.response.LoginResponse;
import com.nullpointer.domain.auth.dto.response.PasswordVerifyResponse;
import com.nullpointer.domain.auth.service.AuthService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import com.nullpointer.global.common.enums.VerificationType;
import com.nullpointer.global.security.jwt.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Auth", description = "인증/인가 관련 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 회원가입
     */
    // 회원가입 (정보 저장 + 코드 발송)
    @Operation(summary = "회원가입", description = "신규 회원 정보를 등록하고 이메일 인증 코드를 발송합니다.")
    @PostMapping("/signup")
    public ApiResponse<String> signup(@Valid @RequestBody AuthRequest.Signup req) {
        authService.signup(req); // 내부에서 sendVerificationCode 호출
        return ApiResponse.success("인증 코드 발송 성공");
    }

    // 인증코드 재발송 (이메일만 사용, 프론트에서 시간 제한)
    @Operation(summary = "회원가입 인증코드 재발송", description = "회원가입을 위한 이메일 인증 코드를 재발송합니다.")
    @PostMapping("/signup/resend")
    public ApiResponse<String> resendSignupCode(@Valid @RequestBody VerificationRequest.EmailOnly req) {
        authService.sendVerificationCode(req.getEmail(), VerificationType.SIGNUP);
        return ApiResponse.success("인증 코드 발송 성공");
    }

    // 인증코드 검증 & 자동 로그인
    @Operation(summary = "회원가입 인증 및 자동 로그인", description = "이메일 인증 코드를 검증하고, 성공 시 자동으로 로그인 처리합니다.")
    @PostMapping("/signup/verify")
    public ApiResponse<LoginResponse> verifySignup(@Valid @RequestBody VerificationRequest.Code req) {
        LoginResponse response = authService.verifySignup(req);
        return ApiResponse.success(response);
    }

    /**
     * 로그인
     */
    // 이메일 로그인
    @Operation(summary = "이메일 로그인", description = "이메일과 비밀번호로 로그인하여 액세스 토큰을 발급받습니다.")
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody AuthRequest.Login req) {
        LoginResponse response = authService.login(req);
        return ApiResponse.success(response);
    }

    // 구글 로그인
    @Operation(summary = "구글 로그인", description = "구글 ID 토큰을 검증하고 로그인 또는 회원가입을 처리합니다.")
    @PostMapping("/login/google")
    public ApiResponse<LoginResponse> googleLogin(@Valid @RequestBody VerificationRequest.Token req) {
        LoginResponse response = authService.googleLogin(req.getToken());
        return ApiResponse.success(response);
    }

    // 로그아웃
    @Operation(summary = "로그아웃", description = "액세스 토큰을 블랙리스트에 등록하고 리프레시 토큰을 삭제합니다.")
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
    @Operation(summary = "토큰 재발급", description = "리프레시 토큰을 사용하여 새로운 액세스 토큰과 리프레시 토큰을 발급받습니다.")
    @PostMapping("/token/refresh")
    public ApiResponse<LoginResponse> reissue(@Valid @RequestBody VerificationRequest.Token req) {
        LoginResponse response = authService.reissue(req.getToken());
        return ApiResponse.success(response);
    }

    // 구글 계정 연동
    @Operation(summary = "구글 계정 연동", description = "현재 로그인된 계정을 구글 계정과 연동합니다.")
    @PostMapping("/link/google")
    public ApiResponse<String> linkGoogleAccount(
            @LoginUser Long userId,
            @Valid @RequestBody VerificationRequest.Token req) {
        authService.linkGoogleAccount(req.getToken(), userId);
        return ApiResponse.success("구글 계정 연동 성공");
    }

    /**
     * 비밀번호 재설정
     */
    // 인증코드 발송
    @Operation(summary = "비밀번호 재설정 인증코드 발송", description = "비밀번호 재설정을 위해 이메일로 인증 코드를 발송합니다.")
    @PostMapping("/password/code")
    public ApiResponse<String> sendPasswordResetCode(@Valid @RequestBody VerificationRequest.EmailOnly req) {
        authService.sendVerificationCode(req.getEmail(), VerificationType.PASSWORD_RESET);
        return ApiResponse.success("인증 코드 발송 성공");
    }

    // 인증코드 재발송
    @Operation(summary = "비밀번호 재설정 인증코드 재발송", description = "비밀번호 재설정 인증 코드를 재발송합니다.")
    @PostMapping("/password/resend")
    public ApiResponse<String> resendPwResetCode(@Valid @RequestBody VerificationRequest.EmailOnly req) {
        authService.sendVerificationCode(req.getEmail(), VerificationType.PASSWORD_RESET);
        return ApiResponse.success("인증 코드 발송 성공");
    }

    // 인증코드 검증 & 임시 토큰 발급
    @Operation(summary = "비밀번호 재설정 인증 검증", description = "인증 코드를 검증하고 비밀번호 변경을 위한 임시 토큰을 발급합니다.")
    @PostMapping("/password/verify")
    public ApiResponse<PasswordVerifyResponse> verifyPwCode(@Valid @RequestBody VerificationRequest.Code req) {
        PasswordVerifyResponse response = authService.verifyPasswordResetCode(req);
        return ApiResponse.success(response);
    }

    // 비밀번호 재설정
    @Operation(summary = "비밀번호 재설정", description = "임시 토큰을 사용하여 비밀번호를 변경합니다.")
    @PatchMapping("/password/reset")
    public ApiResponse<String> resetPw(@Valid @RequestBody PasswordRequest.Reset req) {
        authService.resetPassword(req);
        return ApiResponse.success("비밀번호 재설정 성공");
    }

    /**
     * 이메일 인증 링크 발송
     */
    @Operation(summary = "이메일 인증 링크 발송", description = "보안 설정을 위해 이메일 인증 링크를 발송합니다.")
    @PostMapping("/email/verification")
    public ApiResponse<String> sendEmailVerificationLink(@Valid @RequestBody VerificationRequest.EmailOnly req) {
        authService.sendEmailVerificationLink(req);
        return ApiResponse.success("인증 메일 재발송 성공");
    }

    /**
     * 인증 링크 검증
     */
    @Operation(summary = "이메일 링크 인증", description = "이메일 인증 링크를 검증하여 인증 상태를 업데이트합니다.")
    @PostMapping("/email/verify")
    public ApiResponse<String> verifyEmailLink(@RequestParam String token) {
        authService.verifyEmailLink(token);
        return ApiResponse.success("이메일 인증 완료");
    }

}
