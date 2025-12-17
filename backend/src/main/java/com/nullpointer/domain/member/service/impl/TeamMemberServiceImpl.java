package com.nullpointer.domain.member.service.impl;

import com.nullpointer.domain.activity.dto.request.ActivitySaveRequest;
import com.nullpointer.domain.activity.service.ActivityService;
import com.nullpointer.domain.activity.vo.enums.ActivityType;
import com.nullpointer.domain.member.dto.team.TeamMemberResponse;
import com.nullpointer.domain.member.dto.team.TeamRoleUpdateRequest;
import com.nullpointer.domain.member.mapper.TeamMemberMapper;
import com.nullpointer.domain.member.service.TeamMemberService;
import com.nullpointer.domain.member.vo.TeamMemberVo;
import com.nullpointer.domain.member.vo.enums.Role;
import com.nullpointer.domain.notification.event.InvitationEvent;
import com.nullpointer.domain.notification.vo.enums.NotificationType;
import com.nullpointer.domain.team.mapper.TeamMapper;
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
public class TeamMemberServiceImpl implements TeamMemberService {

    private final TeamMapper teamMapper;
    private final TeamMemberMapper teamMemberMapper;
    private final UserMapper userMapper;
    private final MemberValidator memberVal;
    private final ActivityService activityService;
    private final SocketSender socketSender;
    private final ApplicationEventPublisher publisher;

    // 멤버 추가 (초대 수락 시 호출됨)
    @Override
    @Transactional
    public void addMember(Long teamId, Long userId, Role role) {
        // 탈퇴한 멤버를 포함해서 기존 이력 조회
        TeamMemberVo existingTeamMember = teamMemberMapper.findMemberIncludeDeleted(teamId, userId);

        if (existingTeamMember == null) {
            // 신규 멤버 -> INSERT
            TeamMemberVo newMember = TeamMemberVo.builder()
                    .teamId(teamId)
                    .userId(userId)
                    .role(role)
                    .build();

            teamMemberMapper.insertTeamMember(newMember);
        } else if (existingTeamMember.getDeletedAt() != null) {
            // 탈퇴 멤버 -> UPDATE (deleted_at = null)
            teamMemberMapper.restoreMember(teamId, userId, role);
        } else {
            // 이미 활동 중인 멤버 -> 예외처리
            throw new BusinessException(ErrorCode.MEMBER_ALREADY_EXISTS);
        }

    }

    @Override
    public List<TeamMemberResponse> getTeamMembers(Long teamId) {
        return teamMemberMapper.findMembersByTeamId(teamId);
    }

