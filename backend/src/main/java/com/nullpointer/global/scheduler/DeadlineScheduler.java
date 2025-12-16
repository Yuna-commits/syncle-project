package com.nullpointer.global.scheduler;

import com.nullpointer.domain.card.mapper.CardMapper;
import com.nullpointer.domain.card.vo.CardVo;
import com.nullpointer.domain.list.mapper.ListMapper;
import com.nullpointer.domain.list.vo.ListVo;
import com.nullpointer.domain.notification.event.CardEvent;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.common.enums.RedisKeyType;
import com.nullpointer.global.common.enums.SystemActor;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeadlineScheduler {

    private final CardMapper cardMapper;
    private final RedisUtil redisUtil;
    private final ApplicationEventPublisher publisher;

    // 알림 발송 기준: 마감 24시간 전
    private static final int HOURS_BEFORE_DEADLINE = 24;
    private final ListMapper listMapper;

    /**
     * 10분마다 마감 임박 카드 확인
     */
    @Scheduled(cron = "0 0/30 * * * *")
    @Transactional(readOnly = true)
    public void checkDeadline() {
        log.info("=== 마감 임박 알림 발송 시작 ===");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime deadline = now.plusHours(HOURS_BEFORE_DEADLINE);

        // 마감 시간이 [현재 ~ 24시간 뒤] 사이인 카드 id 조회
        List<CardVo> cards = cardMapper.findCardsDueBetween(now, deadline);

        for (CardVo card : cards) {
            // "np:notification:deadline:{cardId}"
            String redisKey = RedisKeyType.DEADLINE_ALERT.getKey(card.getId());

            if (redisUtil.hasKey(redisKey)) {
                continue; // 이미 보냈으면 알림 발송 x
            }

            // 알림 발송 대상(카드 담당자) 조회
            Long assigneeId = cardMapper.findAssigneeIdByCardId(card.getId());

            if (assigneeId == null) {
                continue; // 담당자가 없으면 알림 발송 x
            }

            // [알림] 마감 임박 카드 알림 발송
            publishDeadlineEvent(card, assigneeId);

            // 중복 방지 설정
            redisUtil.setDataExpire(redisKey, "SENT", RedisKeyType.DEADLINE_ALERT.getDefaultTtl());

            log.info("=== 마감 임박 알림 발송 완료: cardId={}, userId={} ===", card.getId(), assigneeId);
        }
    }

    private void publishDeadlineEvent(CardVo card, Long assigneeId) {
        ListVo list = listMapper.findById(card.getListId())
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));

        CardEvent event = CardEvent.builder()
                .cardId(card.getId())
                .cardTitle(card.getTitle())
                .boardId(list.getBoardId())
                .listId(list.getId())
                .actorId(null)
                .actorNickname(SystemActor.NAME.getLabel())
                .actorProfileImg(SystemActor.IMAGE_KEY.getLabel())
                .assigneeId(assigneeId)
                .eventType(CardEvent.EventType.DEADLINE_NEAR)
                .build();

        publisher.publishEvent(event);
    }
}
