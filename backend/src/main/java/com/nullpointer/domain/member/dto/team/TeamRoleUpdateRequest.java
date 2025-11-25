package com.nullpointer.domain.member.dto.team;

import com.nullpointer.domain.member.vo.TeamMemberVo;
import com.nullpointer.domain.member.vo.enums.Role;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TeamRoleUpdateRequest {

    private Role role;

    public TeamMemberVo toVo(Long teamId, Long memberId) {
        return TeamMemberVo.builder()
                .teamId(teamId)
                .userId(memberId)
                .role(this.role)
                .build();
    }
}
