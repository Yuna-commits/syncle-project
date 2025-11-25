package com.nullpointer.domain.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PasswordVerifyResponse {

    private String resetToken;

}
