package com.nullpointer.domain.card.controller;

import com.nullpointer.domain.card.dto.MoveCardRequest;
import com.nullpointer.domain.card.dto.UpdateCardRequest;
import com.nullpointer.domain.card.service.CardService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Card Management", description = "카드 이동 및 수정 API")
@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardManageController {
    private final CardService cardService;

    // 카드 이동
    @Operation(summary = "카드 이동", description = "카드를 다른 리스트나 위치로 이동합니다.")
    @PatchMapping("/{cardId}/move")
    public ApiResponse<String> moveCard(@PathVariable Long cardId,
                                        @RequestBody MoveCardRequest req,
                                        @LoginUser Long userId) {
        cardService.moveCard(cardId, req, userId);
        return ApiResponse.success("카드 이동 성공");
    }

    // 카드 수정
    @Operation(summary = "카드 수정", description = "카드 제목, 설명, 마감일 등 정보를 수정합니다.")
    @PatchMapping("/{cardId}")
    public ApiResponse<String> updateCard(@PathVariable Long cardId,
                                          @RequestBody UpdateCardRequest req,
                                          @LoginUser Long userId) {
        cardService.updateCard(cardId, req, userId);
        return ApiResponse.success("카드 정보 수정");
    }

    // 카드 삭제
    @Operation(summary = "카드 삭제", description = "카드를 삭제합니다 (멤버 등급 이상).")
    @DeleteMapping("/{cardId}")
    public ApiResponse<String> deleteCard(@PathVariable Long cardId,
                                          @LoginUser  Long userId) {
        cardService.deleteCard(cardId, userId);
        return ApiResponse.success("카드 삭제");
    }
}
