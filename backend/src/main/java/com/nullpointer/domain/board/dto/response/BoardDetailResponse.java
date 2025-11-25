package com.nullpointer.domain.board.dto.response;

import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.domain.board.vo.enums.Visibility;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder

public class BoardDetailResponse {
    private Long id;
    private String title;
    private String description;
    private Visibility visibility;

    public static BoardDetailResponse from(BoardVo vo) {
        return BoardDetailResponse.builder()
                .id(vo.getId())
                .title(vo.getTitle())
                .description(vo.getDescription())
                .visibility(vo.getVisibility())
                .build();
    }
}