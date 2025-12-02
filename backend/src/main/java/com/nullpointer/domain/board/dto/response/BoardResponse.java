package com.nullpointer.domain.board.dto.response;

import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.domain.board.vo.enums.Visibility;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BoardResponse {
    private Long teamId;
    private String teamName;
    private Long id;
    private String title;
    private String description;
    private Visibility visibility;
    private boolean isFavorite;

    public static BoardResponse from(BoardVo vo) {
        return BoardResponse.builder()
                .teamId(vo.getTeamId())
                .teamName(vo.getTeamName())
                .id(vo.getId())
                .title(vo.getTitle())
                .description(vo.getDescription())
                .visibility(vo.getVisibility())
                .isFavorite(vo.isFavorite())
                .build();
    }
}
