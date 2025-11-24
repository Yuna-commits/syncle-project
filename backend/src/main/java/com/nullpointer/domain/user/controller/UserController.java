package com.nullpointer.domain.user.controller;

import com.nullpointer.domain.user.dto.UserProfileResponse;
import com.nullpointer.domain.user.service.UserService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.security.jwt.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public ApiResponse<Boolean> checkEmailDuplicate(@RequestParam String email) {
        boolean isDuplicate = userService.existsByEmail(email);
        return ApiResponse.success(isDuplicate);
    }

    // 닉네임 중복 확인
    @GetMapping("/check-nickname")
    public ApiResponse<Boolean> checkNicknameDuplicate(@RequestParam String nickname) {
        boolean isDuplicate = userService.existsByNickname(nickname);
        return ApiResponse.success(isDuplicate);
    }

    // 내 정보 조회
    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        UserProfileResponse response = userService.getUserProfile(userDetails.getUserId());
        return ApiResponse.success(response);
    }

}
