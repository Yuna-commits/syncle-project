package com.nullpointer.domain.team.vo;

import lombok.*;

import java.time.LocalDateTime;

@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TeamNoticeVo {

    private Long id;
    private Long teamId;
    private Long writerId;
    private String title;
    private String content;

    @Builder.Default
    private Boolean isImportant = false; // 상단 고정용
    @Builder.Default
    private int viewCount = 0;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

}
