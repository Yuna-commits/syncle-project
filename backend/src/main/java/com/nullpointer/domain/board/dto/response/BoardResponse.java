package com.nullpointer.domain.board.dto.response;

import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.domain.board.vo.enums.Visibility;
import com.nullpointer.domain.member.vo.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardResponse {
    private Long teamId;
    private String teamName;
    private String boardCreateRole;
    private Role teamRole;
    private Long id;
    private String title;
    private String description;
    private Visibility visibility;
    private Boolean isFavorite;
    private LocalDateTime favoritedAt;
    private Boolean isGuest;

    // 소유자 정보 추가
    private String ownerName;
    private String ownerEmail;
    private String ownerProfileImg;

    public static BoardResponse from(BoardVo vo) {
        return BoardResponse.builder()
                .teamId(vo.getTeamId())
                .teamName(vo.getTeamName())
                .boardCreateRole(vo.getBoardCreateRole())
                .teamRole(vo.getTeamRole())
                .id(vo.getId())
                .title(vo.getTitle())
                .description(vo.getDescription())
                .visibility(vo.getVisibility())
                .isFavorite(vo.getIsFavorite())
                .favoritedAt(vo.getFavoritedAt())
                .isGuest(vo.getIsGuest())
                .build();
    }
}
