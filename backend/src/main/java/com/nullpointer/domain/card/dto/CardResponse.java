package com.nullpointer.domain.card.dto;

import com.nullpointer.domain.card.vo.CardVo;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class CardResponse {

    private Long id;
    private Long listId;
    private String title;
    private String description;
    private Integer orderIndex;

    public static CardResponse from(CardVo c) {
        return CardResponse.builder()
                .id(c.getId())
                .listId(c.getListId())
                .title(c.getTitle())
                .description(c.getDescription())
                .orderIndex(c.getOrderIndex())
                .build();
    }
}
