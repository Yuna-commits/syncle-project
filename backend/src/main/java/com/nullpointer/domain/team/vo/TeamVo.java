package com.nullpointer.domain.team.vo;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor // 기본 생성자
@AllArgsConstructor
@ToString
@Builder
public class TeamVo {
    private Long id;
    private String name;
    private String description;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
