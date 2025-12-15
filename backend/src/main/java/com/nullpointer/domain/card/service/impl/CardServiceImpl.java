package com.nullpointer.domain.card.service.impl;

import com.nullpointer.domain.card.dto.CardResponse;
import com.nullpointer.domain.card.dto.CreateCardRequest;
import com.nullpointer.domain.card.dto.MoveCardRequest;
import com.nullpointer.domain.card.dto.UpdateCardRequest;
import com.nullpointer.domain.card.mapper.CardMapper;
import com.nullpointer.domain.card.service.CardService;
import com.nullpointer.domain.card.vo.CardVo;
import com.nullpointer.domain.list.mapper.ListMapper;
import com.nullpointer.domain.list.vo.ListVo;
import com.nullpointer.domain.notification.event.CardEvent;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.global.common.SocketSender;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.validator.MemberValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CardServiceImpl implements CardService {

    private final CardMapper cardMapper;
    private final ListMapper listMapper;
    private final UserMapper userMapper;
    private final MemberValidator memberVal;

    private final SocketSender socketSender;
    private final ApplicationEventPublisher publisher; // 이벤트 발행기

    @Override
    @Transactional
    public CardResponse createCard(Long listId, CreateCardRequest req, Long userId) {
        // 리스트 확인 & 권한 검증
        Long boardId = validateListAndPermission(listId, userId);

        // 카드 VO 생성 (DTO -> VO)
        CardVo cardVo = CardVo.builder()
                .listId(listId)
                .title(req.getTitle())
                .description(req.getDescription())
                .assigneeId(userId) // 생성자를 초기 담당자로 설정
                .build();

        // DB 저장
        cardMapper.insertCard(cardVo);

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "CARD_CREATE", userId, null);

        // 담당자 정보 포함 응답 반환
        return cardMapper.findCardDetailById(cardVo.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CardResponse> getCards(Long listId, Long userId) {
        validateListAndPermission(listId, userId);
        return cardMapper.findCardsWithDetailsByListId(listId);
    }

    // 내 일정 조회(캘린더)
    @Override
    @Transactional(readOnly = true)
    public List<CardResponse> getMyCards(Long userId, Long teamId, Long boardId) {
        return cardMapper.findCardsByAssigneeIdAndFilters(userId, teamId, boardId);
    }

    // 카드 이동
    @Override
    @Transactional
    public void moveCard(Long cardId, MoveCardRequest req, Long userId) {
        // 이동할 카드 조회
        CardVo card = findCardOrThrow(cardId);
        // 권한 검증 & 보드 id 조회
        Long boardId = validateListAndPermission(req.getListId(), userId);

        // 순서 및 리스트 변경
        updateCardOrder(card, req.getListId(), req.getOrderIndex());

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "CARD_MOVE", userId, null);

        // [이벤트] 카드 이동 알림 발행 (담당자가 있고, 본인이 담당자가 아닐 때)
        if (card.getAssigneeId() != null) {
            // 이동한 '새로운 리스트'의 정보 조회
            ListVo targetList = listMapper.findById(req.getListId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));

            publishCardEvent(card, boardId, userId, CardEvent.EventType.MOVED, targetList, null);
        }
    }

    // 카드 수정
    @Override
    @Transactional
    public CardResponse updateCard(Long cardId, UpdateCardRequest req, Long userId) {
        // 카드 조회
        CardVo card = findCardOrThrow(cardId);
        // 권한 검증 & 보드 id 조회
        Long boardId = validateListAndPermission(card.getListId(), userId);

        Set<String> changedFields = new HashSet<>();

        // 담당자 변경 확인
        boolean isAssigneeChanged = false;
        if (req.getAssigneeId() != null && !req.getAssigneeId().equals(card.getAssigneeId())) {
            // 본인이 담당자가 아니고 담당자로 지정된 사람이 보드에 접근 가능한지 확인 (VIEWER 이상)
            memberVal.validateBoardViewer(boardId, req.getAssigneeId());
            cardMapper.updateCardAssignee(cardId, req.getAssigneeId());
            card.setAssigneeId(req.getAssigneeId());

            isAssigneeChanged = true;
            changedFields.add("ASSIGNEE");
        }

        // 주요 필드 변경 확인 (완료 여부, 우선순위, 마감일)
        if (checkChange(req.getIsComplete(), card.getIsComplete())) {
            card.setIsComplete(req.getIsComplete());
            changedFields.add("COMPLETE");
        }
        if (checkChange(req.getPriority(), card.getPriority())) {
            card.setPriority(req.getPriority());
            changedFields.add("PRIORITY");
        }
        if (checkChange(req.getDueDate(), card.getDueDate())) {
            card.setDueDate(req.getDueDate());
            changedFields.add("DUE_DATE");
        }

        // 카드 정보 업데이트
        CardVo updateVo = CardVo.builder()
                .id(cardId)
                .title(req.getTitle())
                .description(req.getDescription())
                .priority(req.getPriority())
                .isComplete(req.getIsComplete())
                .startDate(req.getStartDate())
                .dueDate(req.getDueDate())
                .label(req.getLabel())
                .labelColor(req.getLabelColor())
                .build();

        // 업데이트 진행
        cardMapper.updateCard(updateVo);

        // 초기화 요청 처리 (날짜, 라벨, 우선순위 제거)
        handleRemoveRequests(cardId, req);

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "CARD_UPDATE", userId, null);

        // [이벤트] 카드 변경 알림 발행
        if (!changedFields.isEmpty()) {
            publishCardEvent(card, boardId, userId,
                    isAssigneeChanged ? CardEvent.EventType.ASSIGNED : CardEvent.EventType.UPDATED,
                    null, changedFields);
        }

        return cardMapper.findCardDetailById(cardId);
    }

    // 카드 삭제
    @Override
    @Transactional
    public void deleteCard(Long cardId, Long userId) {
        // 카드 조회
        CardVo card = findCardOrThrow(cardId);

        // 권한 검증
        Long boardId = validateListAndPermission(card.getListId(), userId);

        // 카드 삭제
        cardMapper.deleteCard(cardId);

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "CARD_DELETE", userId, null);
    }

    /**
     * Helper Methods
     */

    // 카드 id로 카드 조회 (없으면 예외)
    private CardVo findCardOrThrow(Long cardId) {
        return cardMapper.findById(cardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CARD_NOT_FOUND));
    }

    // 리스트 id로 소속된 보드를 찾고, 사용자의 편집 권한(MEMBER 이상) 검증
    private Long validateListAndPermission(Long listId, Long userId) {
        // 리스트가 속한 보드 id 찾기
        // -> 리스트가 없으면 보드도 없음
        ListVo list = listMapper.findById(listId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));

        // 보드 작업 권한 확인 -> VIEWER 불가
        memberVal.validateBoardEditor(list.getBoardId(), userId);

        return list.getBoardId();
    }

    // 변경 사항 감지
    private <T> boolean checkChange(T newValue, T oldValue) {
        return newValue != null && !newValue.equals(oldValue);
    }

    // 업데이트 시 특정 필드 초기화
    private void handleRemoveRequests(Long cardId, UpdateCardRequest req) {
        // 우선순위 초기화 요청 처리
        if (Boolean.TRUE.equals(req.getRemovePriority())) {
            cardMapper.deleteCardPriority(cardId);
        }
        // 마감일 초기화 요청 처리
        if (Boolean.TRUE.equals(req.getRemoveDate())) {
            cardMapper.deleteCardDates(cardId);
        }
        // 라벨 삭제 요청 처리
        if (Boolean.TRUE.equals(req.getRemoveLabel())) {
            cardMapper.deleteCardLabel(cardId);
        }
    }

    // 카드 순서 및 리스트 이동
    private void updateCardOrder(CardVo card, Long newListId, Integer newOrder) {
        Long oldListId = card.getListId();
        Integer oldOrder = card.getOrderIndex();

        if (oldListId.equals(newListId)) {
            // Case A: 같은 리스트 내 이동
            if (oldOrder < newOrder) {
                // 아래로 이동: 사이의 카드들을 위로(-1) 당김
                cardMapper.updateOrderIndex(oldListId, oldOrder + 1, newOrder, -1);
            } else if (oldOrder > newOrder) {
                // 위로 이동: 사이의 카드들을 아래로(+1) 밈
                cardMapper.updateOrderIndex(oldListId, newOrder, oldOrder - 1, 1);
            }
        } else {
            // Case B: 다른 리스트로 이동
            // 1) 기존 리스트 정리: 빠진 카드 뒤의 카드들을 당김(-1)
            // Integer.MAX_VALUE를 사용하여 끝까지 업데이트
            cardMapper.updateOrderIndex(oldListId, oldOrder + 1, Integer.MAX_VALUE, -1);

            // 2) 새 리스트 공간 확보: 들어갈 자리 뒤의 카드들을 밈(+1)
            cardMapper.updateOrderIndex(newListId, newOrder, Integer.MAX_VALUE, 1);
        }

        // 3. 대상 카드 정보 업데이트
        card.setListId(newListId);
        card.setOrderIndex(newOrder);
        cardMapper.updateCardLocation(card);
    }

    // [이벤트] 카드 이벤트 발행
    private void publishCardEvent(CardVo card, Long boardId, Long actorId, CardEvent.EventType type, ListVo list, Set<String> changedFields) {
        // 행동한 사용자의 닉네임 조회
        UserVo actor = userMapper.findById(actorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        CardEvent.CardEventBuilder event = CardEvent.builder()
                .cardId(card.getId())
                .cardTitle(card.getTitle())
                .boardId(boardId)
                .actorId(actorId)
                .actorNickname(actor.getNickname()) // 알림 메시지용 이름
                .actorProfileImg(actor.getProfileImg())
                .assigneeId(card.getAssigneeId())
                .isComplete(card.getIsComplete())
                .priority(card.getPriority())
                .dueDate(card.getDueDate())
                .eventType(type)
                .changedFields(changedFields);

        if (list != null) {
            event.listId(list.getId()).listTitle(list.getTitle());
        } else {
            event.listId(card.getListId()); // 현재 리스트 ID 유지
        }

        publisher.publishEvent(event.build());
    }

}
