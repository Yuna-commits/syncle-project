package com.nullpointer.domain.notification.mapper;

import com.nullpointer.domain.notification.vo.NotificationSettingVo;

import java.util.Optional;

public interface NotificationSettingMapper {

    // 조회
    Optional<NotificationSettingVo> findByUserId(Long userId);

    // 최초 생성
    void insertSettings(NotificationSettingVo settings);

    // 수정
    int updateSettings(NotificationSettingVo settings);

}
