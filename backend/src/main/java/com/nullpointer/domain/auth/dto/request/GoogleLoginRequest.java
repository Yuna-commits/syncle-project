package com.nullpointer.domain.auth.dto.request;

import lombok.Getter;

@Getter
public class GoogleLoginRequest {

    private String idToken; // 프론트에서 받은 JWT 문자열

}
