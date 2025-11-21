package com.nullpointer.domain.user.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {

    private Long id;
    private String email;
    private String nickname;

    private String accessToken;
    private String refreshToken;

}
