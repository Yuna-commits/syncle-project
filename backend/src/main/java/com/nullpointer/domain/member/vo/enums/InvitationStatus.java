package com.nullpointer.domain.member.vo.enums;

import lombok.Getter;

@Getter
public enum InvitationStatus {
    ACCEPTED("수락"), PENDING("대기"), EXPIRED("거절");

    private final String label;

    InvitationStatus(String label) {
        this.label = label;
    }
}