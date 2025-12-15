package com.nullpointer.domain.card.helper;

import com.nullpointer.domain.card.vo.CardVo;
import com.nullpointer.domain.notification.event.CardEvent;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
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
    private final UserMapper userMapper;

    // [멘션&이벤트] 카드 설명 변경 시 멘션 알림 발행
    public void processDescriptionMentions(CardVo card, String newDescription, Long actorId, Long boardId) {
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
        UserVo actor = userMapper.findById(actorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

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
                    .build();

            publisher.publishEvent(event);
        }
    }

    // [이벤트] 일반 카드 이벤트 발행
    public void publishCardEvent(CardVo card, Long boardId, Long actorId, CardEvent.EventType type, Set<String> changedFields, Long targetListId) {
        UserVo actor = userMapper.findById(actorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        CardEvent event = CardEvent.builder()
                .cardId(card.getId())
                .cardTitle(card.getTitle())
                .boardId(boardId)
                .listId(targetListId != null ? targetListId : card.getListId())
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
