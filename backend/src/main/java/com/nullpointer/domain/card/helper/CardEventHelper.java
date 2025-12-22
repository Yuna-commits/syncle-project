package com.nullpointer.domain.card.helper;

import com.nullpointer.domain.card.event.CardEvent;
import com.nullpointer.domain.card.vo.CardVo;
import com.nullpointer.domain.list.vo.ListVo;
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
    public void processDescriptionMentions(UserVo actor, CardVo card, Long boardId, Long teamId, String newDescription) {
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
                    .teamId(teamId)
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

    // [이벤트] 카드 생성 이벤트 발행
    public void publishCardCreateEvent(UserVo actor, CardVo card, Long boardId, Long teamId) {
        CardEvent event = CardEvent.builder()
                .cardId(card.getId())
                .cardTitle(card.getTitle())
                .teamId(teamId)
                .boardId(boardId)
                .listId(card.getListId())
                .actorId(actor.getId())
                .actorNickname(actor.getNickname())
                .actorProfileImg(actor.getProfileImg())
                .assigneeId(card.getAssigneeId())
                .eventType(CardEvent.EventType.CREATED) // EventType에 CREATED 추가 필요
                .build();

        publisher.publishEvent(event);
    }

    // [이벤트] 카드 이동 이벤트 발행
    public void publishCardMoveEvent(UserVo actor, CardVo card, Long boardId, Long teamId, ListVo prev, ListVo next) {
        /**
         * 로그 기록을 위해 본인이 이동시킨 것도 이벤트 발행
         * -> NotificationListener에서 처리
         */

        CardEvent event = CardEvent.builder()
                .cardId(card.getId())
                .cardTitle(card.getTitle())
                .teamId(teamId)
                .boardId(boardId)
                .listId(next.getId()) // 이동한 리스트
                .listTitle(next.getTitle())
                .prevListId(prev.getId())
                .prevListTitle(prev.getTitle())
                .actorId(actor.getId())
                .actorNickname(actor.getNickname()) // 알림 메시지용 이름
                .actorProfileImg(actor.getProfileImg())
                .assigneeId(card.getAssigneeId())
                .eventType(CardEvent.EventType.MOVED)
                .build();

        publisher.publishEvent(event);
    }

    // [이벤트] 카드 수정 이벤트 발행
    public void publishCardUpdateEvent(UserVo actor, CardVo card, Long boardId, Long teamId, Set<String> changedFields, boolean isAssigneeChanged) {
        // 수정한 항목이 없으면 알림 스킵
        if (changedFields.isEmpty()) {
            return;
        }

        CardEvent.EventType type = isAssigneeChanged ? CardEvent.EventType.ASSIGNED : CardEvent.EventType.UPDATED;

        CardEvent event = CardEvent.builder()
                .cardId(card.getId())
                .cardTitle(card.getTitle())
                .teamId(teamId)
                .boardId(boardId)
                .listId(card.getListId())
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

    // [이벤트] 카드 삭제 이벤트 발행
    public void publishCardDeleteEvent(UserVo actor, CardVo card, Long boardId, Long teamId) {
        CardEvent event = CardEvent.builder()
                .cardId(card.getId())
                .cardTitle(card.getTitle()) // 삭제된 카드의 제목
                .teamId(teamId)
                .boardId(boardId)
                .listId(card.getListId())
                .actorId(actor.getId())
                .actorNickname(actor.getNickname())
                .actorProfileImg(actor.getProfileImg())
                .assigneeId(card.getAssigneeId())
                .eventType(CardEvent.EventType.DELETED) // EventType에 CREATED 추가 필요
                .build();

        publisher.publishEvent(event);
    }

    // [이벤트] 파일 업로드 이벤트 발행
    public void publishFileAttachment(UserVo actor, CardVo card, Long boardId, Long teamId, String fileName) {
        CardEvent event = CardEvent.builder()
                .cardId(card.getId())
                .cardTitle(card.getTitle())
                .teamId(teamId)
                .boardId(boardId)
                .listId(card.getListId())
                .actorId(actor.getId())
                .actorNickname(actor.getNickname()) // 알림 메시지용 이름
                .actorProfileImg(actor.getProfileImg())
                .assigneeId(card.getAssigneeId())
                .eventType(CardEvent.EventType.ATTACHMENT)
                .changedFields(Set.of(fileName)) // 파일명
                .build();

        publisher.publishEvent(event);
    }

    // [이벤트] 아카이브(보관) 이벤트 추가
    public void publishCardArchiveEvent(UserVo actor, CardVo card, Long boardId, Long teamId, boolean isArchived) {
        CardEvent event = CardEvent.builder()
                .cardId(card.getId())
                .cardTitle(card.getTitle())
                .boardId(boardId)
                .teamId(teamId)
                .actorId(actor.getId())
                .actorNickname(actor.getNickname())
                .actorProfileImg(actor.getProfileImg())
                .assigneeId(card.getAssigneeId())
                .eventType(CardEvent.EventType.UPDATED)
                .changedFields(Set.of("ARCHIVE")) // "아카이브가 변경됨" 표시
                .isArchived(isArchived)
                .build();

        publisher.publishEvent(event);
    }

}
