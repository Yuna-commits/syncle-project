package com.nullpointer.domain.team.controller;

import com.nullpointer.domain.team.dto.CreateTeamRequest;
import com.nullpointer.domain.team.dto.TeamResponse;
import com.nullpointer.domain.team.service.TeamService;
import com.nullpointer.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor

public class TeamController {

    private final TeamService teamService;

    // 팀 생성
    @PostMapping("/teams")
    public ApiResponse<String> createTeam(@RequestBody CreateTeamRequest req) {
        teamService.createTeam(req);
        return ApiResponse.success("팀 추가 성공");
    }

    // 팀 조회
    @GetMapping("/teams/{userId}")
    public ApiResponse<List<TeamResponse>> getTeams(@PathVariable Long userId) {
        return ApiResponse.success(teamService.getTeams(userId));
    }
}
