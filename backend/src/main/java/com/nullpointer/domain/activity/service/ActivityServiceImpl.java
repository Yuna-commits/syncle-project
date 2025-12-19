package com.nullpointer.domain.activity.service;

import com.nullpointer.domain.activity.dto.request.ActivityConditionRequest;
import com.nullpointer.domain.activity.dto.request.ActivitySaveRequest;
import com.nullpointer.domain.activity.dto.response.ActivityLogResponse;
import com.nullpointer.domain.activity.dto.response.ActivityStatsResponse;
import com.nullpointer.domain.activity.dto.response.TopBoardResponse;
import com.nullpointer.domain.activity.mapper.ActivityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private final ActivityMapper activityMapper;

    /**
     * 통계 조회 (7일)
     */
    @Override
    @Transactional(readOnly = true)
    public ActivityStatsResponse getStats(ActivityConditionRequest condition) {
        return activityMapper.getStats(condition);
    }

    /**
     * 인기 보드 조회 (30일)
     */
    @Override
    @Transactional(readOnly = true)
    public List<TopBoardResponse> getTopBoard(ActivityConditionRequest condition) {
        return activityMapper.findTopActiveBoards(condition);
    }

    /**
     * 타임라인 조회
     */
    @Override
    @Transactional(readOnly = true)
    public List<ActivityLogResponse> getActivities(ActivityConditionRequest condition) {
        return activityMapper.searchActivities(condition);
    }

    /**
     * 로그 저장
     */
    @Async
    @Override
    @Transactional
    public void saveLog(ActivitySaveRequest req) {
        activityMapper.saveLog(req.toVo());
    }

}
