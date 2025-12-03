package com.nullpointer.domain.card.vo.enums;

import lombok.Getter;

@Getter
public enum Priority {

    High("높음"),
    Medium("보통"),
    Low("낮음");

    private final String label;

    Priority(String label) {
        this.label = label;
    }

}
