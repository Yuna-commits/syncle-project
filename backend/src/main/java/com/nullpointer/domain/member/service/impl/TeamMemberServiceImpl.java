package com.nullpointer.domain.member.service.impl;

import com.nullpointer.domain.member.dto.team.TeamInviteRequest;
import com.nullpointer.domain.member.dto.team.TeamInviteUpdateRequest;
import com.nullpointer.domain.member.dto.team.TeamMemberResponse;
import com.nullpointer.domain.member.dto.team.TeamRoleUpdateRequest;
import com.nullpointer.domain.member.mapper.TeamMemberMapper;
import com.nullpointer.domain.member.service.TeamMemberService;
import com.nullpointer.domain.member.vo.TeamMemberVo;
import lombok.Builder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Builder

public class TeamMemberServiceImpl implements TeamMemberService {

    private final TeamMemberMapper teamMemberMapper;

    @Override
    public void inviteTeamMember(TeamInviteRequest req) {
        for (Long userId : req.getUserIds()) {
            TeamMemberVo vo = TeamMemberVo.builder()
                    .teamId(req.getTeamId())
                    .userId(userId)
                    .role(req.getRole())
                    .build();

            teamMemberMapper.insertTeamMember(vo);
        }
    }

    @Override
    public List<TeamMemberResponse> getTeamMembers(Long teamId) {
        return teamMemberMapper.findMembersByTeamId(teamId);
    }

    @Override
    public void changeTeamRole(Long teamId, Long memberId, TeamRoleUpdateRequest req) {
        TeamMemberVo vo = req.toVo(teamId, memberId);

        teamMemberMapper.updateTeamRole(vo);
    }

    @Override
    public void changeTeamInvite(Long teamId, Long memberId, TeamInviteUpdateRequest req) {
        TeamMemberVo vo = req.toVo(teamId, memberId);

        teamMemberMapper.updateTeamInvite(vo);
    }

    @Override
    public void deleteTeamMember(Long teamId, Long memberId, Long userId) {
        teamMemberMapper.deleteTeamMember(teamId, userId);
    }
}
