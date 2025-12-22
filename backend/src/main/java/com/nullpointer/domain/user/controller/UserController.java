package com.nullpointer.domain.user.controller;

import com.nullpointer.domain.activity.dto.request.ActivityConditionRequest;
import com.nullpointer.domain.activity.dto.response.ActivityLogResponse;
import com.nullpointer.domain.activity.dto.response.ActivityStatsResponse;
import com.nullpointer.domain.activity.dto.response.TopBoardResponse;
import com.nullpointer.domain.activity.service.ActivityService;
import com.nullpointer.domain.activity.vo.enums.ActivityType;
import com.nullpointer.domain.auth.dto.request.AuthRequest;
import com.nullpointer.domain.auth.dto.request.PasswordRequest;
import com.nullpointer.domain.user.dto.request.UpdateProfileRequest;
import com.nullpointer.domain.user.dto.response.UserProfileResponse;
import com.nullpointer.domain.user.dto.response.UserSummaryResponse;
import com.nullpointer.domain.user.service.UserService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import com.nullpointer.global.security.jwt.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "User", description = "사용자 정보 및 프로필 관리 API")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final ActivityService activityService;

    // 이메일 중복 확인
    @Operation(summary = "이메일 중복 확인", description = "해당 이메일이 이미 가입되어 있는지 확인합니다.")
    @GetMapping("/check-email")
    public ApiResponse<Boolean> checkEmailDuplicate(@RequestParam String email) {
        boolean isDuplicate = userService.existsByEmail(email);
        return ApiResponse.success(isDuplicate);
    }

    // 닉네임 중복 확인
    @Operation(summary = "닉네임 중복 확인", description = "해당 닉네임이 이미 사용 중인지 확인합니다.")
    @GetMapping("/check-nickname")
    public ApiResponse<Boolean> checkNicknameDuplicate(@RequestParam String nickname) {
        boolean isDuplicate = userService.existsByNickname(nickname);
        return ApiResponse.success(isDuplicate);
    }

    // 내 정보 조회
    @Operation(summary = "내 정보 조회", description = "현재 로그인한 사용자의 프로필 정보를 조회합니다.")
    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        UserProfileResponse response = userService.getUserProfile(userDetails.getUserId());
        return ApiResponse.success(response);
    }

    // 내 정보 수정
    @Operation(summary = "내 정보 수정", description = "닉네임, 자기소개 등 사용자 프로필 정보를 수정합니다.")
    @PatchMapping("/me")
    public ApiResponse<String> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody UpdateProfileRequest req) {
        userService.updateProfile(userDetails.getUserId(), req);
        return ApiResponse.success("내 정보 수정 성공");
    }

    // 내 비밀번호 변경
    @Operation(summary = "비밀번호 변경", description = "로그인 상태에서 비밀번호를 변경합니다.")
    @PatchMapping("/password")
    public ApiResponse<String> changePassword(@AuthenticationPrincipal CustomUserDetails userDetails,
                                              @Valid @RequestBody PasswordRequest.Change req) {
        userService.changePassword(userDetails.getUserId(), req);
        return ApiResponse.success("비밀번호 변경 성공");
    }

    // 사용자 요약 정보 조회
    @Operation(summary = "사용자 요약 정보 조회", description = "특정 사용자의 기본 정보를 조회합니다.")
    @GetMapping("/{userId}/summary")
    public ApiResponse<UserSummaryResponse> getUserSummary(@PathVariable Long userId) {
        UserSummaryResponse response = userService.getUserSummary(userId);
        return ApiResponse.success(response);
    }

    // 사용자 검색
    @Operation(summary = "사용자 검색", description = "키워드로 사용자를 검색합니다 (이메일 또는 닉네임).")
    @GetMapping("/search")
    public ApiResponse<List<UserSummaryResponse>> searchUsers(@RequestParam String keyword) {
        return ApiResponse.success(userService.searchUsers(keyword));
    }

    // 계정 비활성화
    @Operation(summary = "계정 비활성화", description = "계정을 비활성화 상태로 변경하고 로그아웃 처리합니다.")
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
    @Operation(summary = "계정 복구", description = "비활성화된 계정으로 로그인 시도를 통해 계정을 복구합니다.")
    @PostMapping("/reactivate")
    public ApiResponse<String> reactivateUser(@Valid @RequestBody AuthRequest.Login req) {
        userService.reactivateUser(req);
        return ApiResponse.success("계정 복구 성공");
    }

    // 계정 삭제
    @Operation(summary = "계정 영구 삭제", description = "계정을 영구적으로 삭제합니다.")
    @DeleteMapping("/me")
    public ApiResponse<String> deleteUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        userService.deleteUser(userDetails.getUserId());
        return ApiResponse.success("계정 삭제 성공");
    }

    // 사용자 활동 통계 조회
    @Operation(summary = "내 활동 통계 조회", description = "최근 7일간의 내 활동 통계를 조회합니다.")
    @GetMapping("/me/activities/stats")
    public ApiResponse<ActivityStatsResponse> getMyStats(@AuthenticationPrincipal CustomUserDetails userDetails) {
        ActivityStatsResponse response
                = activityService.getStats(
                ActivityConditionRequest.builder()
                        .userId(userDetails.getUserId()).build());
        return ApiResponse.success(response);
    }

    // 사용자 활동 기준 인기 보드 조회
    @Operation(summary = "내 인기 보드 조회", description = "최근 활동이 많은 내 보드 목록을 조회합니다.")
    @GetMapping("/me/activities/top-boards")
    public ApiResponse<List<TopBoardResponse>> getMyTopBoards(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<TopBoardResponse> response
                = activityService.getTopBoard(
                ActivityConditionRequest.builder()
                        .userId(userDetails.getUserId()).build());
        return ApiResponse.success(response);
    }

    // 사용자 활동 타임라인 조회 (검색 포함)
    @Operation(summary = "내 활동 타임라인 조회", description = "나의 전체 활동 로그를 조회합니다.")
    @GetMapping("/me/activities")
    public ApiResponse<Page<ActivityLogResponse>> getMyActivities(
            @LoginUser Long userId,
            @RequestParam(required = false) ActivityType type,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        ActivityConditionRequest condition = ActivityConditionRequest.builder()
                .userId(userId)
                .type(type)
                .keyword(keyword)
                .startDate(startDate != null ? startDate.atStartOfDay() : null)
                .endDate(endDate != null ? endDate.atTime(23, 59, 59) : null)
                .build();

        Page<ActivityLogResponse> response
                = activityService.getActivities(condition, pageable);

        return ApiResponse.success(response);
    }

}
