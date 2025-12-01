package com.nullpointer.domain.activity.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ActivityStatsResponse {

    private long createdCards7;    // 최근 7일 생성 카드 수
    private long completedTasks7;  // 최근 7일 완료 카드 수
    private long comments7;        // 최근 7일 댓글 수

}
