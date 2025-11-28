package com.nullpointer.domain.list.controller;

import com.nullpointer.domain.list.dto.UpdateListRequest;
import com.nullpointer.domain.list.service.ListService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 개별 리스트 수정/삭제 API
 *
 * PUT    /api/lists/{listId}  - 리스트 정보 수정
 * DELETE /api/lists/{listId}  - 리스트 삭제 (soft delete)
 *
 * (명세서가 /lists/{listId}, /list/{listId} 라면 아래 경로 문자열만 수정)
 */
@RestController
public class ListManageController {

    private final ListService listService;

    public ListManageController(ListService listService) {
        this.listService = listService;
    }

    // 리스트 정보 수정
    @PutMapping("/api/lists/{listId}")
    public ResponseEntity<Void> updateList(
            @PathVariable("listId") Long listId,
            @RequestBody UpdateListRequest request
    ) {
        listService.updateList(listId, request);
        return ResponseEntity.noContent().build();
    }

    // 리스트 삭제 (soft delete)
    @DeleteMapping("/api/lists/{listId}")
    public ResponseEntity<Void> deleteList(
            @PathVariable("listId") Long listId
    ) {
        listService.deleteList(listId);
        return ResponseEntity.noContent().build();
    }
}
