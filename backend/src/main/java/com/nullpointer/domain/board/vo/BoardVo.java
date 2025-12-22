package com.nullpointer.domain.board.vo;

import com.nullpointer.domain.board.vo.enums.Visibility;
import com.nullpointer.domain.member.vo.enums.Role;
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
    private String boardCreateRole;
    private Role teamRole;
    private String description;

    @Builder.Default
    private Visibility visibility = Visibility.PUBLIC;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    private Boolean isFavorite;
    private LocalDateTime favoritedAt;

    private Boolean isGuest;
}

