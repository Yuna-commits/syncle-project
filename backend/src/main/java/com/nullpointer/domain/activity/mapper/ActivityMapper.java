package com.nullpointer.domain.activity.mapper;

import com.nullpointer.domain.activity.dto.request.ActivityConditionRequest;
import com.nullpointer.domain.activity.dto.response.ActivityLogResponse;
import com.nullpointer.domain.activity.dto.response.ActivityStatsResponse;
import com.nullpointer.domain.activity.dto.response.TopBoardResponse;
import com.nullpointer.domain.activity.vo.ActivityLogVo;

import java.util.List;

public interface ActivityMapper {

    // 통계 조회
    ActivityStatsResponse getStats(ActivityConditionRequest condition);

    // 인기 보드 조회
    List<TopBoardResponse> findTopActiveBoards(ActivityConditionRequest condition);

    // 로그 조회
    List<ActivityLogResponse> searchActivities(ActivityConditionRequest condition);

    // 로그 저장
    void saveLog(ActivityLogVo activityLog);

}
