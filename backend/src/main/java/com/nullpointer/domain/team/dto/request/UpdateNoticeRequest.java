package com.nullpointer.domain.team.dto.request;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdateNoticeRequest {

    private String title;
    private String content;
    private Boolean isImportant; // 중요 공지 여부

}
