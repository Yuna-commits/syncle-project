package com.nullpointer.domain.member.dto.team;

import com.nullpointer.domain.member.vo.TeamMemberVo;
import com.nullpointer.domain.member.vo.enums.InvitationStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder

public class TeamInviteUpdateRequest {

    private InvitationStatus invitationStatus;

    public TeamMemberVo toVo(Long teamId, Long userId) {
        return TeamMemberVo.builder()
                .teamId(teamId)
                .userId(userId)
                .invitationStatus(this.invitationStatus)
                .build();
    }
}
