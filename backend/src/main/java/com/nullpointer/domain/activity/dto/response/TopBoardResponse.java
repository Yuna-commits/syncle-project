package com.nullpointer.domain.activity.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class TopBoardResponse {

    private Long id;
    private String title;
    private String description;
    private Long activityCount; // 활동 수
    private LocalDateTime createdAt;

}
