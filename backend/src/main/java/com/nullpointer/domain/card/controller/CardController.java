package com.nullpointer.domain.card.controller;

import com.nullpointer.domain.card.dto.CardResponse;
import com.nullpointer.domain.card.dto.CreateCardRequest;
import com.nullpointer.domain.card.service.CardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 카드 관련 HTTP API
 *
 * POST /api/lists/{listId}/cards
 */

@RestController
@RequestMapping("/api/lists/{listId}/cards")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @PostMapping
    public ResponseEntity<CardResponse> createCard(
            @PathVariable("listId") Long listId,
            @RequestBody CreateCardRequest request
    ) {
        CardResponse response = cardService.createCard(listId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
