package com.nullpointer.domain.list.vo;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor // 기본 생성자
@AllArgsConstructor
@ToString
@Builder
public class ListVo {

    private Long id;
    private Long boardId;
    private String title;
    // 정렬용 컬럼 (DB: order_index)
    private Integer orderIndex;
    private Boolean isArchived;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
