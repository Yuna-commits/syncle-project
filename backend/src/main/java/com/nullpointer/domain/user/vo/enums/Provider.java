package com.nullpointer.domain.user.vo.enums;

import lombok.Getter;

@Getter
public enum Provider {

    LOCAL("이메일"), GOOGLE("구글");

    private final String label;

    Provider(String label) {
        this.label = label;
    }

}