package com.nullpointer.domain.invitation.service.impl;

import com.nullpointer.domain.activity.dto.request.ActivitySaveRequest;
import com.nullpointer.domain.activity.service.ActivityService;
import com.nullpointer.domain.activity.vo.enums.ActivityType;
import com.nullpointer.domain.invitation.dto.MyInvitationResponse;
import com.nullpointer.domain.invitation.dto.TeamInvitationResponse;
import com.nullpointer.domain.invitation.dto.TeamInviteRequest;
import com.nullpointer.domain.invitation.mapper.InvitationMapper;
import com.nullpointer.domain.invitation.service.InvitationEmailService;
import com.nullpointer.domain.invitation.service.InvitationService;
import com.nullpointer.domain.invitation.vo.InvitationVo;
import com.nullpointer.domain.invitation.vo.enums.Status;
import com.nullpointer.domain.member.mapper.TeamMemberMapper;
import com.nullpointer.domain.member.service.TeamMemberService;
import com.nullpointer.domain.member.vo.enums.Role;
import com.nullpointer.domain.team.mapper.TeamMapper;
import com.nullpointer.domain.team.vo.TeamVo;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.common.enums.RedisKeyType;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.util.RedisUtil;
import com.nullpointer.global.validator.MemberValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class InvitationServiceImpl implements InvitationService {

    private final InvitationMapper invitationMapper;
    private final TeamMemberService teamMemberService;
    private final InvitationEmailService emailService;
    private final TeamMapper teamMapper;
    private final UserMapper userMapper;
    private final RedisUtil redisUtil;
    private final MemberValidator memberValidator;
    private final ActivityService activityService;
    private final TeamMemberMapper teamMemberMapper;

    @Value("${app.domain.frontend}")
    private String frontendUrl;

    // ========================================================
    //  초대 메일 발송
    // ========================================================
    @Override
    @Transactional
    public void sendInvitation(Long teamId, TeamInviteRequest req, Long inviterId) {
        // 1. 권한 체크 (초대자가 OWNER인지 검증)
        memberValidator.validateTeamOwner(teamId, inviterId, ErrorCode.MEMBER_INVITE_FORBIDDEN);

        TeamVo team = teamMapper.findTeamByTeamId(teamId);
        if (team == null) {
            throw new BusinessException(ErrorCode.TEAM_NOT_FOUND);
        }

        UserVo inviter = userMapper.findById(inviterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // refactor) for문 안에서 쿼리 사용 -> 한 번만 사용하여 일괄 처리되도록 변경
        List<Long> targetIds = req.getUserIds();

        // 데이터 일괄 조회
        // 1. 초대할 사용자 정보, ID 조회
        List<UserVo> targetUsers = userMapper.findAllByIds(targetIds);

        // 2. 이미 팀 멤버인 사용자 ID 조회
        List<Long> existingMemberIds = teamMemberMapper.findExistingMemberUserIds(teamId, targetIds);
        Set<Long> existingMemberSet = new HashSet<>(existingMemberIds);

        // 3. 이미 대기 중인 초대장이 있는 사용자 ID 조회
        List<Long> pendingInviteeIds = invitationMapper.findPendingInviteeIds(teamId, targetIds);
        Set<Long> pendingInviteeSet = new HashSet<>(pendingInviteeIds);

        // 초대장 생성
        List<InvitationVo> invitationsToInsert = new ArrayList<>();

        for (UserVo target : targetUsers) {
            Long userId = target.getId();

            // 검증
            if (userId.equals(inviterId)) continue; // 본인 제외 초대
            if (existingMemberSet.contains(userId)) continue; // 이미 멤버인 경우
            if (pendingInviteeSet.contains(userId)) continue; // 이미 초대된 경우

            // 초대장 객체 생성
            String token = UUID.randomUUID().toString();
            InvitationVo invitation = InvitationVo.builder()
                    .teamId(teamId)
                    .inviterId(inviterId)
                    .inviteeId(userId)
                    .token(token)
                    .status(Status.PENDING)
                    .expiredAt(LocalDateTime.now().plusDays(7))
                    .build();

            invitationsToInsert.add(invitation);

            // Redis 저장
            redisUtil.setDataExpire(
                    RedisKeyType.INVITATION.getKey(token),
                    String.valueOf(userId),
                    RedisKeyType.INVITATION.getDefaultTtl()
            );

            // 이메일 전송
            String inviteUrl = UriComponentsBuilder.fromUriString(frontendUrl)
                    .path("/auth/invite/accept")
                    .queryParam("token", token)
                    .build()
                    .toUriString();

            emailService.sendInvitationEmail(target.getEmail(), inviteUrl, team.getName(), inviter.getNickname());
        }

        // DB에 한 번에 저장 (Bulk Insert)
        if (!invitationsToInsert.isEmpty()) {
            invitationMapper.insertInvitationsBulk(invitationsToInsert);
        }
    }

    // ========================================================
    //  초대 수락
    // ========================================================
    @Override
    @Transactional
    public void acceptInvitation(String token, Long loginUserId) {
        // 1. Redis 검증
        String storedIdString = redisUtil.getData(RedisKeyType.INVITATION.getKey(token));
        if (storedIdString == null) {
            throw new BusinessException(ErrorCode.INVITATION_EXPIRED);
        }

        // 2. 본인 확인
        Long invitedUserId = Long.valueOf(storedIdString);
        if (!invitedUserId.equals(loginUserId)) {
            throw new BusinessException(ErrorCode.INVITATION_MISMATCH);
        }

        // 3. DB 상태 검증 (Invitation 테이블 조회)
        InvitationVo invitation = invitationMapper.findByToken(token)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVITATION_NOT_FOUND));

        if (invitation.getStatus() != Status.PENDING) {
            throw new BusinessException(ErrorCode.INVITATION_ALREADY_PROCESSED);
        }

        if (invitation.getExpiredAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(Status.EXPIRED);
            invitationMapper.updateStatus(invitation);
            redisUtil.deleteData(RedisKeyType.INVITATION.getKey(token));
            throw new BusinessException(ErrorCode.INVITATION_EXPIRED);
        }

        // 4. 초대 상태 수락으로 변경
        invitation.setStatus(Status.ACCEPTED);
        invitationMapper.updateStatus(invitation);

        // 5. 실제 멤버로 등록 (신규 멤버 추가 or 탈퇴 멤버 복구)
        teamMemberService.addMember(invitation.getTeamId(), loginUserId, Role.MEMBER);

        // 팀 멤버 초대 로그 저장
        inviteMemberLog(invitation.getTeamId(), loginUserId);

        // 6. Redis 정리
        redisUtil.deleteData(RedisKeyType.INVITATION.getKey(token));
    }

    // ========================================================
    //  초대 거절
    // ========================================================
    @Override
    @Transactional
    public void rejectInvitation(String token, Long loginUserId) {
        InvitationVo invitation = invitationMapper.findByToken(token)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVITATION_NOT_FOUND));

        if (!invitation.getInviteeId().equals(loginUserId)) {
            throw new BusinessException(ErrorCode.INVITATION_MISMATCH);
        }

        if (invitation.getStatus() == Status.PENDING) {
            invitation.setStatus(Status.REJECTED);
            invitationMapper.updateStatus(invitation);
        }

        redisUtil.deleteData(RedisKeyType.INVITATION.getKey(token));
    }

    // ========================================================
    //  팀원 초대 리스트 조회
    // ========================================================

    @Override
    @Transactional(readOnly = true)
    public List<TeamInvitationResponse> getSentInvitations(Long teamId, Long userId) {
        // 1. 요청자가 팀장(OWNER)인지 확인
        memberValidator.validateTeamOwner(teamId, userId, ErrorCode.TEAM_ACCESS_DENIED);

        // 2. 해당 팀의 초대 내역 조회
        return invitationMapper.findAllByTeamId(teamId);
    }

    // ========================================================
    //  내 초대 리스트 조회
    // ========================================================

    @Override
    @Transactional(readOnly = true)
    public List<MyInvitationResponse> getMyInvitations(Long userId) {
        return invitationMapper.findAllByUserId(userId);
    }

    // 팀 멤버 초대 로그
    private void inviteMemberLog(Long teamId, Long userId) {
        UserVo user = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        activityService.saveLog(
                ActivitySaveRequest.builder()
                        .userId(userId)
                        .teamId(teamId)
                        .boardId(null)
                        .type(ActivityType.INVITE_MEMBER)
                        .targetId(userId)
                        .targetName(user.getNickname())
                        .description(user.getNickname() + "님을 팀에 초대했습니다.")
                        .build());
    }

    // ========================================================
    //  내 초대 리스트 조회
    // ========================================================

    @Override
    public void removeInvitation(Long invitationId, Long userId) {
        // 1. 초대 정보 조회
        InvitationVo invitation = invitationMapper.findById(invitationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVITATION_NOT_FOUND));

        // 2. 요청자가 팀장(OWNER)인지 확인
        memberValidator.validateTeamOwner(invitation.getTeamId(), userId, ErrorCode.TEAM_ACCESS_DENIED);

        // 3. 초대 삭제
        invitationMapper.deleteInvitation(invitationId);

        // 4. Redis 정리
        if (invitation.getToken() != null) {
            redisUtil.deleteData(RedisKeyType.INVITATION.getKey(invitation.getToken()));
        }
    }
}