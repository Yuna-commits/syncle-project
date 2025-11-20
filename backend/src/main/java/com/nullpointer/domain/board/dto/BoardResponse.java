package com.nullpointer.domain.board.dto;

import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.domain.board.vo.enums.Visibility;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BoardResponse {
    private Long id;
    private String title;
    private String description;
    private Visibility visibility;
    private String teamName;

    public static BoardResponse from(BoardVo vo) {
        return BoardResponse.builder()
                .id(vo.getId())
                .title(vo.getTitle())
                .description(vo.getDescription())
                .visibility(vo.getVisibility())
                .teamName(vo.getTeamName())
                .build();
    }
}
