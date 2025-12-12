package com.nullpointer.domain.checklist.service.impl;

import com.nullpointer.domain.card.mapper.CardMapper;
import com.nullpointer.domain.checklist.dto.CreateChecklistRequest;
import com.nullpointer.domain.checklist.dto.UpdateChecklistRequest;
import com.nullpointer.domain.checklist.mapper.ChecklistMapper;
import com.nullpointer.domain.checklist.service.ChecklistService;
import com.nullpointer.domain.checklist.vo.ChecklistVo;
import com.nullpointer.global.common.SocketSender;
import com.nullpointer.global.validator.CardValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChecklistServiceImpl implements ChecklistService {

    private final ChecklistMapper checklistMapper;
    private final CardValidator cardVal;
    private final SocketSender socketSender;

    @Override
    @Transactional
    public Long createChecklist(Long cardId, CreateChecklistRequest req) {
        // 카드 유효성 확인
        cardVal.getValidCard(cardId);

        // dto -> vo 변환
        ChecklistVo checklistVo = req.toVo(cardId);

        // 체크리스트 추가
        checklistMapper.insertChecklist(checklistVo);

        // 보드 ID 조회 및 소켓 전송
        Long boardId = findBoardIdByCardId(cardId);
        socketSender.sendSocketMessage(boardId,"CHECKLIST_CREATE", userId, null);

        return checklistVo.getId();
    }

    private Long findBoardIdByCardId(Long cardId) {
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChecklistVo> getChecklists(Long cardId) {
        return checklistMapper.findByCardId(cardId);
    }

    @Override
    @Transactional
    public void updateChecklist(Long checklistId, UpdateChecklistRequest req) {
        ChecklistVo vo = req.toVo(checklistId);
        checklistMapper.updateChecklist(vo);
    }

    @Override
    @Transactional
    public void deleteChecklist(Long checklistId) {
        checklistMapper.deleteChecklist(checklistId);
    }
}
