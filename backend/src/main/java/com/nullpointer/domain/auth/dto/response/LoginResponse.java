package com.nullpointer.domain.auth.dto.response;

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
