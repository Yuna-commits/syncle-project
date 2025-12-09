package com.nullpointer.domain.card.dto;

import com.nullpointer.domain.card.vo.CardVo;
import com.nullpointer.domain.card.vo.enums.Priority;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UpdateCardRequest {
    private String title;
    private String description;
    private Long assigneeId;
    private Priority priority;
    private Boolean isComplete;
    private LocalDateTime startDate;
    private LocalDateTime dueDate;

    public CardVo toVo(Long cardId) {
        return CardVo.builder()
                .id(cardId)
                .title(this.title)
                .description(this.description)
                .assigneeId(this.assigneeId)
                .priority(this.priority)
                .isComplete(this.isComplete)
                .startDate(this.startDate)
                .dueDate(this.dueDate)
                .build();
    }
}
