package com.nullpointer.domain.activity.vo.enums;

import lombok.Getter;

@Getter
public enum ActivityType {

    // 1. 카드 작업
    CREATE_CARD("카드 생성"),
    UPDATE_CARD_TITLE("카드 제목 수정"),
    UPDATE_CARD_DESCRIPTION("카드 설명 수정"),
    UPDATE_CARD_STATUS("카드 상태 변경"), // 완료 여부 등
    UPDATE_CARD_DUE_DATE("마감일 변경"),
    MOVE_CARD("카드 이동"),
    DELETE_CARD("카드 삭제"),
    COMPLETE_CARD("카드 작업 완료"),

    // 2. 댓글
    CREATE_COMMENT("댓글을 남겼습니다."),
    DELETE_COMMENT("댓글을 삭제했습니다."),
    // UPLOAD_FILE("파일을 첨부했습니다."), // (추후 구현 시 추가)

    // 3. 멤버/권한
    INVITE_MEMBER("멤버 초대"),
    KICK_MEMBER("멤버 방출"),
    UPDATE_MEMBER_ROLE("멤버 권한 변경"),

    // 4. 구조 변경
    CREATE_BOARD("보드 생성"),
    UPDATE_BOARD("보드 설정 변경"),
    DELETE_BOARD("보드 삭제"),

    CREATE_LIST("리스트 생성"),
    DELETE_LIST("리스트 삭제"),

    // 5. 팀 관리
    CREATE_TEAM("팀 생성"),
    UPDATE_TEAM("팀 설정 변경");

    private final String description;

    ActivityType(String description) {
        this.description = description;
    }

}
