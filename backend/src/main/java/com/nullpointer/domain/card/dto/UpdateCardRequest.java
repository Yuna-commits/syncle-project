package com.nullpointer.domain.card.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
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
    private Boolean isArchived;

    private String label;
    private String labelColor;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dueDate;

    // 삭제 플래그
    private Boolean removePriority;
    private Boolean removeDate;
    private Boolean removeLabel;

}
