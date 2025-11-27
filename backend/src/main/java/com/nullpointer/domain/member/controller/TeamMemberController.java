package com.nullpointer.domain.member.controller;

import com.nullpointer.domain.member.dto.team.TeamMemberResponse;
import com.nullpointer.domain.member.dto.team.TeamRoleUpdateRequest;
import com.nullpointer.domain.member.service.TeamMemberService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams/{teamId}/members")
@RequiredArgsConstructor

public class TeamMemberController {

    private final TeamMemberService teamMemberService;

    // 팀 멤버 조회
    @GetMapping("")
    public ApiResponse<List<TeamMemberResponse>> getTeamMembers(@PathVariable Long teamId) {
        return ApiResponse.success(teamMemberService.getTeamMembers(teamId));
    }

    // 팀 역할 변경
    @PatchMapping("{memberId}/role")
    public ApiResponse<String> updateTeamRole(@PathVariable Long teamId,
                                              @PathVariable Long memberId,
                                              @Valid @RequestBody TeamRoleUpdateRequest req,
                                              @LoginUser Long userId) {
        teamMemberService.changeTeamRole(teamId, memberId, req, userId);
        return ApiResponse.success("역할 변경 완료");
    }

    // 팀 탈퇴
    @DeleteMapping("{memberId}")
    public ApiResponse<String> deleteTeamMember(@PathVariable Long teamId,
                                                @PathVariable Long memberId,
                                                @LoginUser Long userId) {
        teamMemberService.deleteTeamMember(teamId, memberId, userId);
        return ApiResponse.success("팀 탈퇴 완료");
    }
}
