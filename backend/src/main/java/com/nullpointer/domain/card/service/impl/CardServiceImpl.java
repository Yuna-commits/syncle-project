package com.nullpointer.domain.card.service.impl;

import com.nullpointer.domain.card.dto.CardResponse;
import com.nullpointer.domain.card.dto.CreateCardRequest;
import com.nullpointer.domain.card.dto.MoveCardRequest;
import com.nullpointer.domain.card.mapper.CardMapper;
import com.nullpointer.domain.card.service.CardService;
import com.nullpointer.domain.card.vo.CardVo;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CardServiceImpl implements CardService {

    private final CardMapper cardMapper;

    @Override
    @Transactional
    public Long createCard(Long listId, CreateCardRequest req, Long userId) {

        // 1. 카드 VO 생성 (DTO -> VO)
        CardVo cardVo = req.toVo();
        cardVo.setListId(listId);
        cardVo.setAssigneeId(userId);
        cardVo.setOrderIndex(9999);

        cardMapper.insertCard(cardVo);
        return cardVo.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CardResponse> getCards(Long listId) {
        return cardMapper.findCardsWithDetailsByListId(listId);
    }

    // 카드 이동
    @Override
    @Transactional
    public void moveCard(Long cardId, MoveCardRequest req, Long userId) {
        // 1. 이동할 카드 조회
        CardVo card = cardMapper.findById(cardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CARD_NOT_FOUND));

        Long oldListId = card.getListId();
        Integer oldOrder = card.getOrderIndex();
        Long newListId = req.getListId();
        Integer newOrder = req.getOrderIndex();

        // 2. 순서 재정렬 로직
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
}
