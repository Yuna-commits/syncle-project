package com.nullpointer.domain.auth.dto.request;

import lombok.Getter;

@Getter
public class ReissueRequest {

    private String refreshToken; // 클라이언트에 저장되어 있던 토큰

}
