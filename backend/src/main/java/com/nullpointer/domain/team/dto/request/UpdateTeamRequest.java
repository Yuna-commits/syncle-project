package com.nullpointer.domain.team.dto.request;

import com.nullpointer.domain.member.vo.enums.Role;
import com.nullpointer.domain.team.vo.TeamVo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdateTeamRequest {

    @NotBlank(message = "팀 이름은 필수입니다.")
    @Size(max = 30, message = "팀 이름은 최대 30자까지 가능합니다.")
    private String name;

    @Size(max = 1000, message = "설명은 최대 1000자까지 가능합니다.")
    private String description;

    private Role boardCreateRole;

    public TeamVo teamVo(Long teamId) {
        return TeamVo.builder()
                .id(teamId)
                .name(this.name)
                .description(this.description)
                .boardCreateRole(this.boardCreateRole)
                .build();
    }
}
