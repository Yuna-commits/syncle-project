package com.nullpointer.domain.invitation.vo.enums;

import lombok.Getter;

@Getter
public enum Status {
    ACCEPTED("수락"), PENDING("대기"), REJECTED("거절"), EXPIRED("만료");

    private final String label;

    Status(String label) {
        this.label = label;
    }
}