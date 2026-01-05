package com.nullpointer.domain.team.controller;

import com.nullpointer.domain.team.dto.request.CreateNoticeRequest;
import com.nullpointer.domain.team.dto.request.UpdateNoticeRequest;
import com.nullpointer.domain.team.dto.response.TeamNoticeResponse;
import com.nullpointer.domain.team.service.TeamNoticeService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "TeamNotice", description = "팀 공지사항 생성 및 관리 API")
@RestController
@RequestMapping("/api/teams/{teamId}/notices")
@RequiredArgsConstructor
public class TeamNoticeController {

    private final TeamNoticeService noticeService;

    // 목록 조회
    @Operation(summary = "팀 공지사항 목록 조회", description = "팀의 모든 공지사항을 조회합니다. (중요 공지 상단 고정, 최신순 정렬)")
    @GetMapping
    public ApiResponse<List<TeamNoticeResponse>> getNotices(@PathVariable Long teamId,
                                                            @LoginUser Long userId) {
        return ApiResponse.success(noticeService.getNotices(teamId, userId));
    }

    // 상세 조회
    @Operation(summary = "팀 공지사항 상세 조회", description = "공지사항 내용을 상세 조회하고 조회수를 1 증가시킵니다.")
    @GetMapping("/{noticeId}")
    public ApiResponse<TeamNoticeResponse> getNoticeDetail(@PathVariable Long teamId,
                                                           @PathVariable Long noticeId,
                                                           @LoginUser Long userId) {
        return ApiResponse.success(noticeService.getNoticeDetail(noticeId, userId));
    }

    // 공지사항 등록
    @Operation(summary = "팀 공지사항 등록", description = "새로운 공지사항을 등록합니다. (팀 OWNER 권한 필요)")
    @PostMapping
    public ApiResponse<String> createNotice(@PathVariable Long teamId,
                                            @RequestBody @Valid CreateNoticeRequest req,
                                            @LoginUser Long userId) {
        noticeService.createNotice(teamId, req, userId);
        return ApiResponse.success("공지사항이 등록되었습니다.");
    }

    // 공지사항 수정
    @Operation(summary = "팀 공지사항 수정", description = "기존 공지사항을 수정합니다. (팀 OWNER 권한 필요)")
    @PatchMapping("/{noticeId}")
    public ApiResponse<String> updateNotice(@PathVariable Long noticeId,
                                            @RequestBody @Valid UpdateNoticeRequest req,
                                            @PathVariable Long teamId,
                                            @LoginUser Long userId) {
        noticeService.updateNotice(noticeId, req, teamId, userId);
        return ApiResponse.success("공지사항이 수정되었습니다.");
    }

    // 공지사항 삭제
    @Operation(summary = "팀 공지사항 삭제", description = "공지사항을 삭제합니다. (Soft Delete, 팀 OWNER 권한 필요)")
    @DeleteMapping("/{noticeId}")
    public ApiResponse<String> deleteNotice(@PathVariable Long noticeId,
                                            @PathVariable Long teamId,
                                            @LoginUser Long userId) {
        noticeService.deleteNotice(noticeId, teamId, userId);
        return ApiResponse.success("공지사항이 삭제되었습니다.");
    }

}
