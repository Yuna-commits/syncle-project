package com.nullpointer.domain.card.service;

import com.nullpointer.domain.board.mapper.BoardMapper;
import com.nullpointer.domain.board.vo.BoardSettingVo;
import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.domain.card.dto.CardResponse;
import com.nullpointer.domain.card.dto.CreateCardRequest;
import com.nullpointer.domain.card.dto.MoveCardRequest;
import com.nullpointer.domain.card.dto.UpdateCardRequest;
import com.nullpointer.domain.card.helper.CardEventHelper;
import com.nullpointer.domain.card.helper.CardOrderManager;
import com.nullpointer.domain.card.mapper.CardMapper;
import com.nullpointer.domain.card.vo.CardVo;
import com.nullpointer.domain.card.vo.enums.Priority;
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

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import java.util.function.Function;

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
    private final BoardMapper boardMapper;

    @Override
    @Transactional
    public CardResponse createCard(Long listId, CreateCardRequest req, Long userId) {
        // 리스트 확인 & 권한 검증
        Long boardId = validateListAndPermission(listId, userId, false);
        BoardVo board = boardMapper.findBoardByBoardId(boardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));
        UserVo actor = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

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

        // [이벤트] 카드 생성 이벤트 발행
        cardEventHelper.publishCardCreateEvent(actor, cardVo, boardId, board.getTeamId(), actor.getNickname());

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
        CardVo card = cardMapper.findById(cardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CARD_NOT_FOUND));

        // 권한 검증 & 보드 id 조회
        Long boardId = validateListAndPermission(card.getListId(), userId, false);

        BoardVo board = boardMapper.findBoardByBoardId(boardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));

        // 이동 전 리스트 정보 조회 (로그용)
        ListVo prevList = listMapper.findById(card.getListId())
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));

        UserVo actor = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 순서 및 리스트 변경
        cardOrderManager.moveCardOrder(card, req.getListId(), req.getOrderIndex());

        // 이동 후 리스트 정보 조회
        ListVo nextList = listMapper.findById(req.getListId())
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));

        // 이동 정보 저장
        Map<String, Object> data = new HashMap<>();
        data.put("cardId", card.getId());
        data.put("ListId", card.getListId());
        data.put("newIndex", req.getOrderIndex());

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "CARD_MOVE", userId, data);

        // [이벤트] 카드 이동 알림 발행 (담당자가 있고, 본인이 담당자가 아닐 때 <- 내부에서 검증)
        cardEventHelper.publishCardMoveEvent(actor, card, boardId, board.getTeamId(), prevList, nextList);
    }

    // 카드 수정
    @Override
    @Transactional
    public CardResponse updateCard(Long cardId, UpdateCardRequest req, Long userId) {
        // 카드 조회
        CardVo card = cardMapper.findById(cardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CARD_NOT_FOUND));
        // 권한 검증 & 보드 id 조회
        Long boardId = validateListAndPermission(card.getListId(), userId, false);
        BoardVo board = boardMapper.findBoardByBoardId(boardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));
        UserVo actor = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        Long teamId = board.getTeamId();

        // 1. 담당자 변경
        handleAssigneeChange(card, req.getAssigneeId(), boardId, teamId, actor);

        // 2. 주요 필드 변경
        checkAndUpdate(actor, card, boardId, teamId,
                req.getPriority(), card.getPriority(), "중요도",
                this::convertPriority, card::setPriority);

        checkAndUpdate(actor, card, boardId, teamId,
                req.getIsComplete(), card.getIsComplete(), "진행 상태",
                this::convertComplete, card::setIsComplete);

        checkAndUpdate(actor, card, boardId, teamId,
                req.getDueDate(), card.getDueDate(), "마감일",
                this::formatDate, card::setDueDate);

        checkAndUpdate(actor, card, boardId, teamId,
                req.getIsArchived(), card.getIsArchived(), "카드 상태",
                this::convertArchive, card::setIsArchived);

        if (req.getLabel() != null && !req.getLabel().equals(card.getLabel())) {
            checkAndUpdate(actor, card, boardId, teamId,
                    req.getLabel(), card.getLabel(), "라벨",
                    val -> val == null ? "없음" : val, card::setLabel);
        }
        
        // 라벨 색상 (로그 없음)
        if (req.getLabelColor() != null) {
            card.setLabelColor(req.getLabelColor());
        }

        // 시작일 (로그 없이 값만 업데이트)
        if (req.getStartDate() != null && !req.getStartDate().equals(card.getStartDate())) {
            card.setStartDate(req.getStartDate());
        }

        // 3. 삭제 플래그 처리 (초기화)
        handleRemovals(req, card, actor, boardId, teamId);

        // 4. 일반 필드(제목/설명/라벨) 업데이트 및 멘션 처리
        boolean isGeneralUpdated = updateContentFields(card, req, actor, boardId, teamId);

        // 5. DB 반영 및 소켓 전송
        cardMapper.updateCard(card);
        CardResponse response = cardMapper.findCardDetailById(cardId);
        socketSender.sendSocketMessage(boardId, "CARD_UPDATE", userId, response);

        // 6. 일반 수정 이벤트 (상세 내용이 없는 경우)
        if (isGeneralUpdated) {
            cardEventHelper.publishCardUpdateEvent(
                    actor, card, boardId, teamId, null, null, null, null);
        }

        return response;
    }

    // 카드 삭제
    @Override
    @Transactional
    public void deleteCard(Long cardId, Long userId) {
        // 데이터 조회
        CardVo card = cardMapper.findById(cardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CARD_NOT_FOUND));
        // 권한 검증
        Long boardId = validateListAndPermission(card.getListId(), userId, false);
        BoardVo board = boardMapper.findBoardByBoardId(boardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));
        UserVo actor = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 권한 확인 (보드 권한 설정에 따라)
        memberVal.validateBoardSetting(boardId, userId, BoardSettingVo::getCardDeletePermission);

        // 카드 삭제
        cardMapper.deleteCard(cardId);

        // 삭제된 카드 정보 저장
        Map<String, Object> data = new HashMap<>();
        data.put("cardId", cardId);
        data.put("listId", card.getListId());

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "CARD_DELETE", userId, data);

        // [이벤트] 카드 삭제 이벤트 발행
        cardEventHelper.publishCardDeleteEvent(actor, card, boardId, board.getTeamId());
    }

    /**
     * Helper Methods
     */

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

    // 변경 사항 감지 -> 로그 문자열 변환 -> 이벤트 발행 -> 값 설정
    private <T> void checkAndUpdate(UserVo actor, CardVo card, Long boardId, Long teamId,
                                    T newValue, T oldValue, String fieldName,
                                    Function<T, String> converter, Consumer<T> setter) {
        if (newValue != null && !newValue.equals(oldValue)) {
            String oldStr = converter.apply(oldValue);
            String newStr = converter.apply(newValue);

            // 상세 변경 이벤트 발행 (A -> B)
            cardEventHelper.publishCardUpdateEvent(actor, card, boardId, teamId, null, fieldName, oldStr, newStr);
            setter.accept(newValue);
        }
    }

    // 담당자 변경 이벤트 발행
    private void handleAssigneeChange(CardVo card, Long newAssigneeId, Long boardId, Long teamId, UserVo actor) {
        if (newAssigneeId != null && !newAssigneeId.equals(card.getAssigneeId())) {
            memberVal.validateBoardViewer(boardId, newAssigneeId); // 권한 체크

            String nickname = userMapper.findById(newAssigneeId)
                    .map(UserVo::getNickname).orElse("알 수 없음"); // 닉네임 조회

            card.setAssigneeId(newAssigneeId);
            cardMapper.updateCardAssignee(card.getId(), newAssigneeId);

            // 담당자 변경 이벤트 발행
            cardEventHelper.publishCardUpdateEvent(actor, card, boardId, teamId, nickname, null, null, null);
        }
    }

    // 삭제 플래그 처리 (초기화)
    private void handleRemovals(UpdateCardRequest req, CardVo card, UserVo actor, Long boardId, Long teamId) {
        // 제거 요청이 있고, 기존 값이 존재할 때만 이벤트 발생 및 삭제
        if (Boolean.TRUE.equals(req.getRemovePriority()) && card.getPriority() != null) {
            String oldVal = convertPriority(card.getPriority());
            cardEventHelper.publishCardUpdateEvent(actor, card, boardId, teamId, null, "중요도", oldVal, "없음");
            card.setPriority(null);
            cardMapper.deleteCardPriority(card.getId());
        }
        if (Boolean.TRUE.equals(req.getRemoveDate()) && card.getDueDate() != null) {
            String oldVal = formatDate(card.getDueDate());
            cardEventHelper.publishCardUpdateEvent(actor, card, boardId, teamId, null, "마감일", oldVal, "미지정");
            card.setDueDate(null);
            card.setStartDate(null);
            cardMapper.deleteCardDates(card.getId());
        }
        if (Boolean.TRUE.equals(req.getRemoveLabel()) && card.getLabel() != null) {
            cardEventHelper.publishCardUpdateEvent(actor, card, boardId, teamId, null, "라벨", card.getLabel(), "삭제됨");
            card.setLabel(null);
            card.setLabelColor(null);
            cardMapper.deleteCardLabel(card.getId());
        }
    }

    private boolean updateContentFields(CardVo card, UpdateCardRequest req, UserVo actor, Long boardId, Long teamId) {
        boolean changed = false;
        if (req.getTitle() != null && !req.getTitle().equals(card.getTitle())) {
            card.setTitle(req.getTitle());
            changed = true;
        }
        if (req.getDescription() != null && !req.getDescription().equals(card.getDescription())) {
            cardEventHelper.processDescriptionMentions(actor, card, boardId, teamId, req.getDescription());
            card.setDescription(req.getDescription());
            changed = true;
        }
        // 라벨 변경 로직 등
        return changed;
    }

    // --- Converters ---
    private String convertPriority(Priority p) {
        return p == null ? "없음" : p.getLabel();
    }

    private String convertComplete(Boolean b) {
        return Boolean.TRUE.equals(b) ? "완료" : "진행 중";
    }

    private String convertArchive(Boolean b) {
        return Boolean.TRUE.equals(b) ? "보관" : "일반";
    }

    private String formatDate(LocalDateTime d) {
        return d == null ? "미지정" : d.format(DateTimeFormatter.ofPattern("MM월 dd일"));
    }
}
