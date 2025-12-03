package com.nullpointer.domain.card.vo;

import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class CardVo {

    private Long id;
    private Long listId;
    private String title;
    private String description;
    private Integer orderIndex;

}
