package com.nullpointer.domain.notification.listener;

import com.nullpointer.domain.notification.event.CardEvent;
import com.nullpointer.domain.notification.vo.NotificationDto;
import com.nullpointer.domain.notification.vo.enums.NotificationType;
import com.nullpointer.global.common.enums.RedisKeyType;
import com.nullpointer.global.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final RedisUtil redisUtil;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 카드 이벤트 처리 리스너
     */
    @Async
    @EventListener
    public void handleCardEvent(CardEvent event) {
        log.info("카드 이벤트 수신: type={}, cardId={}", event.getEventType(), event.getCardId());

        // 1. 알림 대상 판별 (본인 제외)
        Long receiverId = event.getAssigneeId(); // 카드 담당자에게 알림
        Long actorId = event.getActorId();

        if (receiverId == null || receiverId.equals(actorId)) {
            return;
        }

        // 2. 메시지 및 타입 결정
        String message = "";
        NotificationType type = null;

        switch (event.getEventType()) {
            case ASSIGNED:
                type = NotificationType.CARD_ASSIGNED; // 담당자 지정
                message = String.format(
                        "'%s' 카드의 담당자로 지정되었습니다.",
                        event.getCardTitle());
                break;
            case MOVED:
                type = NotificationType.CARD_MOVED;
                message = String.format("담당 카드 '%s'가 '%s' 리스트로 이동되었습니다.",
                        event.getCardTitle(), event.getListTitle());
                break;
            case UPDATED:
                type = NotificationType.CARD_UPDATED;
                message = generateUpdateMessage(event);
                break;
            /**
             * TODO) 그 외 알림 대상 추가
             */
            default:
                return;
        }

        // 메시지가 없으면 알림 생략
        if (message.isEmpty()) return;

        // 알림 객체 생성
        NotificationDto noti = NotificationDto.builder()
                .id(System.currentTimeMillis())
                .receiverId(receiverId)
                .senderId(event.getActorId())
                .senderNickname(event.getActorNickname())
                .senderProfileImg(event.getActorProfileImg())
                .boardId(event.getBoardId())
                .targetId(event.getCardId())
                .type(type)
                .message(message)
                .targetUrl("/board/" + event.getBoardId()) // 클릭 시 해당 보드로 이동
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        // Redis 저장
        // key: "np:notification:{userId}"
        String key = RedisKeyType.NOTIFICATION.getKey(String.valueOf(receiverId));
        redisUtil.addList(key, noti, RedisKeyType.NOTIFICATION.getDefaultTtl());

        // 용량 관리 (최근 50개만 유지)
        redisUtil.trimList(key, 50);

        // WebSocket 실시간 전송
        // 구독 경로: /queue/notifications/{userId}
        // 프론트엔드가 이 경로를 구독해야 함
        messagingTemplate.convertAndSendToUser(
                String.valueOf(receiverId),
                "/queue/notifications",
                noti);

        log.info("알림 발송 완료: receiverId={}", receiverId);
    }

    private String generateUpdateMessage(CardEvent event) {
        Set<String> fields = event.getChangedFields();
        if (fields == null || fields.isEmpty()) return "";

        String cardTitle = event.getCardTitle();

        // 1. 완료 처리
        if (fields.contains("COMPLETE")) {
            return Boolean.TRUE.equals(event.getIsComplete())
                    ? String.format("담당 카드 '%s'가 완료 처리되었습니다.", cardTitle)
                    : String.format("담당 카드 '%s'의 완료 처리가 취소되었습니다.", cardTitle);
        }

        // 2. 중요도 변경 (Priority Enum의 label 활용)
        if (fields.contains("PRIORITY")) {
            String label = event.getPriority().getLabel(); // "높음", "보통", "낮음"
            return String.format("담당 카드 '%s'의 중요도가 '%s'(으)로 변경되었습니다.", cardTitle, label);
        }

        // 3. 마감일 변경
        if (fields.contains("DUE_DATE")) {
            if (event.getDueDate() != null) {
                String dateStr = event.getDueDate().format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일"));
                return String.format("담당 카드 '%s'의 마감일이 %s로 변경되었습니다.", cardTitle, dateStr);
            } else {
                return String.format("담당 카드 '%s'의 마감일 설정이 해제되었습니다.", cardTitle);
            }
        }

        // 그 외 (제목, 설명 등)
        return String.format("담당 카드 '%s'의 내용이 수정되었습니다.", cardTitle);
    }

}
