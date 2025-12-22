package com.nullpointer.domain.activity.service;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.nullpointer.domain.activity.dto.request.ActivityConditionRequest;
import com.nullpointer.domain.activity.dto.request.ActivitySaveRequest;
import com.nullpointer.domain.activity.dto.response.ActivityLogResponse;
import com.nullpointer.domain.activity.dto.response.ActivityStatsResponse;
import com.nullpointer.domain.activity.dto.response.TopBoardResponse;
import com.nullpointer.domain.activity.mapper.ActivityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
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
    public Page<ActivityLogResponse> getActivities(ActivityConditionRequest condition, Pageable pageable) {
        // 1. PageHelper 시작 (Spring Page는 0부터 시작하므로 +1 보정)
        PageHelper.startPage(pageable.getPageNumber() + 1, pageable.getPageSize());

        // 2. Mapper 호출 (PageHelper가 자동으로 LIMIT/OFFSET 및 Count 쿼리 실행)
        List<ActivityLogResponse> content = activityMapper.searchActivities(condition);

        // 3. PageInfo로 감싸서 전체 개수 등 페이징 정보 추출
        PageInfo<ActivityLogResponse> pageInfo = new PageInfo<>(content);

        // 4. Spring Data Page 객체로 변환하여 반환
        return new PageImpl<>(pageInfo.getList(), pageable, pageInfo.getTotal());
    }

    /**
     * 로그 저장
     */
    @Override
    @Transactional
    public void saveLog(ActivitySaveRequest req) {
        activityMapper.saveLog(req.toVo());
    }

}
