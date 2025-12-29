package com.nullpointer.domain.activity.service;

import com.nullpointer.domain.activity.dto.request.ActivityConditionRequest;
import com.nullpointer.domain.activity.dto.request.ActivitySaveRequest;
import com.nullpointer.domain.activity.dto.response.ActivityLogResponse;
import com.nullpointer.domain.activity.dto.response.ActivityStatsResponse;
import com.nullpointer.domain.activity.dto.response.TopBoardResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ActivityService {

    // 활동 통계
    ActivityStatsResponse getStats(ActivityConditionRequest condition);

    // 인기 보드
    List<TopBoardResponse> getTopBoard(ActivityConditionRequest condition);

    // 타임라인 조회
    Page<ActivityLogResponse> getActivities(ActivityConditionRequest condition, Pageable pageable);

    // 커서 기반 로그 조회
    List<ActivityLogResponse> getBoardActivities(Long boardId, Long cursorId, int limit);

    // 로그 저장 (다른 서비스에서 호출)
    void saveLog(ActivitySaveRequest req);

}
