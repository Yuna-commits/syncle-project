package com.nullpointer.global.scheduler;

import com.nullpointer.domain.invitation.mapper.InvitationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class InvitationCleanupScheduler {

    private final InvitationMapper invitationMapper;

    /**
     * 만료된 초대장 정리
     * - 매일 자정(00:00:00)에 실행
     * - expiredAt이 지났는데 아직 PENDING인 상태를 EXPIRED로 변경
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void cleanupExpiredInvitations() {
        log.info("=== 만료된 초대장 정리 스케줄러 시작 ===");

        try {
            int updatedCount = invitationMapper.updateExpiredInvitations();
            if (updatedCount > 0) {
                log.info("총 {}건의 초대장이 만료 처리되었습니다.", updatedCount);
            } else {
                log.info("만료 대상 초대장이 없습니다.");
            }
        } catch (Exception e) {
            log.error("초대장 정리 중 오류 발생: {}", e.getMessage());
        }

        log.info("=== 만료된 초대장 정리 스케줄러 종료 ===");
    }
}