package com.nullpointer.domain.list.controller;

import com.nullpointer.domain.list.dto.CreateListRequest;
import com.nullpointer.domain.list.dto.ListResponse;
import com.nullpointer.domain.list.service.ListService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 리스트 관련 HTTP API
 *
 * POST /api/boards/{boardId}/lists
 */
@RestController
@RequestMapping("/api/boards/{boardId}/lists")
public class ListController {

    private final ListService listService;

    public ListController(ListService listService) {
        this.listService = listService;
    }

    @PostMapping
    public ResponseEntity<ListResponse> createList(
            @PathVariable("boardId") Long boardId,
            @RequestBody CreateListRequest request
    ) {
        ListResponse response = listService.createList(boardId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
