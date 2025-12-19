package com.nullpointer.domain.notification.service;

import com.nullpointer.domain.notification.dto.NotificationSettingDto;

public interface NotificationSettingService {

    // 내 알림 설정 조회 (없으면 기본값 생성 후 반환)
    NotificationSettingDto getSettings(Long userId);

    // 알림 설정 수정
    void updateSettings(Long userId, NotificationSettingDto settings);

}
