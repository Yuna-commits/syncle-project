package com.nullpointer.domain.card.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.nullpointer.domain.card.vo.CardVo;
import lombok.*;

import java.time.LocalDateTime;

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

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDateTime dueDate;
    private Integer commentCount;

    // 담당자 정보
    private Long assigneeId;
    private String assigneeName;
    private String assigneeProfileImg;

    public static CardResponse of(CardVo c, String assigneeName, String assigneeProfileImg, Integer commentCount) {
        return CardResponse.builder()
                .id(c.getId())
                .listId(c.getListId())
                .title(c.getTitle())
                .description(c.getDescription())
                .orderIndex(c.getOrderIndex())
                .dueDate(c.getDueDate())
                .assigneeId(c.getAssigneeId())
                .assigneeName(assigneeName)
                .assigneeProfileImg(assigneeProfileImg)
                .commentCount(commentCount != null ? commentCount : 0)
                .build();
    }
}
