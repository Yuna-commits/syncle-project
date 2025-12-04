package com.nullpointer.domain.card.vo.enums;

import lombok.Getter;

@Getter
public enum Priority {

    HIGH("높음"),
    MEDIUM("보통"),
    LOW("낮음");

    private final String label;

    Priority(String label) {
        this.label = label;
    }

}
