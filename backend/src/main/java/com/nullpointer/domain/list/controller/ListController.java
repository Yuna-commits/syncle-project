package com.nullpointer.domain.list.controller;

import com.nullpointer.domain.list.dto.CreateListRequest;
import com.nullpointer.domain.list.dto.ListResponse;
import com.nullpointer.domain.list.dto.UpdateListOrderRequest;
import com.nullpointer.domain.list.service.ListService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 보드 기준 리스트 API
 * <p>
 * POST /api/boards/{boardId}/lists       - 리스트 생성
 * GET  /api/boards/{boardId}/lists       - 리스트 목록 조회
 * PUT  /api/boards/{boardId}/lists/order - 리스트 순서 변경
 */
@Tag(name = "List", description = "리스트 생성 및 조회 API")
@RestController
@RequestMapping("/api/boards/{boardId}/lists")
@RequiredArgsConstructor
public class ListController {

    private final ListService listService;

    // 리스트 생성
    @Operation(summary = "리스트 생성", description = "보드에 새로운 리스트를 생성합니다.")
    @PostMapping
    public ApiResponse<ListResponse> createList(
            @PathVariable("boardId") Long boardId,
            @RequestBody CreateListRequest request,
            @LoginUser Long userId
    ) {
        return ApiResponse.success(listService.createList(boardId, request, userId));
    }

    // 리스트 목록 조회
    @Operation(summary = "리스트 목록 조회", description = "보드에 속한 모든 리스트를 조회합니다.")
    @GetMapping
    public ApiResponse<List<ListResponse>> getLists(
            @PathVariable("boardId") Long boardId,
            @LoginUser Long userId
    ) {
        return ApiResponse.success(listService.getLists(boardId, userId));
    }

    // 리스트 순서 변경
    @Operation(summary = "리스트 순서 변경", description = "드래그 앤 드롭으로 리스트 순서를 변경합니다.")
    @PatchMapping("/order")
    public ApiResponse<String> updateListOrders(
            @PathVariable("boardId") Long boardId,
            @RequestBody List<UpdateListOrderRequest> request,
            @LoginUser Long userId
    ) {
        listService.updateListOrders(boardId, request, userId);
        return ApiResponse.success("리스트 순서 변경");
    }
}
