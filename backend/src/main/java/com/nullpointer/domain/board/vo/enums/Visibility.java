package com.nullpointer.domain.board.vo.enums;

import lombok.Getter;

@Getter
public enum Visibility {
    PRIVATE("보드 멤버 공개"), TEAM("팀 멤버 공개");

    private final String label;

    Visibility(String label) {
        this.label = label;
    }
}




