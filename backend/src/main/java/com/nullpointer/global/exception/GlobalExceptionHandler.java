package com.nullpointer.global.exception;

import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.enums.ErrorCode;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Map;


@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 1) 비즈니스 예외 처리
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException ex) {
        log.warn("비즈니스 로직 예외 발생: {}", ex.getMessage());

        return ResponseEntity
                .status(ex.getErrorCode().getStatus())
                .body(ApiResponse.error(ex.getErrorCode()));
    }

    /**
     * 2) @Valid, @Validated 바인딩 실패 (DTO 필드 검증 오류)
     * -> 필드별 상세 에러 반환
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
        // Map List 필드 에러
        // ex) [{"field": "email", "reason": "잘못된 이메일 형식"}, ...]
        List<Map<String, String>> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> Map.of(
                        "field", error.getField(),
                        "reason", error.getDefaultMessage()))
                .toList();

        log.warn("DTO 필드 유효성 검증 실패: {}", errors);

        return ResponseEntity
                .status(ErrorCode.INVALID_INPUT_VALUE.getStatus())
                .body(ApiResponse.error(ErrorCode.INVALID_INPUT_VALUE, errors)); // 에러 상세 목록 전달
    }

    /**
     * 3, 4) 단일 파라미터 검증 실패(@RequestParam, @PathVariable 등)
     */
    @ExceptionHandler({BindException.class, ConstraintViolationException.class})
    public ResponseEntity<ApiResponse<Void>> handleBindException(Exception ex) {
        log.warn("단일 파라미터 값 바인딩/검증 실패: {}", ex.getMessage());

        return ResponseEntity
                .status(ErrorCode.INVALID_INPUT_VALUE.getStatus())
                .body(ApiResponse.error(ErrorCode.INVALID_INPUT_VALUE));
    }

//    /**
//     * 5) 지원하지 않는 HTTP 메서드 요청
//     */
//    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
//    public ResponseEntity<ApiResponse<Void>> handleHttpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException ex) {
//        log.warn("지원되지 않는 HTTP 메서드 요청: {}", ex.getMessage());
//
//        ApiResponse<Void> body = ApiResponse.error(ErrorCode.METHOD_NOT_ALLOWED);
//        return new ResponseEntity<>(body, ErrorCode.METHOD_NOT_ALLOWED.getStatus());
//    }
//

    /**
     * 6) JSON 파싱 오류 등 바디 형식이 잘못된 경우
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex) {
        log.warn("JSON 파싱 실패: {}", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ErrorCode.INVALID_TYPE_VALUE));
    }

    /**
     * 7) Spring Security 인가 예외 (권한 부족)
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException ex) {
        log.warn("권한이 없는 접근: {}", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(ErrorCode.UNAUTHORIZED_ACCESS));
    }

    /**
     * 8) 나머지 예외 처리 (서버 오류)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception ex) {
        log.error("서버 오류 발생: ", ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(ErrorCode.INTERNAL_SERVER_ERROR));
    }

}
