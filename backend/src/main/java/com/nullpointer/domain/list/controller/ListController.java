package com.nullpointer.domain.list.controller;

import com.nullpointer.domain.list.dto.CreateListRequest;
import com.nullpointer.domain.list.dto.ListResponse;
import com.nullpointer.domain.list.dto.UpdateListOrderRequest;
import com.nullpointer.domain.list.service.ListService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
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
@RestController
@RequestMapping("/api/boards/{boardId}/lists")
@RequiredArgsConstructor
public class ListController {

    private final ListService listService;

    // 리스트 생성
    @PostMapping
    public ApiResponse<ListResponse> createList(
            @PathVariable("boardId") Long boardId,
            @RequestBody CreateListRequest request,
            @LoginUser Long userId
    ) {
        return ApiResponse.success(listService.createList(boardId, request, userId));
    }

    // 리스트 목록 조회
    @GetMapping
    public ApiResponse<List<ListResponse>> getLists(
            @PathVariable("boardId") Long boardId,
            @LoginUser Long userId
    ) {
        return ApiResponse.success(listService.getLists(boardId, userId));
    }

    // 리스트 순서 변경
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
