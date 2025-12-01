package com.nullpointer.domain.activity.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class ActivityLogResponse {

    /**
     * 타임라인 로그용
     */
    private Long id;
    private String type;
    private String title;
    private String description;
    private String target;
    private String boardTitle;
    private LocalDateTime createdAt;

}
