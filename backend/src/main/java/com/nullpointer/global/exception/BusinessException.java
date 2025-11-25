package com.nullpointer.global.exception;

import com.nullpointer.global.common.enums.ErrorCode;
import lombok.Getter;

/**
 * 서비스/도메인 계층에서 이 예외만 던지면, GlobalExceptionHandler가 알아서 잡아서 응답 생성
 */
@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage()); // 기본 메시지를 부모 RuntimeException에 전달
        this.errorCode = errorCode;
    }

}
