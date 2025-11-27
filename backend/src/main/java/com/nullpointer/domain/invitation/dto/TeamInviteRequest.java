package com.nullpointer.domain.invitation.dto;

import com.nullpointer.domain.member.vo.TeamMemberVo;
import com.nullpointer.domain.member.vo.enums.Role;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Builder

public class TeamInviteRequest {
    private Long teamId;
    private List<Long> userIds;
    private Role role;

    public TeamMemberVo toVo(Long teamId, Long userId) {
        return TeamMemberVo.builder()
                .teamId(teamId)
                .userId(userId)
                .role(this.role)
                .build();
    }
}
