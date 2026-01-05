package com.nullpointer.domain.team.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TeamNoticeResponse {

    private Long id;
    private String title;
    private String content;
    private Boolean isImportant;
    private int viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 작성자 정보
    private Long writerId;
    private String writerNickname;
    private String writerProfileImg;

}
