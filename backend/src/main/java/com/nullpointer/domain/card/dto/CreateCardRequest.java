package com.nullpointer.domain.card.dto;


import com.nullpointer.domain.card.vo.CardVo;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CreateCardRequest {

    private String title;
    private String description;
    private Long assigneeId;

}
