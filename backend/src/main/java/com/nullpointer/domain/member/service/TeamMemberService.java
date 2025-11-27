package com.nullpointer.domain.member.service;

import com.nullpointer.domain.member.dto.team.TeamMemberResponse;
import com.nullpointer.domain.member.dto.team.TeamRoleUpdateRequest;
import com.nullpointer.domain.member.vo.enums.Role;

import java.util.List;

public interface TeamMemberService {

    // 멤버 추가 (InvitationService에서 호출)
    void addMember(Long teamId, Long userId, Role role);

    // 팀 멤버 조회
    List<TeamMemberResponse> getTeamMembers(Long teamId);

    // 팀 역할 변경
    void changeTeamRole(Long teamId, Long memberId, TeamRoleUpdateRequest req, Long userId);

    // 팀 탈퇴
    void deleteTeamMember(Long teamId, Long memberId, Long userId);
}