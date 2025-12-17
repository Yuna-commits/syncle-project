package com.nullpointer.domain.card.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.nullpointer.domain.card.vo.CardVo;
import com.nullpointer.domain.card.vo.enums.Priority;
import com.nullpointer.domain.checklist.vo.ChecklistVo;
import com.nullpointer.domain.comment.dto.CommentResponse;
import com.nullpointer.domain.file.dto.FileResponse;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

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
    private Priority priority;
    private Integer orderIndex;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime startDate;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime dueDate;
    private Integer commentCount;

    private Boolean isComplete;
    private String label;
    private String labelColor;
    // 담당자 정보
    private Long assigneeId;
    private String assigneeName;
    private String assigneeProfileImg;

    // 체크리스트 필드
    private List<ChecklistVo> checklists;

    // 댓글 필드
    private List<CommentResponse> comments;

    // 보드 ID
    private Long boardId;

    // 첨부파일 필드
    private List<FileResponse> files;

    public static CardResponse of(CardVo c,
                                  String assigneeName,
                                  String assigneeProfileImg,
                                  Integer commentCount,
                                  List<ChecklistVo> checklists) {
        return CardResponse.builder()
                .id(c.getId())
                .listId(c.getListId())
                .title(c.getTitle())
                .description(c.getDescription())
                .orderIndex(c.getOrderIndex())
                .startDate(c.getStartDate())
                .dueDate(c.getDueDate())
                .label(c.getLabel())
                .labelColor(c.getLabelColor())
                .assigneeId(c.getAssigneeId())
                .assigneeName(assigneeName)
                .assigneeProfileImg(assigneeProfileImg)
                .commentCount(commentCount != null ? commentCount : 0)
                .isComplete(c.getIsComplete() != null ? c.getIsComplete() : false)
                .checklists(checklists)
                .build();
    }
}
