package com.nullpointer.domain.member.service;

import com.nullpointer.domain.member.dto.team.TeamInviteRequest;
import com.nullpointer.domain.member.dto.team.TeamInviteUpdateRequest;
import com.nullpointer.domain.member.dto.team.TeamMemberResponse;
import com.nullpointer.domain.member.dto.team.TeamRoleUpdateRequest;
import com.nullpointer.domain.member.vo.TeamMemberVo;
import jakarta.validation.Valid;

import java.util.List;

public interface TeamMemberService {

    // 팀 멤버 초대
    void inviteTeamMember(TeamInviteRequest req);
    
    // 팀 멤버 조회
    List<TeamMemberResponse> getTeamMembers(Long teamId);

    // 팀 역할 변경
    void changeTeamRole(Long teamId, Long memberId, TeamRoleUpdateRequest req);

    // 초대 상태 변경
    void changeTeamInvite(Long teamId, Long memberId, TeamInviteUpdateRequest req);

    // 팀 탈퇴
    void deleteTeamMember(Long teamId, Long memberId, Long userId);
}
