package com.nullpointer.domain.user.controller;

import com.nullpointer.domain.user.service.UserService;
import com.nullpointer.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 이메일 중복 확인
    @GetMapping("/check-email")
    public ApiResponse<Boolean> checkEmail(@RequestParam String email) {
        boolean isDuplicate = userService.existsByEmail(email);
        return ApiResponse.success(isDuplicate);
    }

    // 닉네임 중복 확인
    @GetMapping("/check-nickname")
    public ApiResponse<Boolean> checkNickname(@RequestParam String nickname) {
        boolean isDuplicate = userService.existsByNickname(nickname);
        return ApiResponse.success(isDuplicate);
    }

}
