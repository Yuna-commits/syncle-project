package com.nullpointer.domain.user.controller;

import com.nullpointer.domain.activity.dto.request.ActivityConditionRequest;
import com.nullpointer.domain.activity.dto.response.ActivityLogResponse;
import com.nullpointer.domain.activity.dto.response.ActivityStatsResponse;
import com.nullpointer.domain.activity.dto.response.TopBoardResponse;
import com.nullpointer.domain.activity.service.ActivityService;
import com.nullpointer.domain.auth.dto.request.AuthRequest;
import com.nullpointer.domain.auth.dto.request.PasswordRequest;
import com.nullpointer.domain.user.dto.request.UpdateProfileRequest;
import com.nullpointer.domain.user.dto.response.UserProfileResponse;
import com.nullpointer.domain.user.dto.response.UserSummaryResponse;
import com.nullpointer.domain.user.service.UserService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.security.jwt.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final ActivityService activityService;

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

    // 사용자 요약 정보 조회
    @GetMapping("/{userId}/summary")
    public ApiResponse<UserSummaryResponse> getUserSummary(@PathVariable Long userId) {
        UserSummaryResponse response = userService.getUserSummary(userId);
        return ApiResponse.success(response);
    }

    // 사용자 검색
    @GetMapping("/search")
    public ApiResponse<List<UserSummaryResponse>> searchUsers(@RequestParam String keyword) {
        return ApiResponse.success(userService.searchUsers(keyword));
    }

    // 계정 비활성화
    @PatchMapping("/deactivate")
    public ApiResponse<String> deactivateUser(@AuthenticationPrincipal CustomUserDetails userDetails, HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        // 헤더에서 Bearer 제거
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String accessToken = bearerToken.substring(7);
            userService.deactivateUser(userDetails.getUserId(), accessToken);
        }

        return ApiResponse.success("계정 비활성화 성공");
    }

    // 계정 복구
    // 비활성 계정의 로그인 시도
    @PostMapping("/reactivate")
    public ApiResponse<String> reactivateUser(@Valid @RequestBody AuthRequest.Login req) {
        userService.reactivateUser(req);
        return ApiResponse.success("계정 복구 성공");
    }

    // 계정 삭제
    @DeleteMapping("/me")
    public ApiResponse<String> deleteUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        userService.deleteUser(userDetails.getUserId());
        return ApiResponse.success("계정 삭제 성공");
    }

    // 사용자 활동 통계 조회
    @GetMapping("/me/activities/stats")
    public ApiResponse<ActivityStatsResponse> getMyStats(@AuthenticationPrincipal CustomUserDetails userDetails) {
        ActivityStatsResponse response
                = activityService.getStats(
                ActivityConditionRequest.builder()
                        .userId(userDetails.getUserId()).build());
        return ApiResponse.success(response);
    }

    // 사용자 활동 기준 인기 보드 조회
    @GetMapping("/me/activities/top-boards")
    public ApiResponse<List<TopBoardResponse>> getMyTopBoards(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<TopBoardResponse> response
                = activityService.getTopBoard(
                ActivityConditionRequest.builder()
                        .userId(userDetails.getUserId()).build());
        return ApiResponse.success(response);
    }

    // 사용자 활동 타임라인 조회 (검색 포함)
    @GetMapping("/me/activities")
    public ApiResponse<List<ActivityLogResponse>> getMyActivities(
            @AuthenticationPrincipal CustomUserDetails userDetails, @ModelAttribute ActivityConditionRequest condition) {
        condition.setUserId(userDetails.getUserId());
        condition.setTeamId(null); // 다른 조건 초기화
        condition.setBoardId(null);

        List<ActivityLogResponse> response
                = activityService.getActivities(condition);

        return ApiResponse.success(response);
    }

}
