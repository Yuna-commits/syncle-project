package com.nullpointer.domain.team.dto;

import com.nullpointer.domain.team.vo.TeamVo;

public class TeamDetailResponse {
    private long  id;
    private String name;
    private String description;

    public static TeamResponse from(TeamVo vo) {
        return TeamResponse.builder()
                .id(vo.getId())
                .name(vo.getName())
                .description(vo.getDescription())
                .build();
    }
}
