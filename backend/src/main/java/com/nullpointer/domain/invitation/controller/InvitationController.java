package com.nullpointer.domain.invitation.controller;

import com.nullpointer.domain.invitation.dto.TeamInviteRequest;
import com.nullpointer.domain.invitation.service.InvitationService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    // 초대 메일 발송
    @PostMapping("/send")
    public ApiResponse<String> sendInvitation(@RequestBody @Valid TeamInviteRequest req,
                                              @LoginUser Long userId) {
        // req에 teamId가 포함되어 있다고 가정, 혹은 PathVariable로 받아도 됨
        invitationService.sendInvitation(req.getTeamId(), req, userId);
        return ApiResponse.success("초대장이 발송되었습니다.");
    }

    // 초대 리스트 조회
    @GetMapping("/list")

    // 초대 수락
    @PostMapping("/accept")
    public ApiResponse<String> acceptInvitation(@RequestParam("token") String token,
                                                @LoginUser Long userId) { // 또는 @LoginUser
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