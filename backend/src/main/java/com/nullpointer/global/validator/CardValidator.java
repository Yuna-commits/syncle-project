package com.nullpointer.global.validator;

import com.nullpointer.domain.card.mapper.CardMapper;
import com.nullpointer.domain.card.vo.CardVo;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CardValidator {
    private final CardMapper cardMapper;

    // ========================================================
    //  1. 리소스 존재 및 유효성 확인
    // ========================================================

    /**
     * 유효한 카드 가져오기
     */

    public CardVo getValidCard(Long cardId) {
        CardVo card = cardMapper.findById(cardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CARD_NOT_FOUND));

        if (card.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.CARD_DELETED);
        }

        return card;
    }

    /**
     * 유효한 카드 가져오기
     */
}