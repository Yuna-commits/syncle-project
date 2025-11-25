package com.nullpointer.domain.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class PasswordRequest {

    // 비밀번호 재설정 (로그아웃 상태)
    @Getter
    @NoArgsConstructor
    public static class Reset {

        @NotBlank(message = "이메일은 필수 입력 값입니다.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        private String email;

        @NotBlank
        private String resetToken;

        @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,20}$",
                message = "비밀번호는 8~20자, 영문과 숫자를 포함해야 합니다.")
        private String newPassword;

    }

    // 비밀번호 변경 (로그인 상태 - 마이페이지)
    @Getter
    @NoArgsConstructor
    public static class Change {

        @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
        private String currentPassword;

        @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,20}$",
                message = "비밀번호는 8~20자, 영문과 숫자를 포함해야 합니다.")
        private String newPassword;

    }

}
