package com.nullpointer.domain.activity.vo.enums;

import lombok.Getter;

@Getter
public enum ActivityType {

    // 1. 카드 작업
    CREATE_CARD("카드를 생성했습니다."),
    UPDATE_CARD("카드를 수정했습니다."), // 중요도, 보관, 완료, 라벨, 이동 등 모든 변경사항 매핑
    ADD_COMMENT("댓글을 남겼습니다."),
    CHECKLIST_COMPLETED("체크리스트를 완료했습니다."),

    // 4. 멤버/권한
    INVITE_MEMBER("멤버 초대"),
    KICK_MEMBER("멤버 추방"),
    UPDATE_MEMBER_ROLE("멤버 권한 변경"),

    // 5. 구조 변경
    CREATE_BOARD("보드 생성"),
    UPDATE_BOARD("보드 설정 변경"),
    DELETE_BOARD("보드 삭제"),
    JOIN_BOARD("보드 참여"),
    LEAVE_BOARD("보드 탈퇴"),

    CREATE_LIST("리스트 생성"),
    DELETE_LIST("리스트 삭제"),

    // 6. 팀 관리
    CREATE_TEAM("팀 생성"),
    UPDATE_TEAM("팀 설정 변경"),
    JOIN_TEAM("팀 참여"),
    LEAVE_TEAM("팀 탈퇴"),
    ;

    private final String description;

    ActivityType(String description) {
        this.description = description;
    }

}
