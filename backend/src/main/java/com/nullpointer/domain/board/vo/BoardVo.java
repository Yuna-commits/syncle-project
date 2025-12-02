package com.nullpointer.domain.board.vo;

import com.nullpointer.domain.board.vo.enums.Visibility;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor // 기본 생성자
@AllArgsConstructor
@ToString
@Builder
public class BoardVo {
    private Long id;
    private Long teamId;
    private String title;
    private String teamName;
    private String description;

    @Builder.Default
    private Visibility visibility = Visibility.TEAM;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    private Boolean isFavorite;
}

