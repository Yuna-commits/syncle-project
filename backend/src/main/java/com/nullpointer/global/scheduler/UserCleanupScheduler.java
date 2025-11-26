package com.nullpointer.global.scheduler;

import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserCleanupScheduler {

    private final UserMapper userMapper;
    private final UserService userService;

    /**
     * 가입 후 24시간 동안 미인증 상태인 계정 삭제 (Hard Delete)
     * 매일 새벽 3시 실행
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupUnverifiedUsers() {
        log.info("=== 미인증 계정 정리 시작 ===");
        int deletedCount = userMapper.deleteUnverifiedUsers();
        log.info("=== 미인증 계정 정리 완료: {}명 삭제 ===", deletedCount);
    }

    /**
     * 비활성화 후 30일이 지난 계정 영구 탈퇴 (Soft Delete)
     * 매일 새벽 4시 실행
     */
    @Scheduled(cron = "0 0 4 * * *")
    public void cleanupDeactivatedUsers() {
        log.info("=== 장기 비활성 계정 정리 시작 ===");

        // 1) 대상 조회
        List<Long> targetIds = userMapper.findIdsByDeactivatedAndExpired();

        int deletedCount = 0;

        for (Long id : targetIds) {
            try {
                userService.deleteUser(id);
                deletedCount++;
            } catch (Exception e) {
                log.error("사용자 ID {} 영구 탈퇴 처리 중 오류 발생: {}", id, e.getMessage());
            }
        }

        log.info("=== 장기 비활성 계정 정리 완료: {}명 영구 탈퇴 처리 ===", deletedCount);
    }

}
