package com.nullpointer.domain.member.controller;

import com.nullpointer.domain.member.dto.team.TeamMemberResponse;
import com.nullpointer.domain.member.dto.team.TeamRoleUpdateRequest;
import com.nullpointer.domain.member.service.TeamMemberService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Team Member", description = "팀 멤버 관리 API")
@RestController
@RequestMapping("/api/teams/{teamId}/members")
@RequiredArgsConstructor
public class TeamMemberController {

    private final TeamMemberService teamMemberService;

    // 팀 멤버 조회
    @Operation(summary = "팀 멤버 조회", description = "팀에 소속된 멤버 목록을 조회합니다.")
    @GetMapping("")
    public ApiResponse<List<TeamMemberResponse>> getTeamMembers(@PathVariable Long teamId) {
        return ApiResponse.success(teamMemberService.getTeamMembers(teamId));
    }

    // 팀 역할 변경
    @Operation(summary = "팀 멤버 역할 변경", description = "팀 멤버의 역할(권한)을 변경합니다.")
    @PatchMapping("{memberId}")
    public ApiResponse<String> updateTeamRole(@PathVariable Long teamId,
                                              @PathVariable Long memberId,
                                              @Valid @RequestBody TeamRoleUpdateRequest req,
                                              @LoginUser Long userId) {
        teamMemberService.changeTeamRole(teamId, memberId, req, userId);
        return ApiResponse.success("역할 변경 완료");
    }

    // 팀 탈퇴
    @Operation(summary = "팀 멤버 추방/탈퇴", description = "팀 멤버를 내보내거나 스스로 탈퇴합니다.")
    @DeleteMapping("{memberId}")
    public ApiResponse<String> deleteTeamMember(@PathVariable Long teamId,
                                                @PathVariable Long memberId,
                                                @LoginUser Long userId) {
        teamMemberService.deleteTeamMember(teamId, memberId, userId);
        return ApiResponse.success("팀 탈퇴 완료");
    }
}
