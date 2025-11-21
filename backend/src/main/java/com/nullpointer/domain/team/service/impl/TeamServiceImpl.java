package com.nullpointer.domain.team.service.impl;

import com.nullpointer.domain.team.dto.CreateTeamRequest;
import com.nullpointer.domain.team.dto.TeamResponse;
import com.nullpointer.domain.team.mapper.TeamMapper;
import com.nullpointer.domain.team.service.TeamService;
import com.nullpointer.domain.team.vo.TeamVo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamMapper teamMapper;

    @Override
    public void createTeam(CreateTeamRequest req) {

        // 1. DTO -> VO
        TeamVo team = TeamVo.builder()
                .name(req.getName())
                .description(req.getDescription())
                .build();

        teamMapper.insertTeam(team);
    }

    @Override
    public List<TeamResponse> getTeams(Long userId) {
        List<TeamVo> teams = teamMapper.findTeamById(userId);
        return teams.stream().map(TeamResponse::from).toList();
    }
}
