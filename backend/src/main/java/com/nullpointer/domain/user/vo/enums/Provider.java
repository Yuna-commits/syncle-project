package com.nullpointer.domain.user.vo.enums;

import lombok.Getter;

@Getter
public enum Provider {

    LOCAL("이메일 로그인"), GOOGLE("구글 로그인");

    private final String type;

    Provider(String type) {
        this.type = type;
    }

}