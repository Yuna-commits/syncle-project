package com.nullpointer.domain.board.dto.response;

import com.nullpointer.domain.board.vo.BoardVo;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MemberBoardResponse {
    private Long id;
    private String title;

    public static MemberBoardResponse from(BoardVo vo) {
        return MemberBoardResponse.builder()
                .id(vo.getId())
                .title(vo.getTitle())
                .build();
    }
}
