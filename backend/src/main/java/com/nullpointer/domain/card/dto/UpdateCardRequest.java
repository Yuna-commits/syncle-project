package com.nullpointer.domain.card.dto;

import com.nullpointer.domain.card.vo.CardVo;
import com.nullpointer.domain.card.vo.enums.Priority;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Optional;

@Getter
@Builder
public class UpdateCardRequest {
    private String title;
    private String description;
    private Long assigneeId;
    private Priority priority;
    private Boolean removePriority;
    private Boolean isComplete;
    private String label;
    private String labelColor;
    private Boolean removeLabel;
    private LocalDateTime startDate;
    private LocalDateTime dueDate;
    private Boolean removeDate;

}
