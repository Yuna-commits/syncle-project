package com.nullpointer.global.common.enums;

import lombok.Getter;

@Getter
public enum SystemActor {
    NAME("SYNCLE"), IMAGE_KEY("SYNCLE_LOGO");

    private final String label;

    SystemActor(String label) {
        this.label = label;
    }
}
