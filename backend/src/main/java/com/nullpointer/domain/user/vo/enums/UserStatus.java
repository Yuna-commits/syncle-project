package com.nullpointer.domain.user.vo.enums;

import lombok.Getter;

@Getter
public enum UserStatus {

    ACTIVATED("활성화"), DEACTIVATED("비활성화"), DELETED("탈퇴");

    private final String status;

    UserStatus(String status) {
        this.status = status;
    }

}
