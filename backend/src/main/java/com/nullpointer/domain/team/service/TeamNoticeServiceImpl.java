package com.nullpointer.domain.team.service;

import com.nullpointer.domain.notification.vo.enums.NotificationType;
import com.nullpointer.domain.team.dto.request.CreateNoticeRequest;
import com.nullpointer.domain.team.dto.request.UpdateNoticeRequest;
import com.nullpointer.domain.team.dto.response.TeamNoticeResponse;
import com.nullpointer.domain.team.event.TeamNoticeEvent;
import com.nullpointer.domain.team.mapper.TeamMapper;
import com.nullpointer.domain.team.mapper.TeamNoticeMapper;
import com.nullpointer.domain.team.vo.TeamNoticeVo;
import com.nullpointer.domain.team.vo.TeamVo;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.global.common.SocketSender;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.validator.MemberValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TeamNoticeServiceImpl implements TeamNoticeService {

    private final TeamNoticeMapper noticeMapper;
    private final MemberValidator memberVal;
    private final UserMapper userMapper;
    private final ApplicationEventPublisher publisher;
    private final SocketSender socketSender;
    private final TeamMapper teamMapper;

    // 목록 조회
    @Override
    public List<TeamNoticeResponse> getNotices(Long teamId, Long userId) {
        // 팀의 멤버인지 검증
        memberVal.validateTeamMember(teamId, userId);
        // 목록 반환
        return noticeMapper.findAllByTeamId(teamId);
    }

    // 상세 조회
    @Override
    public TeamNoticeResponse getNoticeDetail(Long noticeId, Long userId) {
        // 공지사항 존재 여부 확인
        TeamNoticeVo notice = noticeMapper.findById(noticeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));

        // 팀의 멤버인지 검증
        memberVal.validateTeamMember(notice.getTeamId(), userId);

        // 작성자 정보 조회
        UserVo writer = userMapper.findById(notice.getWriterId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 상세 정보 조회 및 반환
        return TeamNoticeResponse.builder()
                .id(noticeId)
                .title(notice.getTitle())
                .content(notice.getContent())
                .isImportant(notice.getIsImportant())
                .viewCount(notice.getViewCount())
                .createdAt(notice.getCreatedAt())
                .updatedAt(notice.getUpdatedAt())
                .writerId(writer.getId())
                .writerNickname(writer.getNickname())
                .writerProfileImg(writer.getProfileImg())
                .build();
    }

    // 공지사항 등록
    @Override
    public void createNotice(Long teamId, CreateNoticeRequest request, Long userId) {
        // 팀의 관리자인지 검증
        memberVal.validateTeamOwner(teamId, userId, ErrorCode.PERMISSION_FORBIDDEN);

        // 이번 공지사항을 필독으로 설정한 경우, 기존 필독 해제
        if (Boolean.TRUE.equals(request.getIsImportant())) {
            noticeMapper.resetImportantNotices(teamId);
        }

        TeamNoticeVo notice = TeamNoticeVo.builder()
                .teamId(teamId)
                .writerId(userId)
                .title(request.getTitle())
                .content(request.getContent())
                .isImportant(request.getIsImportant())
                .build();

        noticeMapper.insertNotice(notice);

        // [이벤트] 공지사항 알림 이벤트 발행
        publishNoticeEvent(notice, userId, TeamNoticeEvent.EventType.CREATE, NotificationType.TEAM_NOTICE_CREATED);

        // 화면 갱신용 소켓 전송
        socketSender.sendTeamSocketMessage(teamId, "TEAM_NOTICE_UPDATE", userId, null);
    }

    // 공지사항 수정
    @Override
    public void updateNotice(Long noticeId, UpdateNoticeRequest request, Long teamId, Long userId) {
        // 팀의 관리자인지 검증
        memberVal.validateTeamOwner(teamId, userId, ErrorCode.PERMISSION_FORBIDDEN);

        // 수정하려는 상태가 필독인 경우, 기존 필독들 해제
        if (Boolean.TRUE.equals(request.getIsImportant())) {
            noticeMapper.resetImportantNotices(teamId);
        }

        TeamNoticeVo notice = TeamNoticeVo.builder()
                .id(noticeId)
                .teamId(teamId)
                .title(request.getTitle())
                .content(request.getContent())
                .isImportant(request.getIsImportant())
                .build();

        noticeMapper.updateNotice(notice);

        String currentTitle = (request.getTitle() != null) ? request.getTitle() : notice.getTitle();
        notice.setTitle(currentTitle); // 이벤트 객체 생성을 위해 잠시 세팅

        // [이벤트] 공지사항 수정 로그 이벤트 발행
        publishNoticeEvent(notice, userId, TeamNoticeEvent.EventType.UPDATE, null);

        // 화면 갱신용 소켓 전송
        socketSender.sendTeamSocketMessage(teamId, "TEAM_NOTICE_UPDATE", userId, null);
    }

    // 공지사항 삭제
    @Override
    public void deleteNotice(Long noticeId, Long teamId, Long userId) {
        // 팀의 관리자인지 검증
        memberVal.validateTeamOwner(teamId, userId, ErrorCode.PERMISSION_FORBIDDEN);

        TeamNoticeVo notice = noticeMapper.findById(noticeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));

        // 공지사항 삭제
        noticeMapper.deleteNotice(noticeId);

        // [이벤트] 공지사항 삭제 로그 이벤트 발행
        publishNoticeEvent(notice, userId, TeamNoticeEvent.EventType.DELETE, null);

        // 화면 갱신용 소켓 전송
        socketSender.sendTeamSocketMessage(teamId, "TEAM_NOTICE_UPDATE", userId, null);
    }

    @Override
    public void increaseViewCount(Long noticeId, Long userId) {
        // 공지사항 존재 여부 확인
        TeamNoticeVo notice = noticeMapper.findById(noticeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));

        // 팀의 멤버인지 검증
        memberVal.validateTeamMember(notice.getTeamId(), userId);

        noticeMapper.increaseViewCount(noticeId);
    }

    /**
     * 이벤트 발행
     * - notiType이 null이면 알림은 안 가고 로그만 저장됨
     */
    private void publishNoticeEvent(TeamNoticeVo notice, Long actorId,
                                    TeamNoticeEvent.EventType eventType,
                                    NotificationType notiType) {

        // 1. 필요한 정보 조회 (팀 이름, 행위자 닉네임 등)
        TeamVo team = teamMapper.findTeamByTeamId(notice.getTeamId())
                .orElseThrow(() -> new BusinessException(ErrorCode.TEAM_NOT_FOUND));

        UserVo actor = userMapper.findById(actorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 2. 이벤트 빌드
        TeamNoticeEvent event = TeamNoticeEvent.builder()
                .teamId(team.getId())
                .teamName(team.getName())
                .noticeId(notice.getId())
                .noticeTitle(notice.getTitle())
                .writerId(actor.getId())           // 행위자 ID
                .writerNickname(actor.getNickname())
                .writerProfileImg(actor.getProfileImg())
                .eventType(eventType)
                .type(notiType)
                .build();

        // 3. 발행
        publisher.publishEvent(event);
    }

}
