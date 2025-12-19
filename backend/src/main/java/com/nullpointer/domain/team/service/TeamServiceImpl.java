package com.nullpointer.domain.team.service;

import com.nullpointer.domain.activity.dto.request.ActivitySaveRequest;
import com.nullpointer.domain.activity.service.ActivityService;
import com.nullpointer.domain.activity.vo.enums.ActivityType;
import com.nullpointer.domain.board.dto.response.BoardResponse;
import com.nullpointer.domain.board.mapper.BoardMapper;
import com.nullpointer.domain.board.service.BoardService;
import com.nullpointer.domain.member.dto.team.TeamMemberResponse;
import com.nullpointer.domain.member.mapper.TeamMemberMapper;
import com.nullpointer.domain.member.vo.TeamMemberVo;
import com.nullpointer.domain.member.vo.enums.Role;
import com.nullpointer.domain.notification.event.InvitationEvent;
import com.nullpointer.domain.notification.vo.enums.NotificationType;
import com.nullpointer.domain.team.dto.request.CreateTeamRequest;
import com.nullpointer.domain.team.dto.request.UpdateTeamRequest;
import com.nullpointer.domain.team.dto.response.TeamDetailResponse;
import com.nullpointer.domain.team.dto.response.TeamResponse;
import com.nullpointer.domain.team.mapper.TeamMapper;
import com.nullpointer.domain.team.vo.TeamVo;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.global.common.SocketSender;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.validator.MemberValidator;
import com.nullpointer.global.validator.TeamValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamMapper teamMapper;
    private final TeamMemberMapper teamMemberMapper;
    private final BoardMapper boardMapper;
    private final TeamValidator teamVal;
    private final MemberValidator memberVal;
    private final ApplicationEventPublisher publisher;
    private final SocketSender socketSender;

    private final BoardService boardService;
    private final ActivityService activityService;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public void createTeam(CreateTeamRequest req, Long userId) {

        // 1. 팀 VO 생성 (DTO -> VO)
        TeamVo teamVo = req.toVo();
        teamMapper.insertTeam(teamVo);

        // 팀 생성 로그 저장
        createTeamLog(userId, teamVo);

        // 2. 방금 만든 팀 ID 가져오기
        Long createTeamId = teamVo.getId();

        // 3. 팀 멤버 VO 생성 (DTO -> VO)
        TeamMemberVo teamMemberVo = TeamMemberVo.builder()
                .teamId(createTeamId)
                .userId(userId)
                .role(Role.OWNER)
                .build();

        teamMemberMapper.insertTeamMember(teamMemberVo);
    }

    @Override
    @Transactional
    public void createPersonalTeam(Long userId, String nickname) {
        // 1. 기본 팀 생성
        TeamVo team = TeamVo.builder()
                .name(nickname + "의 워크스페이스")
                .description("기본으로 제공되는 개인용 공간입니다.")
                .build();

        teamMapper.insertTeam(team);

        // 방금 만든 팀 ID 가져오기
        Long teamId = team.getId();

        // 2. 멤버 연결 (OWNER)
        TeamMemberVo teamMember = TeamMemberVo.builder()
                .teamId(teamId)
                .userId(userId)
                .role(Role.OWNER)
                .build();

        teamMemberMapper.insertTeamMember(teamMember);

        // 3. 기본 보드, 리스트 생성 -> BoardService에 위임
        boardService.createDefaultBoard(teamId, userId);
    }

    @Override
    public List<TeamResponse> getTeams(Long userId) {
        List<TeamVo> teams = teamMapper.findTeamByUserId(userId);
        return teams.stream().map(TeamResponse::from).toList();
    }

    // 팀 상세 조회
    @Override
    @Transactional(readOnly = true)
    public TeamDetailResponse getTeamDetail(Long teamId, Long userId) {
        // 1. 팀 유효성 검증
        TeamVo teamVo = teamVal.getValidTeam(teamId);

        // 2. 접근 권한 검증 (팀원인지 확인)
        memberVal.validateTeamMember(teamId, userId);

        // 3. 팀 멤버 목록
        List<TeamMemberResponse> members = teamMemberMapper.findMembersByTeamId(teamId);

        // 4. 팀 보드 목록 (즐겨찾기 반영)
        List<BoardResponse> boards = boardMapper.findBoardWithFavoriteStatus(teamId, userId);

        // 6. 하나의 DTO로 묶기
        return TeamDetailResponse.of(teamVo, members, boards);
    }

    @Override
    @Transactional
    public void updateTeam(Long teamId, UpdateTeamRequest req, Long userId) {
        // 1. 팀 유효성 검증
        TeamVo teamVo = teamVal.getValidTeam(teamId);

        // 2. 수정 권한 검증 (OWNER 여부)
        memberVal.validateTeamOwner(teamId, userId, ErrorCode.TEAM_UPDATE_FORBIDDEN);

        // 3. 업데이트 진행
        if (req.getName() != null) {
            teamVo.setName(req.getName());
        }
        if (req.getDescription() != null) {
            teamVo.setDescription(req.getDescription());
        }

        teamMapper.updateTeam(teamVo);

        // 팀 수정 로그 저장
        updateTeamLog(userId, teamVo);

        // 소켓 전송
        socketSender.sendTeamSocketMessage(teamId, "TEAM_UPDATED", userId, null);
    }

    // 팀 삭제
    @Override
    @Transactional
    public void deleteTeam(Long teamId, Long userId) {
        // 1. 팀 유효성 검증
        TeamVo teamVo = teamVal.getValidTeam(teamId);

        // 2. 삭제 권한 검증 (OWNER 여부)
        memberVal.validateTeamOwner(teamId, userId, ErrorCode.TEAM_DELETE_FORBIDDEN);

        // 관리자 정보 조회
        UserVo actor = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 삭제 전에 알림을 받을 멤버 조회
        List<Long> memberIds = teamMemberMapper.findAllMemberIdsByTeamId(teamId);

        // 3. 삭제 진행 (Soft Delete)
        teamMapper.deleteTeam(teamId);

        // [알림] 팀 삭제 알림 발송
        for (Long memberId : memberIds) {
            if (memberId.equals(actor.getId())) continue;
            publishDeleteEvent(actor, memberId, teamVo);
        }

        // 소켓 전송
        socketSender.sendTeamSocketMessage(teamId, "TEAM_DELETED", userId, null);
    }

    /**
     * 팀 관리 로그
     */

    // 팀 생성 로그
    private void createTeamLog(Long userId, TeamVo team) {
        activityService.saveLog(ActivitySaveRequest.builder()
                .userId(userId)
                .teamId(team.getId())
                .boardId(null)
                .type(ActivityType.CREATE_TEAM)
                .targetId(team.getId())
                .targetName(team.getName())
                .description("팀이 생성되었습니다.")
                .build());
    }

    // 팀 수정 로그
    private void updateTeamLog(Long userId, TeamVo team) {
        activityService.saveLog(ActivitySaveRequest.builder()
                .userId(userId)
                .teamId(team.getId())
                .boardId(null)
                .type(ActivityType.UPDATE_TEAM)
                .targetId(team.getId())
                .targetName(team.getName())
                .description("팀 설정을 변경했습니다.")
                .build());
    }

    /**
     * Helper Methods
     */

    // [이벤트] 팀 삭제 이벤트 발행
    private void publishDeleteEvent(UserVo sender, Long receiverId, TeamVo team) {
        InvitationEvent event = InvitationEvent.builder()
                .senderId(sender.getId())
                .senderNickname(sender.getNickname())
                .senderProfileImg(sender.getProfileImg())
                .receiverId(receiverId)
                .targetName(team.getName())
                .type(NotificationType.TEAM_DELETED)
                .build();

        publisher.publishEvent(event);
    }

}
