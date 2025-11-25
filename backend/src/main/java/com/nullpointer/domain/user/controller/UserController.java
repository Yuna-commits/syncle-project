package com.nullpointer.domain.user.controller;

import com.nullpointer.domain.auth.dto.request.PasswordRequest;
import com.nullpointer.domain.user.dto.request.UpdateProfileRequest;
import com.nullpointer.domain.user.dto.response.UserProfileResponse;
import com.nullpointer.domain.user.service.UserService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.security.jwt.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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

    // 내 정보 수정
    @PatchMapping("/me")
    public ApiResponse<String> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody UpdateProfileRequest req) {
        userService.updateProfile(userDetails.getUserId(), req);
        return ApiResponse.success("내 정보 수정 성공");
    }

    // 내 비밀번호 변경
    @PatchMapping("/password")
    public ApiResponse<String> changePassword(@AuthenticationPrincipal CustomUserDetails userDetails,
                                              @Valid @RequestBody PasswordRequest.Change req) {
        userService.changePassword(userDetails.getUserId(), req);
        return ApiResponse.success("비밀번호 변경 성공");
    }

}
