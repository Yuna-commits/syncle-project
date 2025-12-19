package com.nullpointer.domain.notification.controller;

import com.nullpointer.domain.notification.dto.NotificationSettingDto;
import com.nullpointer.domain.notification.service.NotificationSettingService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "NotificationSetting", description = "알림 설정 관리 API")
@RestController
@RequestMapping("/api/notifications/settings")
@RequiredArgsConstructor
public class NotificationSettingController {

    private final NotificationSettingService notificationSettingService;

    @Operation(summary = "내 알림 설정 조회", description = "현재 로그인한 사용자의 알림 설정을 조회합니다.")
    @GetMapping
    public ApiResponse<NotificationSettingDto> getMyConfig(@LoginUser Long userId) {
        NotificationSettingDto config = notificationSettingService.getSettings(userId);
        return ApiResponse.success(config);
    }

    @Operation(summary = "내 알림 설정 수정", description = "이메일, 푸시 알림 등 사용자 알림 설정 정보를 수정합니다.")
    @PutMapping
    public ApiResponse<String> updateMyConfig(@LoginUser Long userId, @RequestBody NotificationSettingDto settings) {
        notificationSettingService.updateSettings(userId, settings);
        return ApiResponse.success("알림 설정 수정 완료");
    }

}
