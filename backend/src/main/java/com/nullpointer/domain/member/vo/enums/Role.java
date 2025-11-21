package com.nullpointer.domain.member.vo.enums;

import lombok.Getter;

@Getter
public enum Role {
    OWNER("팀 관리자"), MEMBER("팀 멤버"), VIEWER("조회 전용");

    private final String label;

    Role(String label) {
        this.label = label;
    }
}