    @Override
    @Transactional
    public void changeTeamRole(Long teamId, Long targetId, TeamRoleUpdateRequest req, Long ownerId) {
        // 1. 요청자가 OWNER인지 확인
        memberVal.validateTeamOwner(teamId, ownerId, ErrorCode.MEMBER_UPDATE_FORBIDDEN);

        // 2. 대상 멤버 존재 확인
        if (!teamMemberMapper.existsByTeamIdAndUserId(teamId, targetId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        Role newRole = req.getRole();

        // 추가) OWNER 권한 위임 로직
        if (newRole == Role.OWNER) {
            // 1. 나(OWNER)를 MEMBER로 강등
            TeamMemberVo me = TeamMemberVo.builder()
                    .teamId(teamId)
                    .userId(ownerId)
                    .role(Role.MEMBER)
                    .build();

            teamMemberMapper.updateTeamRole(me);

            // 2. 대상(targetId)를 OWNER로 승격
            TeamMemberVo target = TeamMemberVo.builder()
                    .teamId(teamId)
                    .userId(targetId)
                    .role(Role.OWNER)
                    .build();

            teamMemberMapper.updateTeamRole(target);
        } else {
            // 일반적인 권한 변경 (MEMBER <-> VIEWER)
            // OWNER가 스스로 MEMBER로 내리는 것은 불가능
            if (ownerId.equals(targetId)) {
                throw new BusinessException(ErrorCode.OWNER_CANNOT_DOWNGRADE_SELF);
            }

            TeamMemberVo vo = req.toVo(teamId, targetId);
            teamMemberMapper.updateTeamRole(vo);
        }

        // 멤버 권한 변경 로그 저장
        // changeRoleLog(teamId, memberId, userId, oldRole, req.getRole());
    }

    @Override
    @Transactional
    public void deleteTeamMember(Long teamId, Long memberId, Long userId) {
        TeamVo team = teamMapper.findTeamByTeamId(teamId);
        UserVo actor = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 1. 대상 멤버 존재 확인
        if (!teamMemberMapper.existsByTeamIdAndUserId(teamId, memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        // 2. 추방/탈퇴 분기
        if (!userId.equals(memberId)) {
            // [추방] OWNER가 멤버 추방
            memberVal.validateTeamOwner(teamId, userId, ErrorCode.MEMBER_DELETE_FORBIDDEN);
            // [알림] 대상자에게 추방 알림 발송
            publishMemberEvent(actor, memberId, team, NotificationType.TEAM_MEMBER_KICKED);
        } else {
            // [탈퇴] 본인 탈퇴
            // 추가) 본인이 OWNER이면 탈퇴 불가
            TeamMemberVo me = teamMemberMapper.findMember(teamId, userId);
            if (me.getRole() == Role.OWNER) {
                throw new BusinessException(ErrorCode.OWNER_MUST_TRANSFER_BEFORE_LEAVE);
            }

            Long ownerId = findTeamOwnerId(teamId);
            publishMemberEvent(actor, ownerId, team, NotificationType.TEAM_MEMBER_LEFT);
        }

        // 3. 탈퇴 처리
        teamMemberMapper.deleteTeamMember(teamId, memberId);

        // 탈퇴/강퇴 로그 저장
        // kickMemberLog(teamId, memberId, ownerId);
    }

    /**
     * 팀 멤버 관리 로그
     */

    // 멤버 권한 변경 로그
    private void changeRoleLog(Long teamId, Long targetUserId, Long ownerId, Role oldRole, Role newRole) {
        UserVo targetUser = userMapper.findById(targetUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        activityService.saveLog(
                ActivitySaveRequest.builder()
                        .userId(ownerId) // 변경한 관리자 ID
                        .teamId(teamId)
                        .boardId(null)
                        .type(ActivityType.UPDATE_MEMBER_ROLE)
                        .targetId(targetUserId)
                        .targetName(targetUser.getNickname())
                        .description(String.format("권한을 %s -> %s (으)로 변경했습니다.", oldRole, newRole))
                        .build());
    }

    // 멤버 탈퇴/강퇴 로그
    private void kickMemberLog(Long teamId, Long targetUserId, Long ownerId) {
        UserVo targetUser = userMapper.findById(targetUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        activityService.saveLog(
                ActivitySaveRequest.builder()
                        .userId(ownerId != null ? ownerId : targetUserId) // 강퇴시킨 관리자 ID 또는 본인 ID
                        .teamId(teamId)
                        .boardId(null)
                        .type(ActivityType.KICK_MEMBER)
                        .targetId(targetUserId)
                        .targetName(targetUser.getNickname())
                        .description(targetUser.getNickname() + "님이 " + (ownerId != null ? "OWNER에 의해 팀에서 강퇴되었습니다." : "팀에서 탈퇴했습니다."))
                        .build());
    }

    /**
     * Helper Methods
     */

    // 팀 OWNER id 조회
    private Long findTeamOwnerId(Long teamId) {
        return teamMemberMapper.findMembersByTeamId(teamId).stream()
                .filter(m -> m.getRole() == Role.OWNER)
                .map(TeamMemberResponse::getUserId)
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    // [이벤트] 멤버 추방/탈퇴 이벤트 발행
    private void publishMemberEvent(UserVo sender, Long receiverId, TeamVo team, NotificationType type) {
        InvitationEvent event = InvitationEvent.builder()
                .senderId(sender.getId())
                .senderNickname(sender.getNickname())
                .senderProfileImg(sender.getProfileImg())
                .receiverId(receiverId)
                .targetId(team.getId())
                .targetName(team.getName())
                .type(type)
                .build();

        publisher.publishEvent(event);
    }

}