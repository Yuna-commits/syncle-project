package com.nullpointer.domain.member.service.impl;

import com.nullpointer.domain.invitation.event.InvitationEvent;
import com.nullpointer.domain.member.dto.team.TeamMemberResponse;
import com.nullpointer.domain.member.dto.team.TeamRoleUpdateRequest;
import com.nullpointer.domain.member.event.MemberEvent;
import com.nullpointer.domain.member.mapper.TeamMemberMapper;
import com.nullpointer.domain.member.service.TeamMemberService;
import com.nullpointer.domain.member.vo.TeamMemberVo;
import com.nullpointer.domain.member.vo.enums.Role;
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

        // 알림용 조회
        TeamVo team = teamMapper.findTeamByTeamId(teamId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TEAM_NOT_FOUND));
        UserVo owner = userMapper.findById(ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

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

        publishRolChangeEvent(owner, targetId, team, req.getRole());
    }

    @Override
    @Transactional
    public void deleteTeamMember(Long teamId, Long memberId, Long userId) {
        TeamVo team = teamMapper.findTeamByTeamId(teamId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TEAM_NOT_FOUND));

        UserVo actor = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 1. 대상 멤버 존재 확인
        if (!teamMemberMapper.existsByTeamIdAndUserId(teamId, memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        // 알림 대상, 타입 결정
        NotificationType notificationType;
        Long receiverId;
        String receiverNickname;

        // 2. 추방/탈퇴 분기
        if (!userId.equals(memberId)) {
            // [추방] OWNER가 멤버 추방
            memberVal.validateTeamOwner(teamId, userId, ErrorCode.MEMBER_DELETE_FORBIDDEN);

            // 추방 대상 정보 조회 (닉네임 필요)
            UserVo kickedMember = userMapper.findById(memberId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

            notificationType = NotificationType.TEAM_MEMBER_KICKED;
            receiverId = memberId; // 추방 대상에게 알림
            receiverNickname = kickedMember.getNickname();
        } else {
            // [탈퇴] 본인 탈퇴
            // 추가) 본인이 OWNER이면 탈퇴 불가
            TeamMemberVo me = teamMemberMapper.findMember(teamId, userId);
            if (me.getRole() == Role.OWNER) {
                throw new BusinessException(ErrorCode.OWNER_MUST_TRANSFER_BEFORE_LEAVE);
            }
            notificationType = NotificationType.TEAM_MEMBER_LEFT;
            receiverId = findTeamOwnerId(teamId); // 관리자에게 알림
            receiverNickname = actor.getNickname();
        }

        // 3. DB 삭제 처리
        teamMemberMapper.deleteTeamMember(teamId, memberId);

        // [알림] 관리자/추방 대상에게 알림 발송
        publishMemberEvent(actor, receiverId, receiverNickname, team, notificationType);
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
    private void publishMemberEvent(UserVo sender, Long receiverId, String receiverNickname, TeamVo team, NotificationType type) {
        InvitationEvent event = InvitationEvent.builder()
                .senderId(sender.getId())
                .senderNickname(sender.getNickname())
                .senderProfileImg(sender.getProfileImg())
                .receiverId(receiverId)
                .receiverNickname(receiverNickname)
                .targetId(team.getId())
                .targetName(team.getName())
                .type(type)
                .build();

        publisher.publishEvent(event);
    }

    // [이벤트] 권한 변경 이벤트 발행
    private void publishRolChangeEvent(UserVo sender, Long receiverId, TeamVo team, Role newRole) {
        MemberEvent event = MemberEvent.builder()
                .targetUserId(receiverId)
                .targetId(team.getId())
                .targetName(team.getName())
                .targetType(MemberEvent.TargetType.TEAM)
                .senderId(sender.getId())
                .senderNickname(sender.getNickname())
                .senderProfileImg(sender.getProfileImg())
                .newRole(newRole)
                .type(NotificationType.PERMISSION_CHANGED)
                .build();

        publisher.publishEvent(event);
    }

}