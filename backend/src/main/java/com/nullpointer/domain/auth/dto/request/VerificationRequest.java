package com.nullpointer.domain.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 인증 수단 처리
 */
public class VerificationRequest {

    // 이메일만 보내는 경우 (비밀번호 재설정 코드 요청 등)
    @Getter
    @NoArgsConstructor
    public static class EmailOnly {

        @NotBlank(message = "이메일은 필수 입력 값입니다.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        private String email;

    }

    // 이메일 + 인증 코드 (회원가입, 비밀번호 재설정 인증 공용)
    @Getter
    @NoArgsConstructor
    public static class Code {

        @NotBlank(message = "이메일은 필수 입력 값입니다.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        private String email;

        @NotBlank(message = "인증 코드는 필수 입력 값입니다.")
        private String authCode;

    }

    // 토큰만 보내는 경우 (재발급, 구글 로그인, 로그아웃 등)
    @Getter
    @NoArgsConstructor
    public static class Token {

        @NotBlank
        private String token; // refreshToken or idToken

    }

}
