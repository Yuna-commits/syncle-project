package com.nullpointer.domain.notification.vo.enums;

import lombok.Getter;

@Getter
public enum NotificationType {

    CARD_ASSIGNED("담당자 지정"),
    CARD_MOVED("카드 이동"),
    CARD_UPDATED("카드 수정"),

    COMMENT("새 댓글"),
    COMMENT_REPLY("답글"),

    MENTION("멘션"),

    DEADLINE_NEAR("마감 임박"),
    TEAM_INVITE("팀 초대");

    private final String label;

    NotificationType(String label) {
        this.label = label;
    }

}
