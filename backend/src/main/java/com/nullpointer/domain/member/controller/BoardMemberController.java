package com.nullpointer.domain.member.controller;

import com.nullpointer.domain.member.dto.board.BoardInviteRequest;
import com.nullpointer.domain.member.dto.board.BoardMemberResponse;
import com.nullpointer.domain.member.dto.board.BoardRoleUpdateRequest;
import com.nullpointer.domain.member.service.BoardMemberService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import com.nullpointer.global.security.jwt.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards/{boardId}/members")
@RequiredArgsConstructor
public class BoardMemberController {

    private final BoardMemberService boardMemberService;

    // 보드 멤버 초대
    @PostMapping("")
    public ApiResponse<String> inviteBoardMember(@PathVariable Long boardId,
                                                @Valid @RequestBody BoardInviteRequest req,
                                                 @LoginUser Long userId) {

        boardMemberService.inviteBoardMember(boardId, req, userId);
        return ApiResponse.success("보드 멤버 초대 성공");
    }

    // 보드 멤버 조회
    @GetMapping("")
    public ApiResponse<List<BoardMemberResponse>> getBoardMembers(@PathVariable Long boardId) {
        return ApiResponse.success(boardMemberService.getBoardMembers(boardId));
    }

    // 보드 역할 변경
    @PatchMapping("/{memberId}")
    public ApiResponse<String> changeBoardMember(@PathVariable Long boardId,
                                                 @PathVariable Long memberId,
                                                 @Valid @RequestBody BoardRoleUpdateRequest req,
                                                 @LoginUser Long userId) {
        boardMemberService.changeBoardRole(boardId, memberId, req, userId);
        return ApiResponse.success("역할 변경 완료");
    }

    // 보드 탈퇴
    @DeleteMapping("/{memberId}")
    public ApiResponse<String> deleteBoardMember(@PathVariable Long boardId,
                                                 @PathVariable Long memberId,
                                                 @LoginUser Long userId) {
        boardMemberService.deleteBoardMember(boardId, memberId, userId);
        return ApiResponse.success("보드 탈퇴 완료");
    }
}
