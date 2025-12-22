package com.nullpointer.domain.activity.vo.enums;

import lombok.Getter;

@Getter
public enum ActivityType {

    // 1. 카드 작업
    CREATE_CARD("카드 생성"),
    MOVE_CARD("카드 이동"),
    UPDATE_CARD("카드 수정"),
    DELETE_CARD("카드 삭제"),
    UPDATE_DUE_DATE("마감일 변경"),
    UPDATE_PRIORITY("중요도 변경"),
    COMPLETE_CARD("카드 완료"),
    UNCOMPLETE_CARD("카드 완료 취소"),

    // 2. 댓글
    ADD_COMMENT("댓글 작성"),
    ADD_REPLY("답글 작성"),

    // 3. 파일/체크리스트
    UPLOAD_FILE("파일 첨부"),
    CHECKLIST_COMPLETED("체크리스트 완료"),

    // 아카이브
    ARCHIVE_CARD("카드 보관"),
    RESTORE_CARD("카드 보관 복구"),

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
