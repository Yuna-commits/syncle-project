package com.nullpointer.domain.card.helper;

import com.nullpointer.domain.card.vo.CardVo;
import com.nullpointer.domain.notification.event.CardEvent;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.global.util.MentionProcessor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class CardEventHelper {

    private final MentionProcessor mentionProcessor;
    private final ApplicationEventPublisher publisher; // 이벤트 발행기

    // [멘션&이벤트] 카드 설명 변경 시 멘션 알림 발행
    public void processDescriptionMentions(UserVo actor, CardVo card, Long boardId, String newDescription) {
        // 카드 설명 변경 확인
        if (newDescription == null || newDescription.equals(card.getDescription())) {
            return;
        }

        // 멘션 파싱
        Set<Long> mentionedUserIds = mentionProcessor.parseMentions(newDescription);

        // 멘션 대상이 없으면 알림 x
        if (mentionedUserIds.isEmpty()) {
            return;
        }

        // [멘션] 알림 발송
        for (Long targetId : mentionedUserIds) {
            if (targetId.equals(actor.getId())) continue; // 본인 제외

            CardEvent event = CardEvent.builder()
                    .cardId(card.getId())
                    .cardTitle(card.getTitle())
                    .boardId(boardId)
                    .listId(card.getListId())
                    .actorId(actor.getId())
                    .actorNickname(actor.getNickname())
                    .actorProfileImg(actor.getProfileImg())
                    .eventType(CardEvent.EventType.MENTION)
                    .targetUserId(targetId)
                    .commentContent(newDescription)
                    .build();

            publisher.publishEvent(event);
        }
    }

    // [이벤트] 카드 이동 이벤트 발행
    public void publishCardMoveEvent(UserVo actor, CardVo card, Long boardId, Long targetListId) {
        // 담당자가 없거나 본인이면 알림 스킵
        if (card.getAssigneeId() == null || card.getAssigneeId().equals(actor.getId())) {
            return;
        }

        CardEvent event = CardEvent.builder()
                .cardId(card.getId())
                .cardTitle(card.getTitle())
                .boardId(boardId)
                .listId(targetListId) // 이동한 리스트
                .actorId(actor.getId())
                .actorNickname(actor.getNickname()) // 알림 메시지용 이름
                .actorProfileImg(actor.getProfileImg())
                .assigneeId(card.getAssigneeId())
                .eventType(CardEvent.EventType.MOVED)
                .build();

        publisher.publishEvent(event);
    }

    // [이벤트] 카드 수정 이벤트 발행
    public void publishCardUpdateEvent(UserVo actor, CardVo card, Long boardId, Set<String> changedFields, boolean isAssigneeChanged) {
        // 수정한 항목이 없으면 알림 스킵
        if (changedFields.isEmpty()) {
            return;
        }

        CardEvent.EventType type = isAssigneeChanged ? CardEvent.EventType.ASSIGNED : CardEvent.EventType.UPDATED;

        CardEvent event = CardEvent.builder()
                .cardId(card.getId())
                .cardTitle(card.getTitle())
                .boardId(boardId)
                .actorId(actor.getId())
                .actorNickname(actor.getNickname()) // 알림 메시지용 이름
                .actorProfileImg(actor.getProfileImg())
                .assigneeId(card.getAssigneeId())
                .isComplete(card.getIsComplete())
                .priority(card.getPriority())
                .dueDate(card.getDueDate())
                .eventType(type)
                .changedFields(changedFields)
                .build();

        publisher.publishEvent(event);
    }

}
