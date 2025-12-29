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
    private String description;
    private String targetName;
    private String boardTitle;
    private String teamName;
    private String actorName;
    private LocalDateTime createdAt;

}
