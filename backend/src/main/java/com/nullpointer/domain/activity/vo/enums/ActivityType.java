package com.nullpointer.domain.activity.vo.enums;

import lombok.Getter;

@Getter
public enum ActivityType {

    // 1. 카드 작업
    CREATE_CARD("카드를 생성했습니다."),
    UPDATE_CARD("카드 상세를 수정했습니다."), // 중요도, 보관, 완료, 라벨, 이동 등 모든 변경사항 매핑
    ADD_COMMENT("댓글을 남겼습니다."),
    CHECKLIST_COMPLETED("체크리스트를 완료했습니다."),

    // 4. 멤버/권한
    INVITE_MEMBER("멤버를 초대했습니다."),
    ACCEPT_INVITE("팀에 초대를 수락했습니다."),
    REJECT_INVITE("팀 초대를 거절했습니다."),
    KICK_MEMBER("멤버를 추방했습니다."),
    UPDATE_MEMBER_ROLE("멤버 권한 변경"),

    // 5. 구조 변경
    CREATE_BOARD("보드를 생성했습니다."),
    UPDATE_BOARD("보드 정보를 수정했습니다,"),
    DELETE_BOARD("보드를 삭제했습니다."),

    JOIN_BOARD("보드 참여"),
    LEAVE_BOARD("보드 탈퇴"),

    CREATE_LIST("리스트를 생성했습니다."),
    DELETE_LIST("리스트를 삭제했습니다."),

    // 6. 팀 관리
    CREATE_TEAM("팀을 생성했습니다."),
    UPDATE_TEAM("팀 정보를 수정했습니다."),
    DELETE_TEAM("팀을 삭제했습니다."),


    LEAVE_TEAM("팀에서 탈퇴했습니다."),
    ;

    private final String description;

    ActivityType(String description) {
        this.description = description;
    }

}
