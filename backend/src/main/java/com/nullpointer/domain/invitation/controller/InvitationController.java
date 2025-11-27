package com.nullpointer.domain.invitation.controller;

import com.nullpointer.domain.invitation.dto.MyInvitationResponse;
import com.nullpointer.domain.invitation.dto.TeamInvitationResponse;
import com.nullpointer.domain.invitation.dto.TeamInviteRequest;
import com.nullpointer.domain.invitation.service.InvitationService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    // 초대 메일 발송
    @PostMapping("/teams/{teamId}")
    public ApiResponse<String> sendInvitation(@PathVariable Long teamId,
                                              @RequestBody @Valid TeamInviteRequest req,
                                              @LoginUser Long userId) {
        invitationService.sendInvitation(teamId, req, userId);
        return ApiResponse.success("초대장이 발송되었습니다.");
    }

    // 팀원 초대 리스트 조회
    @GetMapping("/teams/{teamId}")
    public ApiResponse<List<TeamInvitationResponse>> getSentInvitations(@PathVariable Long teamId,
                                                                        @LoginUser Long userId) {
        List<TeamInvitationResponse> list = invitationService.getSentInvitations(teamId, userId);
        return ApiResponse.success(list);
    }

    // 내 초대 리스트 조회
    @GetMapping("/me")
    public ApiResponse<List<MyInvitationResponse>> getMyInvitations(@LoginUser Long userId) {
        List<MyInvitationResponse> list = invitationService.getMyInvitations(userId);
        return ApiResponse.success(list);
    }

    // 초대 수락
    @PostMapping("/accept")
    public ApiResponse<String> acceptInvitation(@RequestParam("token") String token,
                                                @LoginUser Long userId) {
        invitationService.acceptInvitation(token, userId);
        return ApiResponse.success("팀 초대를 수락했습니다.");
    }

    // 초대 거절
    @PostMapping("/reject")
    public ApiResponse<String> rejectInvitation(@RequestParam("token") String token,
                                                @LoginUser Long userId) {
        invitationService.rejectInvitation(token, userId);
        return ApiResponse.success("팀 초대를 거절했습니다.");
    }
}