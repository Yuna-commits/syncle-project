package com.nullpointer.domain.team.mapper;

import com.nullpointer.domain.team.vo.TeamVo;

import java.util.List;

public interface TeamMapper {

    // 팀 추가하기
    void insertTeam(TeamVo teamVo);

    // 팀 조회
    List<TeamVo> findTeamById(Long user_id);
}
