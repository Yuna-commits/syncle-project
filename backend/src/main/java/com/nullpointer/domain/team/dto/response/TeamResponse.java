package com.nullpointer.domain.team.dto.response;

import com.nullpointer.domain.member.vo.enums.Role;
import com.nullpointer.domain.team.vo.TeamVo;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TeamResponse {
    private long  id;
    private String name;
    private Role role;

    public static TeamResponse from(TeamVo vo) {
        return TeamResponse.builder()
                .id(vo.getId())
                .name(vo.getName())
                .role(vo.getRole())
                .build();
    }
}
