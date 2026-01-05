package com.nullpointer.domain.team.service;

import com.nullpointer.domain.team.dto.request.CreateNoticeRequest;
import com.nullpointer.domain.team.dto.request.UpdateNoticeRequest;
import com.nullpointer.domain.team.dto.response.TeamNoticeResponse;

import java.util.List;

public interface TeamNoticeService {

    // 목록 조회
    List<TeamNoticeResponse> getNotices(Long teamId, Long userId);

    // 상세 조회
    TeamNoticeResponse getNoticeDetail(Long noticeId, Long userId);

    // 공지사항 생성 (관리자만 가능)
    void createNotice(Long teamId, CreateNoticeRequest request, Long userId);

    // 공지사항 수정
    void updateNotice(Long noticeId, UpdateNoticeRequest request, Long teamId, Long userId);

    // 공지사항 삭제
    void deleteNotice(Long noticeId, Long teamId, Long userId);

    // 조회수 증가
    void increaseViewCount(Long noticeId, Long userId);

}
