package com.nullpointer.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // 공통
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C001", "서버 내부 오류가 발생했습니다."),
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C002", "요청 값이 올바르지 않습니다."),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "C003", "허용되지 않은 HTTP 메서드입니다."),

    // 인증/인가
    AUTHENTICATION_FAILED(HttpStatus.UNAUTHORIZED, "A001", "인증에 실패했습니다."),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "A002", "토큰이 만료되었습니다."),

    // 비즈니스
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U001", "존재하지 않는 사용자입니다."),
    TEAM_NOT_FOUND(HttpStatus.NOT_FOUND, "T001", "존재하지 않는 팀입니다."),
    BOARD_NOT_FOUND(HttpStatus.NOT_FOUND, "B001", "존재하지 않는 보드입니다."),

    // 중복
    USER_EMAIL_DUPLICATE(HttpStatus.BAD_REQUEST, "U002", "이미 사용 중인 이메일입니다."),
    USER_NICKNAME_DUPLICATE(HttpStatus.BAD_REQUEST, "U003", "이미 사용 중인 닉네임입니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }

}
