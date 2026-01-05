package com.nullpointer.domain.team.mapper;

import com.nullpointer.domain.team.dto.response.TeamNoticeResponse;
import com.nullpointer.domain.team.vo.TeamNoticeVo;

import java.util.List;
import java.util.Optional;

public interface TeamNoticeMapper {

    // 공지사항 저장
    void insertNotice(TeamNoticeVo vo);

    // 목록 조회
    List<TeamNoticeResponse> findAllByTeamId(Long teamId);

    // 상세 조회
    Optional<TeamNoticeVo> findById(Long noticeId);

    void updateNotice(TeamNoticeVo vo);

    void deleteNotice(Long noticeId);

    // 조회수 증가
    void increaseViewCount(Long noticeId);

    // 공지사항 필독 설정 해제
    void resetImportantNotices(Long teamId);

}
