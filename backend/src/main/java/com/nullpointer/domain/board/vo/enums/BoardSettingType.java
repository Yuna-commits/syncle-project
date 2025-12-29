package com.nullpointer.domain.board.vo.enums;

import lombok.Getter;

@Getter
public enum BoardSettingType {

    MEMBER_INVITE("멤버 초대 권한"),
    BOARD_SHARE("보드 공유 권한"),
    LIST_EDIT("리스트 추가/수정 권한"),
    CARD_DELETE("카드 삭제 권한");

    private final String label;

    BoardSettingType(String label) {
        this.label = label;
    }

}
