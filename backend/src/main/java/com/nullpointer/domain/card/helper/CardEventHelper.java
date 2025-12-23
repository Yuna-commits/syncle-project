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

    // [공통] 카드 수정 (담당자, 중요도, 마감일, 라벨, 보관함 등) 이벤트 발행
    public void publishCardUpdateEvent(UserVo actor, CardVo card, Long boardId, Long teamId,
                                       String assigneeNickname, String fieldName, String oldValue, String newValue) {
        // 이벤트 타입 결정
        CardEvent.EventType type = CardEvent.EventType.UPDATED;

        if (assigneeNickname != null && fieldName == null) {
            type = CardEvent.EventType.ASSIGNED;
        }

        CardEvent event = CardEvent.builder()
                .eventType(type)
                .cardId(card.getId())
                .cardTitle(card.getTitle())
                .teamId(teamId)
                .boardId(boardId)
                .listId(card.getListId())
                .actorId(actor.getId())
                .actorNickname(actor.getNickname())
                .actorProfileImg(actor.getProfileImg())
                .assigneeId(card.getAssigneeId())
                .assigneeNickname(assigneeNickname) // 담당자 변경 시에만 값 존재
                .fieldName(fieldName) // 상세 변경 시에만 값 존재
                .oldValue(oldValue)
                .newValue(newValue)
                .build();

        publisher.publishEvent(event);
    }

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
                    .content(newDescription)
                    .build();

            publisher.publishEvent(event);
        }
    }

    // [이벤트] 카드 생성 이벤트 발행
    public void publishCardCreateEvent(UserVo actor, CardVo card, Long boardId, Long teamId, String assigneeNickname) {
        CardEvent event = CardEvent.builder()
                .eventType(CardEvent.EventType.CREATED)
                .cardId(card.getId())
                .cardTitle(card.getTitle())
                .teamId(teamId)
                .boardId(boardId)
                .listId(card.getListId())
                .actorId(actor.getId())
                .actorNickname(actor.getNickname())
                .actorProfileImg(actor.getProfileImg())
                .assigneeId(card.getAssigneeId())
                .assigneeNickname(assigneeNickname)
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
                .eventType(CardEvent.EventType.MOVED)
                .cardId(card.getId())
                .cardTitle(card.getTitle())
                .teamId(teamId)
                .boardId(boardId)
                .listId(next.getId()) // 이동한 리스트
                .listTitle(next.getTitle())
                .prevListTitle(prev.getTitle())
                .actorId(actor.getId())
                .actorNickname(actor.getNickname()) // 알림 메시지용 이름
                .actorProfileImg(actor.getProfileImg())
                .assigneeId(card.getAssigneeId())
                .build();

        publisher.publishEvent(event);
    }

    // [이벤트] 카드 삭제 이벤트 발행
    public void publishCardDeleteEvent(UserVo actor, CardVo card, Long boardId, Long teamId) {
        CardEvent event = CardEvent.builder()
                .eventType(CardEvent.EventType.DELETED)
                .cardId(card.getId())
                .cardTitle(card.getTitle()) // 삭제된 카드의 제목
                .teamId(teamId)
                .boardId(boardId)
                .listId(card.getListId())
                .actorId(actor.getId())
                .actorNickname(actor.getNickname())
                .actorProfileImg(actor.getProfileImg())
                .assigneeId(card.getAssigneeId())
                .build();

        publisher.publishEvent(event);
    }

    // [이벤트] 파일 업로드 이벤트 발행
    public void publishFileAttachment(UserVo actor, CardVo card, Long boardId, Long teamId, String fileName) {
        CardEvent event = CardEvent.builder()
                .eventType(CardEvent.EventType.ATTACHMENT)
                .cardId(card.getId())
                .cardTitle(card.getTitle())
                .teamId(teamId)
                .boardId(boardId)
                .listId(card.getListId())
                .actorId(actor.getId())
                .actorNickname(actor.getNickname()) // 알림 메시지용 이름
                .actorProfileImg(actor.getProfileImg())
                .assigneeId(card.getAssigneeId())
                .content(fileName) // 파일명
                .build();

        publisher.publishEvent(event);
    }

}
