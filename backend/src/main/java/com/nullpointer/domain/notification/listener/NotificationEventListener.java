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
        Long actorId = event.getActorId();
        Long receiverId = null; // 카드 담당자에게 알림
        String message = "";
        NotificationType type = null;
        String targetUrl = String.format("/board/%d?cardId=%d", event.getBoardId(), event.getCardId());

        // 2. 이벤트 타입에 따라 수신자와 메시지 결정
        switch (event.getEventType()) {
            case ASSIGNED:
                receiverId = event.getAssigneeId(); // 담당자에게 알림
                type = NotificationType.CARD_ASSIGNED; // 담당자 지정
                message = String.format(
                        "'%s' 카드의 담당자로 지정되었습니다.",
                        event.getCardTitle());
                break;

            case MOVED:
                receiverId = event.getAssigneeId(); // 담당자에게 알림
                type = NotificationType.CARD_MOVED;
                message = String.format("담당 카드 '%s'가 '%s' 리스트로 이동되었습니다.",
                        event.getCardTitle(), event.getListTitle());
                break;
            case UPDATED:
                receiverId = event.getAssigneeId();
                type = NotificationType.CARD_UPDATED;
                message = generateUpdateMessage(event);
                break;
            case COMMENT:
                receiverId = event.getAssigneeId(); // 담당자에게 알림
                type = NotificationType.COMMENT;
                message = String.format("담당 카드 '%s'에 새 댓글이 달렸습니다.:%s",
                        event.getCardTitle(), getSafeSubstring(event.getCommentContent(), 20));
                break;
            case REPLY:
                receiverId = event.getTargetUserId(); // 원 댓글 작성자에게 알림
                type = NotificationType.COMMENT_REPLY;
                message = String.format("회원님의 댓글에 답글이 달렸습니다.:%s",
                        getSafeSubstring(event.getCommentContent(), 20));
                break;
            case MENTION:
                receiverId = event.getTargetUserId(); // 멘션된 사람
                type = NotificationType.MENTION;
                message = String.format("'%s'님이 회원님을 언급했습니다:%s",
                        event.getActorNickname(), getSafeSubstring(event.getCommentContent(), 20));
                break;
            default:
                return;
        }

        // 수신자가 없거나 본인에게 보내는 알림이면 중단
        if (receiverId == null || receiverId.equals(actorId)) {
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
                .targetUrl(targetUrl) // 클릭 시 해당 보드의 카드 상세로 이동
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

    /**
     * Helper Method
     */
    // 20자 미만일 때 에러 방지
    private String getSafeSubstring(String content, int length) {
        if (content == null) return "";
        if (content.length() <= length) return content;
        return content.substring(0, length) + "...";
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
