package com.nullpointer.domain.notification.vo.enums;

import lombok.Getter;

@Getter
public enum NotificationType {

    CARD_ASSIGNED("담당자 지정"),
    CARD_MOVED("카드 이동"),
    CARD_UPDATED("카드 수정"),
    CHECKLIST_COMPLETED("체크리스트 완료"),

    COMMENT("댓글"),
    COMMENT_REPLY("답글"),

    MENTION("멘션"),

    DEADLINE_NEAR("마감 임박"),

    TEAM_INVITE("팀 초대"),
    INVITE_ACCEPTED("초대 수락"),
    INVITE_REJECTED("초대 거절"),
    TEAM_MEMBER_KICKED("팀 멤버 추방"),
    TEAM_MEMBER_LEFT("팀 멤버 탈퇴"),
    TEAM_DELETED("팀 삭제"),
    INVITE_CANCELED("초대 취소"),
    TEAM_NOTICE_CREATED("공지사항 등록"),

    BOARD_INVITE("보드 초대"),
    BOARD_MEMBER_KICKED("보드 멤버 추방"),
    BOARD_MEMBER_LEFT("보드 멤버 탈퇴"),
    BOARD_DELETED("보드 삭제"),

    LIST_ARCHIVED("리스트 보관"),

    PERMISSION_CHANGED("권한 변경"),

    FILE_UPLOAD("파일 업로드");

    private final String label;

    NotificationType(String label) {
        this.label = label;
    }

}
