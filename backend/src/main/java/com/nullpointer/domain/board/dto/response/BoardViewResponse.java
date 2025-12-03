package com.nullpointer.domain.board.dto.response;

import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.domain.board.vo.enums.Visibility;
import com.nullpointer.domain.list.dto.ListWithCardsResponse;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class BoardViewResponse {
    private Long id;
    private String title;
    private String description;
    private Visibility visibility;

    // 리스트 목록 (카드 포함)
    private List<ListWithCardsResponse> lists;

    public static BoardViewResponse of(BoardVo board, List<ListWithCardsResponse> lists) {
        return BoardViewResponse.builder()
                .id(board.getId())
                .title(board.getTitle())
                .description(board.getDescription())
                .visibility(board.getVisibility())
                .lists(lists)
                .build();
    }
}