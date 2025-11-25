package com.nullpointer.global.common.enums;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // 공통
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C001", "서버 내부 오류가 발생했습니다."),
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C002", "요청 값이 올바르지 않습니다."),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "C003", "허용되지 않은 HTTP 메서드입니다."),

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

    // 비즈니스
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U001", "존재하지 않는 사용자입니다."),
    USER_EMAIL_DUPLICATE(HttpStatus.BAD_REQUEST, "U002", "이미 사용 중인 이메일입니다."),
    USER_NICKNAME_DUPLICATE(HttpStatus.BAD_REQUEST, "U003", "이미 사용 중인 닉네임입니다."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "U004", "올바르지 않은 비밀번호입니다."),
    LOGIN_PROVIDER_MISMATCH(HttpStatus.UNAUTHORIZED, "U005", "올바르지 않은 로그인 방식입니다."),
    USER_STATUS_NOT_ACTIVE(HttpStatus.FORBIDDEN, "U006", "현재 계정 상태에서는 로그인할 수 없습니다."),

    TEAM_NOT_FOUND(HttpStatus.NOT_FOUND, "T001", "존재하지 않는 팀입니다."),

    BOARD_NOT_FOUND(HttpStatus.NOT_FOUND, "B001", "존재하지 않는 보드입니다.");


    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }

}
