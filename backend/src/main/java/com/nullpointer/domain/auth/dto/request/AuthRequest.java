package com.nullpointer.domain.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 계정 정보 입력 DTO
 */
public class AuthRequest {

    @Getter
    @NoArgsConstructor
    public static class Login {

        @NotBlank(message = "이메일은 필수 입력 값입니다.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        private String email;

        @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,20}$",
                message = "비밀번호는 8~20자, 영문과 숫자를 포함해야 합니다.")
        private String password;

    }

    @Getter
    @NoArgsConstructor
    public static class Signup {
        
        @NotBlank(message = "이메일은 필수 입력 값입니다.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        private String email;

        @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,20}$",
                message = "비밀번호는 8~20자, 영문과 숫자를 포함해야 합니다.")
        private String password;

        @NotBlank(message = "닉네임은 필수 입력 값입니다.")
        @Size(min = 2, max = 20, message = "닉네임은 2~20자여야 합니다.")
        private String nickname;

    }

}
