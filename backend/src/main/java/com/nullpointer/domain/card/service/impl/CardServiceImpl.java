package com.nullpointer.domain.card.service.impl;

import com.nullpointer.domain.card.dto.CardResponse;
import com.nullpointer.domain.card.dto.CreateCardRequest;
import com.nullpointer.domain.card.mapper.CardMapper;
import com.nullpointer.domain.card.service.CardService;
import com.nullpointer.domain.card.vo.CardVo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CardServiceImpl implements CardService {

    private final CardMapper cardMapper;

    public CardServiceImpl(CardMapper cardMapper) {
        this.cardMapper = cardMapper;
    }

    @Override
    @Transactional
    public CardResponse createCard(Long listId, CreateCardRequest request) {
        CardVo cardVo = new CardVo();
        cardVo.setListId(listId);
        cardVo.setTitle(request.getTitle());
        cardVo.setDescription(request.getDescription());

        cardMapper.insertCard(cardVo);

        CardResponse response = new CardResponse();
        response.setId(cardVo.getId());
        response.setListId(cardVo.getListId());
        response.setTitle(cardVo.getTitle());
        response.setDescription(cardVo.getDescription());

        return response;
    }
}
