package com.nullpointer.global.scheduler;

import com.nullpointer.domain.notification.dto.NotificationDto;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.global.common.enums.RedisKeyType;
import com.nullpointer.global.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationCleanupScheduler {

        private final UserMapper userMapper;
        private final RedisUtil redisUtil;

        // 매일 새벽 4시에 실행
    @Scheduled(cron = "0 0 4 * * *")
    public void cleanup(){
        log.info("[Scheduler] Redis 알림 삭제 스케쥴러 작업 시작");

        // 전체 사용자 ID 조회
        List<Long> userIds = userMapper.findAllIds();
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        int deletedCount = 0;

        for(Long userId : userIds){
            String key = RedisKeyType.NOTIFICATION.getKey(String.valueOf(userId));

            // 키가 없으면 스킵
            if (!redisUtil.hasKey(key) ){
                continue;
            }

            // 해당 유저의 알림 목록 조회
            List<NotificationDto> noti = redisUtil.getList(key,NotificationDto.class);
            if (noti.isEmpty()){
                continue;
            }

            // 7일 이내의 알림만 필터링
            List<NotificationDto> validNoti = noti.stream()
                    .filter(n-> n.getCreatedAt() != null && n.getCreatedAt().isAfter(sevenDaysAgo))
                    .toList();

            // 삭제된 알림이 있다면 Redis 업데이트
            if (validNoti.size() < noti.size()) {
                deletedCount += (noti.size()-validNoti.size());

                // 기존 리스트 삭제 후 유효한 알림만 다시 저장
                redisUtil.deleteData(key);

                // Redis List는 leftPush(왼쪽 삽입)이므로, 최신순 유지를 위해 역순으로 삽입해야 함
                for(int i = validNoti.size()-1;i>=0;i--){
                    // 재저장 시 TTL 7일로 갱신
                    redisUtil.addList(key, validNoti.get(i), 60 * 60 * 24 * 7L);

                }
            }

        }
        log.info("[Scheduler] Redis 알림 삭제 스케쥴러 작업 완료 (총 {}개 삭제됨)", deletedCount);

    }
}
