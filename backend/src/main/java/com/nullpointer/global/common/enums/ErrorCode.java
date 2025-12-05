package com.nullpointer.global.common.enums;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // 공통
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C001", "서버 내부 오류가 발생했습니다."),
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C002", "요청 값이 올바르지 않습니다."),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "C003", "허용되지 않은 HTTP 메서드입니다."),
    INVALID_TYPE_VALUE(HttpStatus.BAD_REQUEST, "C004", "올바르지 않은 JSON 형식입니다."),

    // 인증/인가
    // - 토큰
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "A001", "유효하지 않은 토큰입니다."), // Access Token 등 일반적 오류
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "A002", "유효하지 않은 리프레시 토큰입니다."), // 재로그인 필요
    REFRESH_TOKEN_NOT_FOUND(HttpStatus.UNAUTHORIZED, "A003", "존재하지 않거나 만료된 리프레시 토큰입니다."), // 재로그인 필요

    // - 이메일 인증
    INVALID_VERIFICATION_TOKEN(HttpStatus.BAD_REQUEST, "A004", "유효하지 않은 인증 토큰입니다."), // URL 조작 등
    EXPIRED_VERIFICATION_TOKEN(HttpStatus.BAD_REQUEST, "A005", "만료된 인증 토큰입니다."), // 시간 초과
    ALREADY_VERIFIED(HttpStatus.BAD_REQUEST, "A006", "이미 이메일 인증이 완료된 계정입니다."),
    EMAIL_NOT_VERIFIED(HttpStatus.UNAUTHORIZED, "A007", "이메일 인증이 완료되지 않은 계정입니다."),
    SOCIAL_ACCOUNT_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "A008", "소셜 로그인 계정입니다."),

    // 비즈니스
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U001", "존재하지 않는 사용자입니다."),
    USER_EMAIL_DUPLICATE(HttpStatus.BAD_REQUEST, "U002", "이미 사용 중인 이메일입니다."),
    USER_NICKNAME_DUPLICATE(HttpStatus.BAD_REQUEST, "U003", "이미 사용 중인 닉네임입니다."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "U004", "올바르지 않은 비밀번호입니다."),
    SAME_AS_OLD_PASSWORD(HttpStatus.BAD_REQUEST, "U005", "기존 비밀번호와 동일한 비밀번호입니다."),
    LOGIN_PROVIDER_MISMATCH(HttpStatus.UNAUTHORIZED, "U006", "올바르지 않은 로그인 방식입니다."),
    USER_STATUS_NOT_ACTIVE(HttpStatus.FORBIDDEN, "U007", "현재 계정 상태에서는 로그인할 수 없습니다."),

    // 팀
    TEAM_NOT_FOUND(HttpStatus.NOT_FOUND, "T001", "존재하지 않는 팀입니다."),
    TEAM_DELETED(HttpStatus.GONE, "T002", "삭제된 팀입니다."),
    TEAM_UPDATE_FORBIDDEN(HttpStatus.FORBIDDEN, "T003", "팀 수정 권한이 없습니다."),
    TEAM_DELETE_FORBIDDEN(HttpStatus.FORBIDDEN, "T004", "팀 삭제 권한이 없습니다."),
    TEAM_ACCESS_DENIED(HttpStatus.FORBIDDEN, "T005", "해당 팀에 대한 접근 권한이 없습니다."),

    // 보드
    BOARD_NOT_FOUND(HttpStatus.NOT_FOUND, "B001", "존재하지 않는 보드입니다."),
    BOARD_TEAM_MISMATCH(HttpStatus.BAD_REQUEST, "B002", "해당 팀에 속한 보드가 아닙니다."),
    BOARD_DELETED(HttpStatus.GONE, "B003", "삭제된 보드입니다."),
    BOARD_UPDATE_FORBIDDEN(HttpStatus.FORBIDDEN, "B004", "보드 수정 권한이 없습니다."),
    BOARD_DELETE_FORBIDDEN(HttpStatus.FORBIDDEN, "B005", "보드 삭제 권한이 없습니다."),
    BOARD_ACCESS_DENIED(HttpStatus.FORBIDDEN, "B006", "보드 접근 권한이 없습니다."),
    BOARD_LIMIT_EXCEEDED(HttpStatus.BAD_REQUEST, "B007", "팀 내 생성 가능한 보드 개수를 초과했습니다."),

    // 멤버 (Team/Board 공통 사용 가능)
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "M001", "존재하지 않는 멤버입니다."),
    MEMBER_ALREADY_EXISTS(HttpStatus.CONFLICT, "M002", "이미 존재하는 멤버입니다."),
    MEMBER_INVITE_UPDATE_FORBIDDEN(HttpStatus.FORBIDDEN, "M003", "초대 상태를 변경할 권한이 없습니다."),
    MEMBER_INVITE_FORBIDDEN(HttpStatus.FORBIDDEN, "M004", "멤버 초대 권한이 없습니다."),
    MEMBER_UPDATE_FORBIDDEN(HttpStatus.FORBIDDEN, "M005", "멤버 정보 수정 권한이 없습니다."),
    MEMBER_DELETE_FORBIDDEN(HttpStatus.FORBIDDEN, "M006", "멤버 추방/탈퇴 권한이 없습니다."),
    LAST_OWNER_CANNOT_LEAVE(HttpStatus.FORBIDDEN, "M007", "마지막 관리자는 탈퇴할 수 없습니다."),

    // 초대
    INVITATION_NOT_FOUND(HttpStatus.NOT_FOUND, "I001", "존재하지 않거나 만료된 초대장입니다."),
    INVITATION_ALREADY_SENT(HttpStatus.CONFLICT, "I002", "이미 초대 요청을 보낸 사용자입니다."),
    INVITATION_ALREADY_MEMBER(HttpStatus.CONFLICT, "I003", "이미 해당 팀의 멤버인 사용자입니다."),
    INVITATION_EMAIL_MISMATCH(HttpStatus.BAD_REQUEST, "I004", "초대된 이메일과 로그인 계정이 일치하지 않습니다."),
    CANNOT_INVITE_SELF(HttpStatus.BAD_REQUEST, "I005", "본인에게는 초대장을 보낼 수 없습니다."),
    INVITATION_MISMATCH(HttpStatus.BAD_REQUEST, "I006", "초대받은 사용자 정보와 일치하지 않습니다."),
    INVITATION_EXPIRED(HttpStatus.BAD_REQUEST, "I007", "유효 기간이 만료된 초대장입니다."),
    INVITATION_ALREADY_PROCESSED(HttpStatus.CONFLICT, "I008", "이미 처리된(수락/거절) 초대장입니다."),

    // 즐겨찾기
    FAVORITE_LIMIT_EXCEEDED(HttpStatus.BAD_REQUEST, "B007", "즐겨찾기 가능한 개수를 초과했습니다."),

    // 카드
    CARD_NOT_FOUND(HttpStatus.NOT_FOUND, "CD001", "존재하지 않는 카드입니다."),
    CARD_DELETED(HttpStatus.GONE, "CD002", "삭제된 카드입니다.");


    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }

}
