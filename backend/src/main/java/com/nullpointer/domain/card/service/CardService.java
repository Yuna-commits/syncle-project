package com.nullpointer.domain.card.service;

import com.nullpointer.domain.card.dto.CardResponse;
import com.nullpointer.domain.card.dto.CreateCardRequest;
import com.nullpointer.domain.card.dto.MoveCardRequest;
import com.nullpointer.domain.card.dto.UpdateCardRequest;

import java.util.List;

public interface CardService {

    // 카드 생성
    CardResponse createCard(Long listId, CreateCardRequest request, Long userId);

    // 카드 목록 조회
    List<CardResponse> getCards(Long listId, Long userId);

    // 카드 이동
    void moveCard(Long cardId, MoveCardRequest req, Long userId);

    // 카드 수정
    CardResponse updateCard(Long cardId, UpdateCardRequest req, Long userId);

    // 카드 삭제
    void deleteCard(Long cardId, Long userId);

    List<CardResponse> getMyCards(Long userId, Long teamId, Long boardId);
}
