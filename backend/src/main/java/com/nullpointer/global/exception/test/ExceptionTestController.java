package com.nullpointer.global.exception.test;

import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequestMapping("/test-exception")
public class ExceptionTestController {

    /**
     * 1) BusinessException 테스트
     */
    @GetMapping("/business")
    public void throwBusinessException() {
        throw new BusinessException(ErrorCode.BOARD_NOT_FOUND);
    }

    /**
     * 2) DTO 검증 (@Valid) → MethodArgumentNotValidException
     */
    @PostMapping("/valid-dto")
    public String throwMethodArgumentNotValidException(@Valid @RequestBody SampleRequest request) {
        return "OK";
    }

    @Getter
    public static class SampleRequest {
        @NotBlank(message = "name은 필수 값입니다.")
        private String name;

        @Min(value = 1, message = "age는 1 이상이어야 합니다.")
        private int age;
    }

    /**
     * 3) BindException 테스트 (@ModelAttribute 바인딩 실패)
     * → int 필드에 문자열을 넣으면 바인딩 실패 발생
     */
    @GetMapping("/bind")
    public String throwBindException(@ModelAttribute BindRequest request) {
        return "OK";
    }

    @Getter
    @Setter
    public static class BindRequest {
        private int age; // age=abc 로 요청하면 BindException 발생
    }

    /**
     * 4) ConstraintViolationException 테스트
     * (단일 파라미터 검증 실패 @RequestParam)
     * ※ @Validated 가 클래스 레벨에 필요함 — 아래 주석 참고
     */
    @GetMapping("/constraint")
    public String throwConstraintViolation(@RequestParam @Min(1) int id) {
        return "OK";
    }

    /**
     * 5) HttpRequestMethodNotSupportedException 테스트
     * - GET만 허용하는데 POST로 호출하면 발생함
     */
    @GetMapping("/method-not-allowed")
    public String methodNotAllowed() {
        return "GET OK";
    }

    /**
     * 6) HttpMessageNotReadableException 테스트 (JSON 파싱 오류)
     * - 의도적으로 잘못된 JSON 전달 시 발생
     */
    @PostMapping("/json-error")
    public String throwHttpMessageNotReadable(@RequestBody SampleRequest request) {
        return "OK";
    }

//    /**
//     * 7) AccessDeniedException 테스트
//     * (Spring Security에서 발생하는 예외)
//     */
//    @GetMapping("/access-denied")
//    public void throwAccessDenied() {
//        throw new AccessDeniedException("접근 권한 없음");
//    }

    /**
     * 8) 나머지 예외 → Exception.class 핸들러
     */
    @GetMapping("/unknown")
    public String throwUnknownException() {
        throw new RuntimeException("알 수 없는 서버 오류 발생 테스트");
    }

}
