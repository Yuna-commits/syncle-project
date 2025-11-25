package com.nullpointer.domain.team.mapper;

import com.nullpointer.domain.team.vo.TeamVo;

import java.util.List;

public interface TeamMapper {

    // 팀 추가하기
    void insertTeam(TeamVo teamVo);

    // 본인 소속팀 전체 조회
    List<TeamVo> findTeamByUserId(Long user_id);

    // 팀 상세 조회
    TeamVo findTeamByTeamId(Long team_id);

    // 팀 정보 수정
    void updateTeam(TeamVo teamVo);

    // 팀 삭제
    void deleteTeam(Long teamId);
}
