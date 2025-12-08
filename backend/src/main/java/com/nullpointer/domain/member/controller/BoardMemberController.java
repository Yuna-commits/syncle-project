package com.nullpointer.domain.member.controller;

import com.nullpointer.domain.member.dto.board.BoardInviteRequest;
import com.nullpointer.domain.member.dto.board.BoardMemberResponse;
import com.nullpointer.domain.member.dto.board.BoardRoleUpdateRequest;
import com.nullpointer.domain.member.service.BoardMemberService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Board Member", description = "보드 멤버 관리 API")
@RestController
@RequestMapping("/api/boards/{boardId}/members")
@RequiredArgsConstructor
public class BoardMemberController {

    private final BoardMemberService boardMemberService;

    // 보드 멤버 초대
    @Operation(summary = "보드 멤버 초대", description = "기존 팀 멤버를 보드에 초대합니다.")
    @PostMapping("")
    public ApiResponse<String> inviteBoardMember(@PathVariable Long boardId,
                                                 @Valid @RequestBody BoardInviteRequest req,
                                                 @LoginUser Long userId) {

        boardMemberService.inviteBoardMember(boardId, req, userId);
        return ApiResponse.success("보드 멤버 초대 성공");
    }

    // 보드 멤버 조회
    @Operation(summary = "보드 멤버 조회", description = "보드에 참여 중인 멤버 목록을 조회합니다.")
    @GetMapping("")
    public ApiResponse<List<BoardMemberResponse>> getBoardMembers(@PathVariable Long boardId) {
        return ApiResponse.success(boardMemberService.getBoardMembers(boardId));
    }

    // 보드 역할 변경
    @Operation(summary = "보드 멤버 권한 변경", description = "보드 멤버의 역할을 변경합니다.")
    @PatchMapping("/{memberId}")
    public ApiResponse<String> changeBoardMember(@PathVariable Long boardId,
                                                 @PathVariable Long memberId,
                                                 @Valid @RequestBody BoardRoleUpdateRequest req,
                                                 @LoginUser Long userId) {
        boardMemberService.changeBoardRole(boardId, memberId, req, userId);
        return ApiResponse.success("역할 변경 완료");
    }

    // 보드 탈퇴
    @Operation(summary = "보드 멤버 추방/탈퇴", description = "보드 멤버를 제외하거나 스스로 탈퇴합니다.")
    @DeleteMapping("/{memberId}")
    public ApiResponse<String> deleteBoardMember(@PathVariable Long boardId,
                                                 @PathVariable Long memberId,
                                                 @LoginUser Long userId) {
        boardMemberService.deleteBoardMember(boardId, memberId, userId);
        return ApiResponse.success("보드 탈퇴 완료");
    }
}
