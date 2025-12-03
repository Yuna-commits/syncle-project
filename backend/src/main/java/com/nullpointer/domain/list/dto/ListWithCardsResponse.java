package com.nullpointer.domain.list.dto;

import com.nullpointer.domain.card.dto.CardResponse;
import com.nullpointer.domain.list.vo.ListVo;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ListWithCardsResponse {
    private Long id;
    private String title;
    private Integer orderIndex;

    // 해당 리스트에 속한 카드 목록
    private List<CardResponse> cards;

    public static ListWithCardsResponse of(ListVo list, List<CardResponse> cards) {
        return ListWithCardsResponse.builder()
                .id(list.getId())
                .title(list.getTitle())
                .orderIndex(list.getOrderIndex())
                .cards(cards)
                .build();
    }
}