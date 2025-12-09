package com.nullpointer.domain.card.vo;

import com.nullpointer.domain.card.vo.enums.Priority;
import lombok.*;

import java.time.LocalDateTime;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class CardVo {

    private Long id;
    private Long listId;
    private Long assigneeId;
    private String title;
    private String description;
    private Priority priority;
    private LocalDateTime startDate;
    private LocalDateTime dueDate;
    private Integer orderIndex;
    private Boolean isComplete;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

}
