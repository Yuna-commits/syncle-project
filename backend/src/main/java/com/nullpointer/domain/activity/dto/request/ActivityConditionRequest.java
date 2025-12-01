package com.nullpointer.domain.activity.dto.request;

import com.nullpointer.domain.activity.vo.enums.ActivityType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ActivityConditionRequest {

    /**
     * 검색, 필터링 조건 DTO
     */

    private Long userId; // 특정 유저 필터링
    private Long teamId; // 특정 팀 필터링
    private Long boardId; // 특정 보드 필터링 (옵션)

    private String keyword; // 검색어
    private ActivityType type; // 활동 유형
    private String startDate; // 날짜 범위
    private String endDate;

}
