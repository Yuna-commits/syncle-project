package com.nullpointer.domain.notification.controller;

import com.nullpointer.domain.notification.dto.NotificationDto;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import com.nullpointer.global.common.enums.RedisKeyType;
import com.nullpointer.global.util.RedisUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Notification", description = "알림 관리 API (Redis)")
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final RedisUtil redisUtil;

    @Operation(summary = "내 알림 목록 조회", description = "Redis에 저장된 최근 알림 목록을 조회합니다.")
    @GetMapping
    public ApiResponse<List<NotificationDto>> getMyNotifications(@LoginUser Long userId) {
        String key = RedisKeyType.NOTIFICATION.getKey(String.valueOf(userId));
        // Redis List 전체 조회
        List<NotificationDto> noti = redisUtil.getList(key, NotificationDto.class);

        return ApiResponse.success(noti);
    }

    @Operation(summary = "알림 전체 읽음 처리", description = "사용자의 모든 알림을 읽음 처리(삭제 또는 상태변경) 합니다.")
    @PatchMapping("/read-all")
    public ApiResponse<String> markAllAsRead(@LoginUser Long userId) {
        String key = RedisKeyType.NOTIFICATION.getKey(String.valueOf(userId));

        // 1. Redis에서 전체 알림 목록 조회
        List<NotificationDto> list = redisUtil.getList(key, NotificationDto.class);

        // 2. 안 읽은 알림만 찾아서 상태 업데이트
        for (int i =0; i < list.size(); i++) {
            NotificationDto noti = list.get(i);

            // 이미 읽은 알림은 건너뜀
            if(Boolean.TRUE.equals(noti.getIsRead())){
                continue;
            }

            // 3. 읽음 처리 후 해당 인덱스의 데이터 덮어쓰기
            NotificationDto updateNoti = noti.toBuilder()
                    .isRead(true)
                    .build();

            redisUtil.updateListIndex(key, i, updateNoti);
        }
        return ApiResponse.success("모든 알림을 읽음 처리했습니다.");
    }

    @Operation(summary = "개별 알림 읽음 처리", description = "특정 알림 하나를 읽음 상태로 변경합니다.")
    @PatchMapping("/{notificationId}/read")
    public ApiResponse<String> markAsRead(@PathVariable Long notificationId, @LoginUser Long userId) {
        String key = RedisKeyType.NOTIFICATION.getKey(String.valueOf(userId));

        // 1. Redis에서 전체 알림 목록 조회
        List<NotificationDto> list = redisUtil.getList(key, NotificationDto.class);

        // 2. 해당 id를 가진 알림 찾기 & 읽음 처리
        boolean found = false;
        for (int i = 0; i < list.size(); i++) {
            NotificationDto noti = list.get(i);

            // id가 일치하고, 아직 안 읽은 상태인 경우
            if (noti.getId().equals(notificationId)) {
                if (!noti.getIsRead()) {
                    redisUtil.updateListIndex(
                            key, i, noti.toBuilder().isRead(true).build());
                }
                found = true;
                break;
            }
        }

        if (!found) {
            // 이미 삭제되었거나 없는 알림인 경우
            return ApiResponse.success("알림을 찾을 수 없거나 이미 처리되었습니다.");
        }

        return ApiResponse.success("알림을 읽음 처리했습니다.");
    }

}
