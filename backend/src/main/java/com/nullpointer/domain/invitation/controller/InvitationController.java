package com.nullpointer.domain.invitation.controller;

import com.nullpointer.domain.invitation.dto.MyInvitationResponse;
import com.nullpointer.domain.invitation.dto.TeamInvitationResponse;
import com.nullpointer.domain.invitation.dto.TeamInviteRequest;
import com.nullpointer.domain.invitation.service.InvitationService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Invitation", description = "팀 초대 및 응답 관리 API")
@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    // 초대 메일 발송
    @Operation(summary = "팀 초대 발송", description = "사용자들에게 팀 초대 이메일을 발송합니다.")
    @PostMapping("/teams/{teamId}")
    public ApiResponse<String> sendInvitation(@PathVariable Long teamId,
                                              @RequestBody @Valid TeamInviteRequest req,
                                              @LoginUser Long userId) {
        invitationService.sendInvitation(teamId, req, userId);
        return ApiResponse.success("초대장이 발송되었습니다.");
    }

    // 팀원 초대 리스트 조회
    @Operation(summary = "보낸 초대 내역 조회", description = "해당 팀에서 발송한 초대 내역을 조회합니다.")
    @GetMapping("/teams/{teamId}")
    public ApiResponse<List<TeamInvitationResponse>> getSentInvitations(@PathVariable Long teamId,
                                                                        @LoginUser Long userId) {
        List<TeamInvitationResponse> list = invitationService.getSentInvitations(teamId, userId);
        return ApiResponse.success(list);
    }

    // 내 초대 리스트 조회
    @Operation(summary = "받은 초대 목록 조회", description = "내가 받은 팀 초대 목록을 조회합니다.")
    @GetMapping("/me")
    public ApiResponse<List<MyInvitationResponse>> getMyInvitations(@LoginUser Long userId) {
        List<MyInvitationResponse> list = invitationService.getMyInvitations(userId);
        return ApiResponse.success(list);
    }

    // 초대 수락
    @Operation(summary = "초대 수락", description = "팀 초대를 수락하고 멤버로 참여합니다.")
    @PostMapping("/accept")
    public ApiResponse<String> acceptInvitation(@RequestParam("token") String token,
                                                @LoginUser Long userId) {
        invitationService.acceptInvitation(token, userId);
        return ApiResponse.success("팀 초대를 수락했습니다.");
    }

    // 초대 거절
    @Operation(summary = "초대 거절", description = "팀 초대를 거절합니다.")
    @PostMapping("/reject")
    public ApiResponse<String> rejectInvitation(@RequestParam("token") String token,
                                                @LoginUser Long userId) {
        invitationService.rejectInvitation(token, userId);
        return ApiResponse.success("팀 초대를 거절했습니다.");
    }

    // 초대 취소
    @Operation(summary = "초대 취소", description = "발송한 초대를 취소합니다 (팀장 권한).")
    @DeleteMapping("/{invitationId}")
    public ApiResponse<String> removeInvitation(@PathVariable Long invitationId,
                                                @LoginUser Long userId) {
        invitationService.removeInvitation(invitationId, userId);
        return ApiResponse.success("팀 초대를 취소했습니다.");
    }

    // 공유 링크 Viewer 초대
    @Operation(summary = "공유 링크를 통한 보드 참여", description = "공유 토큰을 통해 회원이 VIEWER 권한으로 보드에 참여합니다.")
    @PostMapping("/boards/join")
    public ApiResponse<Long> joinBoardViaLink(@RequestParam("token") String token, @LoginUser Long userId) {
        Long boardId = invitationService.joinBoardByToken(token, userId);
        return ApiResponse.success(boardId);
    }
}