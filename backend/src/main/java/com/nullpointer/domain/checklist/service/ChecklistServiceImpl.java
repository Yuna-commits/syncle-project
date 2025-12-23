package com.nullpointer.domain.checklist.service;

import com.nullpointer.domain.board.mapper.BoardMapper;
import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.domain.card.event.CardEvent;
import com.nullpointer.domain.card.mapper.CardMapper;
import com.nullpointer.domain.card.vo.CardVo;
import com.nullpointer.domain.checklist.dto.CreateChecklistRequest;
import com.nullpointer.domain.checklist.dto.UpdateChecklistRequest;
import com.nullpointer.domain.checklist.mapper.ChecklistMapper;
import com.nullpointer.domain.checklist.vo.ChecklistVo;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.global.common.SocketSender;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.validator.CardValidator;
import com.nullpointer.global.validator.MemberValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChecklistServiceImpl implements ChecklistService {

    private final ChecklistMapper checklistMapper;
    private final UserMapper userMapper;

    private final CardValidator cardVal;
    private final MemberValidator memberVal;
    private final SocketSender socketSender;
    private final ApplicationEventPublisher publisher;
    private final CardMapper cardMapper;
    private final BoardMapper boardMapper;

    @Override
    @Transactional
    public Long createChecklist(Long cardId, CreateChecklistRequest req, Long userId) {
        // 카드 유효성 확인
        cardVal.getValidCard(cardId);

        // [권한 검증] MEMBER 이상
        Long boardId = cardVal.findBoardIdByCardId(cardId);
        memberVal.validateBoardEditor(boardId, userId);

        // dto -> vo 변환
        ChecklistVo checklistVo = req.toVo(cardId);

        // 체크리스트 추가
        checklistMapper.insertChecklist(checklistVo);

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "CHECKLIST_CREATE", userId, null);

        return checklistVo.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChecklistVo> getChecklists(Long cardId, Long userId) {
        // 카드 존재 확인
        cardVal.getValidCard(cardId);

        // [권한 검증] VIEWER 이상
        Long boardId = cardVal.findBoardIdByCardId(cardId);
        memberVal.validateBoardViewer(boardId, userId);

        return checklistMapper.findByCardId(cardId);
    }

    @Override
    @Transactional
    public void updateChecklist(Long checklistId, UpdateChecklistRequest req, Long userId) {
        // 체크리스트 조회
        ChecklistVo checklist = checklistMapper.findById(checklistId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHECKLIST_NOT_FOUND));

        // [권한 검증] MEMBER 이상
        Long boardId = cardVal.findBoardIdByCardId(checklist.getCardId());
        memberVal.validateBoardEditor(boardId, userId);

        // 업데이트
        Boolean oldDone = checklist.getDone();
        ChecklistVo updateVo = req.toVo(checklistId);
        checklistMapper.updateChecklist(updateVo);

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "CHECKLIST_UPDATE", userId, null);

        // [알림] 체크리스트 완료 상태 변경 알림
        if (req.getDone() != null && !req.getDone().equals(oldDone)) {
            publishChecklistEvent(checklist.getCardId(), userId, checklist.getTitle(), req.getDone());
        }
    }

    @Override
    @Transactional
    public void deleteChecklist(Long checklistId, Long userId) {
        // 체크리스트 조회
        ChecklistVo checklist = checklistMapper.findById(checklistId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHECKLIST_NOT_FOUND));

        // [권한 검증] MEMBER 이상
        Long boardId = cardVal.findBoardIdByCardId(checklist.getCardId());
        memberVal.validateBoardEditor(boardId, userId);

        checklistMapper.deleteChecklist(checklistId);

        // 보드 ID 조회 및 소켓 전송
        socketSender.sendSocketMessage(boardId, "CHECKLIST_CREATE", userId, null);
    }

    /**
     * Helper Methods
     */

    // [이벤트] 체크리스트 이벤트 발행
    private void publishChecklistEvent(Long cardId, Long actorId, String content, Boolean isDone) {
        CardVo card = cardMapper.findById(cardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CARD_NOT_FOUND));
        UserVo actor = userMapper.findById(actorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        Long boardId = cardVal.findBoardIdByCardId(cardId);
        BoardVo board = boardMapper.findBoardByBoardId(boardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));

        CardEvent event = CardEvent.builder()
                .cardId(card.getId())
                .cardTitle(card.getTitle())
                .boardId(boardId)
                .teamId(board.getTeamId())
                .listId(card.getListId())
                .actorId(actor.getId())
                .actorNickname(actor.getNickname())
                .actorProfileImg(actor.getProfileImg())
                .assigneeId(card.getAssigneeId()) // 담당자에게 알림
                .content(content)
                .isChecked(isDone)
                .eventType(CardEvent.EventType.CHECKLIST)
                .build();

        publisher.publishEvent(event);
    }
}
