package com.nullpointer.domain.list.controller;

import com.nullpointer.domain.list.dto.UpdateListRequest;
import com.nullpointer.domain.list.service.ListService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 개별 리스트 수정/삭제 API
 * <p>
 * PUT    /api/lists/{listId}  - 리스트 정보 수정
 * DELETE /api/lists/{listId}  - 리스트 삭제 (soft delete)
 * <p>
 * (명세서가 /lists/{listId}, /list/{listId} 라면 아래 경로 문자열만 수정)
 */
@Tag(name = "List Management", description = "리스트 수정 및 삭제 API")
@RestController
@RequestMapping("/api/lists")
@RequiredArgsConstructor // refactor) 수동 생성자 제거
public class ListManageController {

    private final ListService listService;

    // 리스트 정보 수정
    @Operation(summary = "리스트 정보 수정", description = "리스트 제목을 수정합니다.")
    @PutMapping("/{listId}")
    public ApiResponse<String> updateList(
            @PathVariable("listId") Long listId,
            @RequestBody UpdateListRequest request,
            @LoginUser Long userId
    ) {
        listService.updateList(listId, request, userId);
        return ApiResponse.success("리스트 수정 성공");
    }

    // 리스트 아카이브 변경
    @Operation(summary = "리스트 아카이브 상태 변경", description = "리스트 아카이브 상태를 변경합니다.")
    @PatchMapping("/{listId}/archive")
    public ApiResponse<String> updateListArchiveStatus(
            @PathVariable Long listId,
            @RequestParam boolean isArchived,
            @LoginUser Long userId) {
        listService.updateArchiveStatus(listId, isArchived, userId);
        return ApiResponse.success("리스트 아카이브 상태 변경");
    }

    // 리스트 삭제 (soft delete)
    @Operation(summary = "리스트 삭제", description = "리스트를 삭제합니다.")
    @DeleteMapping("/{listId}")
    public ApiResponse<String> deleteList(
            @PathVariable("listId") Long listId,
            @LoginUser Long userId
    ) {
        listService.deleteList(listId, userId);
        return ApiResponse.success("리스트 삭제 성공");
    }
}
