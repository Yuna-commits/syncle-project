package com.nullpointer.domain.card.service;

import com.nullpointer.domain.card.dto.CardResponse;
import com.nullpointer.domain.card.dto.CreateCardRequest;

public interface CardService {

    CardResponse createCard(Long listId, CreateCardRequest request);
}
