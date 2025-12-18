package com.nullpointer.domain.card.service.impl;

import com.nullpointer.domain.card.dto.CardResponse;
import com.nullpointer.domain.card.dto.CreateCardRequest;
import com.nullpointer.domain.card.dto.MoveCardRequest;
import com.nullpointer.domain.card.dto.UpdateCardRequest;
import com.nullpointer.domain.card.helper.CardEventHelper;
import com.nullpointer.domain.card.helper.CardOrderManager;
import com.nullpointer.domain.card.mapper.CardMapper;
import com.nullpointer.domain.card.service.CardService;
import com.nullpointer.domain.card.vo.CardVo;
import com.nullpointer.domain.list.mapper.ListMapper;
import com.nullpointer.domain.list.vo.ListVo;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.global.common.SocketSender;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.validator.MemberValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CardServiceImpl implements CardService {

    private final CardMapper cardMapper;
    private final ListMapper listMapper;
    private final UserMapper userMapper;

    private final MemberValidator memberVal;
    private final CardOrderManager cardOrderManager;
    private final CardEventHelper cardEventHelper;
    private final SocketSender socketSender;

    @Override
    @Transactional
    public CardResponse createCard(Long listId, CreateCardRequest req, Long userId) {
        // 리스트 확인 & 권한 검증
        Long boardId = validateListAndPermission(listId, userId, false);

        // 카드 VO 생성 (DTO -> VO)
        CardVo cardVo = CardVo.builder()
                .listId(listId)
                .title(req.getTitle())
                .description(req.getDescription())
                .assigneeId(userId) // 생성자를 초기 담당자로 설정
                .build();

        // DB 저장
        cardMapper.insertCard(cardVo);

        // 생성된 카드 상세 정보 조회
        CardResponse response = cardMapper.findCardDetailById(cardVo.getId());

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "CARD_CREATE", userId, response);

        // 담당자 정보 포함 응답 반환
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CardResponse> getCards(Long listId, Long userId) {
        validateListAndPermission(listId, userId, true);
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
        Long boardId = validateListAndPermission(req.getListId(), userId, false);

        UserVo actor = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 순서 및 리스트 변경
        cardOrderManager.moveCardOrder(card, req.getListId(), req.getOrderIndex());

        // 이동 정보 저장
        Map<String, Object> data = new HashMap<>();
        data.put("cardId", card.getId());
        data.put("ListId", card.getListId());
        data.put("newIndex", req.getOrderIndex());

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "CARD_MOVE", userId, data);

        // [이벤트] 카드 이동 알림 발행 (담당자가 있고, 본인이 담당자가 아닐 때 <- 내부에서 검증)
        cardEventHelper.publishCardMoveEvent(actor, card, boardId, req.getListId());
    }

    // 카드 수정
    @Override
    @Transactional
    public CardResponse updateCard(Long cardId, UpdateCardRequest req, Long userId) {
        // 카드 조회
        CardVo card = findCardOrThrow(cardId);
        // 권한 검증 & 보드 id 조회
        Long boardId = validateListAndPermission(card.getListId(), userId, false);

        UserVo actor = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Set<String> changedFields = new HashSet<>();

        // 주요 필드 변경 감지 & 카드 객체 업데이트
        boolean isAssigneeChanged = applyChanges(card, req, boardId, changedFields);

        // [이벤트] 카드 설명 변경 시 멘션 알림 발행
        cardEventHelper.processDescriptionMentions(actor, card, boardId, req.getDescription());

        // 카드 정보 업데이트
        CardVo updateVo = CardVo.builder()
                .id(cardId)
                .title(req.getTitle() != null ? req.getTitle() : card.getTitle()) // null이면 기존 값 유지
                .description(req.getDescription() != null ? req.getDescription() : card.getDescription())
                .startDate(req.getStartDate() != null ? req.getStartDate() : card.getStartDate())
                .label(req.getLabel() != null ? req.getLabel() : card.getLabel())
                .labelColor(req.getLabelColor() != null ? req.getLabelColor() : card.getLabelColor())
                // applyChanges에서 이미 최신화된 필드는 card 객체에서 가져옴
                .priority(card.getPriority())
                .isComplete(card.getIsComplete())
                .dueDate(card.getDueDate())
                .build();

        // 업데이트 진행
        cardMapper.updateCard(updateVo);

        // 초기화 요청 처리 (날짜, 라벨, 우선순위 제거)
        handleRemoveRequests(cardId, req);

        // 업데이트 된 카드 정보 조회
        CardResponse response = cardMapper.findCardDetailById(card.getId());

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "CARD_UPDATE", userId, response);

        // [이벤트] 카드 변경 알림 발행
        cardEventHelper.publishCardUpdateEvent(actor, card, boardId, changedFields, isAssigneeChanged);

        return response;
    }

    // 카드 삭제
    @Override
    @Transactional
    public void deleteCard(Long cardId, Long userId) {
        // 카드 조회
        CardVo card = findCardOrThrow(cardId);

        // 권한 검증
        Long boardId = validateListAndPermission(card.getListId(), userId, false);

        // 카드 삭제
        cardMapper.deleteCard(cardId);

        // 삭제된 카드 정보 저장
        Map<String, Object> data = new HashMap<>();
        data.put("cardId", cardId);
        data.put("listId", card.getListId());

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "CARD_DELETE", userId, data);
    }

    /**
     * Helper Methods
     */

    // 변경 사항 적용 & 변경된 필드 수집
    private boolean applyChanges(CardVo card, UpdateCardRequest req, Long boardId, Set<String> changedFields) {
        // 담당자 변경 확인
        boolean isAssigneeChanged = false;

        if (checkChange(req.getAssigneeId(), card.getAssigneeId())) {
            // 본인이 담당자가 아니고 담당자로 지정된 사람이 보드에 접근 가능한지 확인 (VIEWER 이상)
            memberVal.validateBoardViewer(boardId, req.getAssigneeId());
            cardMapper.updateCardAssignee(card.getId(), req.getAssigneeId());
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

        return isAssigneeChanged;
    }

    // 카드 id로 카드 조회 (없으면 예외)
    private CardVo findCardOrThrow(Long cardId) {
        return cardMapper.findById(cardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CARD_NOT_FOUND));
    }

    // 리스트 id로 소속된 보드를 찾고, 사용자의 편집 권한(MEMBER 이상) 검증
    private Long validateListAndPermission(Long listId, Long userId, boolean readOnly) {
        // 리스트가 속한 보드 id 찾기
        // -> 리스트가 없으면 보드도 없음
        ListVo list = listMapper.findById(listId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));

        if (readOnly) {
            memberVal.validateBoardViewer(list.getBoardId(), userId);
        } else {
            // 보드 작업 권한 확인 -> VIEWER 불가
            memberVal.validateBoardEditor(list.getBoardId(), userId);
        }

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

}
