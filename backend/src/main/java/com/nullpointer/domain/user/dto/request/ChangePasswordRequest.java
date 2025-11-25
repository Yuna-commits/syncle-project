package com.nullpointer.domain.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;

@Getter
public class ChangePasswordRequest {

    @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
    private String currentPassword;

    @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,20}$",
            message = "비밀번호는 8~20자, 영문과 숫자를 포함해야 합니다.")
    private String newPassword;

}
