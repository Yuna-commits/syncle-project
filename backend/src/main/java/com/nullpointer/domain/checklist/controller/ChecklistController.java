package com.nullpointer.domain.checklist.controller;

import com.nullpointer.domain.checklist.dto.CreateChecklistRequest;
import com.nullpointer.domain.checklist.dto.UpdateChecklistRequest;
import com.nullpointer.domain.checklist.service.ChecklistService;
import com.nullpointer.domain.checklist.vo.ChecklistVo;
import com.nullpointer.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Checklist", description = "카드 체크리스트 관리 API")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChecklistController {
    private final ChecklistService checklistService;

    // 체크리스트 추가
    @Operation(summary = "체크리스트 생성", description = "카드에 새로운 체크리스트 아이템을 추가합니다.")
    @PostMapping("/cards/{cardId}/checklists")
    public ApiResponse<Long> createCheckList(@PathVariable Long cardId,
                                             @RequestBody CreateChecklistRequest req) {
        Long checklistId = checklistService.createChecklist(cardId, req);
        return ApiResponse.success(checklistId);
    }

    // 특정 카드의 체크리스트 목록 조회
    @Operation(summary = "체크리스트 조회", description = "카드의 모든 체크리스트 아이템을 조회합니다.")
    @GetMapping("/cards/{cardId}/checklists")
    public ApiResponse<List<ChecklistVo>> getChecklists(@PathVariable Long cardId) {
        return ApiResponse.success(checklistService.getChecklists(cardId));
    }

    // 3. 체크리스트 수정 (완료 토글, 내용 수정)
    @Operation(summary = "체크리스트 수정", description = "체크리스트 아이템의 내용이나 완료 상태를 수정합니다.")
    @PatchMapping("/checklists/{checklistId}")
    public ApiResponse<String> updateChecklist(@PathVariable Long checklistId,
                                               @RequestBody UpdateChecklistRequest req) {
        checklistService.updateChecklist(checklistId, req);
        return ApiResponse.success("체크리스트 수정 성공");
    }

    // 4. 체크리스트 삭제
    @Operation(summary = "체크리스트 삭제", description = "체크리스트 아이템을 삭제합니다.")
    @DeleteMapping("/checklists/{checklistId}")
    public ApiResponse<String> deleteChecklist(@PathVariable Long checklistId) {
        checklistService.deleteChecklist(checklistId);
        return ApiResponse.success("체크리스트 삭제 성공");
    }
}
