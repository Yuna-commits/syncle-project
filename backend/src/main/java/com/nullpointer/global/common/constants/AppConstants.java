package com.nullpointer.global.common.constants;

public class AppConstants {
    // 인스턴스화 방지
    private AppConstants() {
    }

    // 카드/리스트 생성 시 기본 순서값 (맨 뒤에 위치시키기 위함)
    public static final int DEFAULT_ORDER_INDEX = 9999;
}
