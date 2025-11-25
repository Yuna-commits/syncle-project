package com.nullpointer.global.common;

import com.nullpointer.global.common.enums.ErrorCode;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class ApiResponse<T> {

    private final String result;
    private final String message;
    private final T data;
    private final String errorCode;

    // 성공 응답
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(
                "success",
                null,
                data,
                null
        );
    }

    // 실패 응답
    public static <T> ApiResponse<T> error(ErrorCode errorCode) {
        return new ApiResponse<>(
                "fail",
                errorCode.getMessage(),
                null,
                errorCode.getCode()
        );
    }

}
