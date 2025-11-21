package com.nullpointer.domain.team.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreateTeamRequest {
    @NotBlank(message = "팀 이름은 필수 입력 값입니다.")
    private String name;

    @Size(max = 100, message = "설명은 최대 100자까지 가능합니다.")
    private String description;
}
