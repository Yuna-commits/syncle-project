package com.nullpointer.domain.notification.service.impl;

import com.nullpointer.domain.notification.dto.NotificationSettingDto;
import com.nullpointer.domain.notification.mapper.NotificationSettingMapper;
import com.nullpointer.domain.notification.service.NotificationSettingService;
import com.nullpointer.domain.notification.vo.NotificationSettingVo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationSettingServiceImpl implements NotificationSettingService {

    private final NotificationSettingMapper configMapper;

    @Override
    @Transactional
    public NotificationSettingDto getSettings(Long userId) {
        // VO -> DTO
        return configMapper.findByUserId(userId)
                .map(NotificationSettingDto::from)
                .orElseGet(() -> {
                    // 최초 사용자는 기본값 생성
                    NotificationSettingVo defaultVo = NotificationSettingVo.createDefault(userId);
                    configMapper.insertSettings(defaultVo);
                    return NotificationSettingDto.from(defaultVo);
                });
    }

    @Override
    @Transactional
    public void updateSettings(Long userId, NotificationSettingDto settings) {
        NotificationSettingVo vo = settings.toVo(userId);

        // 무조건 수정 -> 실패하면(대상이 없으면) 생성
        int affectedRows = configMapper.updateSettings(vo);

        if (affectedRows == 0) {
            configMapper.insertSettings(vo);
        }
    }

}
