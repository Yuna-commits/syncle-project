package com.nullpointer.domain.card.controller;

import com.nullpointer.domain.card.dto.CardResponse;
import com.nullpointer.domain.card.dto.CreateCardRequest;
import com.nullpointer.domain.card.service.CardService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Card", description = "카드 생성 및 조회 API")
@RestController
@RequestMapping("/api/lists/{listId}/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    // 카드 생성
    @Operation(summary = "카드 생성", description = "리스트에 새로운 카드를 생성합니다.")
    @PostMapping
    public ApiResponse<Long> createCard(@PathVariable("listId") Long listId,
                                        @RequestBody CreateCardRequest request,
                                        @LoginUser Long userId) {
        return ApiResponse.success(cardService.createCard(listId, request, userId));
    }

    // 카드 목록 조회
    @Operation(summary = "카드 목록 조회", description = "리스트에 속한 카드 목록을 조회합니다.")
    @GetMapping
    public ApiResponse<List<CardResponse>> getCards(@PathVariable("listId") Long listId,
                                                    @LoginUser Long userId) {
        return ApiResponse.success(cardService.getCards(listId, userId));
    }
}
