package com.nullpointer.domain.member.mapper;

import java.util.List;

import com.nullpointer.domain.member.dto.team.TeamMemberResponse;
import com.nullpointer.domain.member.vo.TeamMemberVo;
import org.apache.ibatis.annotations.Param;


public interface TeamMemberMapper {

    // 팀 멤버 초대
    void insertTeamMember(TeamMemberVo teamMemberVo);

    // 팀 멤버 조회
    List<TeamMemberResponse> findMembersByTeamId(Long teamId);

    // 팀 역할 변경
    void updateTeamRole(TeamMemberVo vo);

    // 초대 상태 변경
    void updateTeamInvite(TeamMemberVo vo);

    // 팀 탈퇴
    void deleteTeamMember(@Param("teamId") Long teamId, @Param("userId") Long memberId);
}
