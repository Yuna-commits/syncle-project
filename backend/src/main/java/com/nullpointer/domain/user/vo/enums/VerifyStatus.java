package com.nullpointer.domain.user.vo.enums;

import lombok.Getter;

@Getter
public enum VerifyStatus {

    PENDING("보류"), VERIFIED("인증"), EXPIRED("만료"), REVOKED("취소");

    private final String label;

    VerifyStatus(String label) {
        this.label = label;
    }

}
