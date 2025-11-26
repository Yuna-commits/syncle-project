package com.nullpointer.domain.team.controller;

import com.nullpointer.domain.team.dto.request.CreateTeamRequest;
import com.nullpointer.domain.team.dto.response.TeamDetailResponse;
import com.nullpointer.domain.team.dto.response.TeamResponse;
import com.nullpointer.domain.team.dto.request.UpdateTeamRequest;
import com.nullpointer.domain.team.service.TeamService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import com.nullpointer.global.security.jwt.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor

public class TeamController {

    private final TeamService teamService;

    // 팀 생성
    @PostMapping("")
    public ApiResponse<String> createTeam(@Valid @RequestBody CreateTeamRequest req,
                                          @LoginUser Long userId) {
        teamService.createTeam(req, userId);
        return ApiResponse.success("팀 추가 성공");
    }

    // 소속팀 조회
    @GetMapping("")
    public ApiResponse<List<TeamResponse>> getTeams(@LoginUser Long userId) {
        return ApiResponse.success(teamService.getTeams(userId));
    }

    // 팀 상세 조회
    @GetMapping("/{teamId}")
    public ApiResponse<TeamDetailResponse> getTeamDetail(@PathVariable Long teamId,
                                                         @LoginUser Long userId) {
        return ApiResponse.success(teamService.getTeamDetail(teamId, userId));
    }

    // 팀 정보 수정
    @PutMapping("/{teamId}")
    public ApiResponse<String> updateTeam(@PathVariable Long teamId,
                                          @Valid @RequestBody UpdateTeamRequest req,
                                          @LoginUser Long userId) {
        teamService.updateTeam(teamId, req, userId);
        return ApiResponse.success("팀 정보 수정 완료");
    }

    // 팀 삭제
    @DeleteMapping("/{teamId}")
    public ApiResponse<String> deleteTeam(@PathVariable Long teamId,
                                          @LoginUser Long userId) {
        teamService.deleteTeam(teamId, userId);
        return ApiResponse.success("팀 삭제 성공");
    }
}
