package com.nullpointer.domain.card.controller;

import com.nullpointer.domain.card.dto.CardResponse;
import com.nullpointer.domain.card.dto.CreateCardRequest;
import com.nullpointer.domain.card.service.CardService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lists/{listId}/cards")
@RequiredArgsConstructor

public class CardController {

    private final CardService cardService;

    // 카드 생성
    @PostMapping
    public ApiResponse<Long> createCard(@PathVariable("listId") Long listId,
                                        @RequestBody CreateCardRequest request,
                                        @LoginUser Long userId) {
        return ApiResponse.success(cardService.createCard(listId, request, userId));
    }

    // 카드 목록 조회
    @GetMapping
    public ApiResponse<List<CardResponse>> getCards(@PathVariable("listId") Long listId,
                                                    @LoginUser Long userId) {
        return ApiResponse.success(cardService.getCards(listId, userId));
    }
}
