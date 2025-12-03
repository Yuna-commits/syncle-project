package com.nullpointer.domain.list.controller;

import com.nullpointer.domain.list.dto.CreateListRequest;
import com.nullpointer.domain.list.dto.ListResponse;
import com.nullpointer.domain.list.dto.UpdateListOrderRequest;
import com.nullpointer.domain.list.service.ListService;
import com.nullpointer.global.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 보드 기준 리스트 API
 *
 * POST /api/boards/{boardId}/lists       - 리스트 생성
 * GET  /api/boards/{boardId}/lists       - 리스트 목록 조회
 * PUT  /api/boards/{boardId}/lists/order - 리스트 순서 변경
 */
@RestController
@RequestMapping("/api/boards/{boardId}/lists")
public class ListController {

    private final ListService listService;

    public ListController(ListService listService) {
        this.listService = listService;
    }

    // 리스트 생성
    @PostMapping
    public ApiResponse<String> createList(
            @PathVariable("boardId") Long boardId,
            @RequestBody CreateListRequest request
    ) {
        listService.createList(boardId, request);
        return ApiResponse.success("리스트 생성 성공");
    }

    // 리스트 목록 조회
    @GetMapping
    public ApiResponse<List<ListResponse>> getLists(
            @PathVariable("boardId") Long boardId
    ) {
        return ApiResponse.success(listService.getLists(boardId));
    }

    // 여러 리스트 순서 변경
    @PutMapping("/order")
    public ApiResponse<String> updateListOrders(
            @PathVariable("boardId") Long boardId,
            @RequestBody UpdateListOrderRequest request
    ) {
        listService.updateListOrders(boardId, request);
        return ApiResponse.success("리스트 순서 변경");
    }
}
