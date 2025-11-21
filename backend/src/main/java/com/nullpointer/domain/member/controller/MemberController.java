package com.nullpointer.domain.member.controller;

import com.nullpointer.domain.member.dto.InvitationMemberRequest;
import com.nullpointer.domain.member.service.MemberService;
import com.nullpointer.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor

public class MemberController {

    private final MemberService memberService;

    // 팀 멤버 초대
    @PostMapping("/{teamId}/members")
    public ApiResponse<String> inviteMember(@PathVariable Long teamId, @RequestBody InvitationMemberRequest req) {

        req.setTeamId(teamId);
        
        memberService.inviteMember(req);
        return ApiResponse.success("팀 멤버 초대 성공");
    }

    // 팀 멤버 조회
    @GetMapping("/{teamId}/members")
    public ApiResponse<?> getTeamMembers(@PathVariable Long teamId) {
        return ApiResponse.success(memberService.getTeamMembers(teamId));
    }

}
