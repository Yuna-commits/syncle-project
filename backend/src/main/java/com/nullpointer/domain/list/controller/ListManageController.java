package com.nullpointer.domain.list.controller;

import com.nullpointer.domain.list.dto.UpdateListRequest;
import com.nullpointer.domain.list.service.ListService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import org.springframework.web.bind.annotation.*;

/**
 * 개별 리스트 수정/삭제 API
 * <p>
 * PUT    /api/lists/{listId}  - 리스트 정보 수정
 * DELETE /api/lists/{listId}  - 리스트 삭제 (soft delete)
 * <p>
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
    public ApiResponse<String> updateList(
            @PathVariable("listId") Long listId,
            @RequestBody UpdateListRequest request,
            @LoginUser Long userId
    ) {
        listService.updateList(listId, request, userId);
        return ApiResponse.success("리스트 수정 성공");
    }

    // 리스트 삭제 (soft delete)
    @DeleteMapping("/api/lists/{listId}")
    public ApiResponse<String> deleteList(
            @PathVariable("listId") Long listId,
            @LoginUser Long userId
    ) {
        listService.deleteList(listId, userId);
        return ApiResponse.success("리스트 삭제 성공");
    }
}
