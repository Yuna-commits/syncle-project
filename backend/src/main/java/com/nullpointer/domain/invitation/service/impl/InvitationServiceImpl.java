package com.nullpointer.domain.invitation.service.impl;

import com.nullpointer.domain.invitation.dto.TeamInviteRequest;
import com.nullpointer.domain.invitation.mapper.InvitationMapper;
import com.nullpointer.domain.invitation.service.InvitationEmailService;
import com.nullpointer.domain.invitation.service.InvitationService;
import com.nullpointer.domain.invitation.vo.InvitationVo;
import com.nullpointer.domain.invitation.vo.enums.Status;
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
import com.nullpointer.global.validator.member.MemberValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

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

    @Value("${app.domain.frontend}")
    private String frontendUrl;

    // ========================================================
    //  1. 초대 메일 발송
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

        for (Long targetUserId : req.getUserIds()) {
            // [보완 1] 자기 자신을 초대하는 경우 방지
            if (targetUserId.equals(inviterId)) {
                throw new BusinessException(ErrorCode.CANNOT_INVITE_SELF); // ErrorCode 추가 필요
            }

            UserVo targetUser = userMapper.findById(targetUserId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

            // [보완 2] 이미 팀 멤버인지 확인 (Validator 메서드명 변경 제안)
            // validateTeamMember -> validateNotTeamMember (멤버면 예외 발생)
            memberValidator.validateNotTeamMember(teamId, targetUserId, ErrorCode.MEMBER_ALREADY_EXISTS);

            // [보완 3] 이미 대기 중(PENDING)인 초대장이 있는지 확인
            // (Mapper에 findPendingInvitation 메서드 추가 필요)
            boolean hasPendingInvite = invitationMapper.existsByTeamIdAndInviteeIdAndStatus(teamId, targetUserId, Status.PENDING);
            if (hasPendingInvite) {
                throw new BusinessException(ErrorCode.INVITATION_ALREADY_SENT); // ErrorCode 추가 필요
            }

            // 4. 토큰 및 초대 데이터 생성 (Status: PENDING)
            String token = UUID.randomUUID().toString();
            LocalDateTime expireAt = LocalDateTime.now().plusDays(7);

            InvitationVo invitation = InvitationVo.builder()
                    .teamId(teamId)
                    .inviterId(inviterId)
                    .inviteeId(targetUserId)
                    .token(token)
                    .status(Status.PENDING)
                    .expiredAt(expireAt)
                    .build();

            // 5. DB 저장
            invitationMapper.insertInvitation(invitation);

            // 6. Redis 저장
            redisUtil.setDataExpire(
                    RedisKeyType.INVITATION.getKey(token),
                    String.valueOf(targetUserId),
                    RedisKeyType.INVITATION.getDefaultTtl()
            );

            // 7. 이메일 전송
            String inviteUrl = UriComponentsBuilder.fromUriString(frontendUrl)
                    .path("/invite/accept")
                    .queryParam("token", token)
                    .build()
                    .toUriString();

            emailService.sendInvitationEmail(targetUser.getEmail(), inviteUrl, team.getName(), inviter.getNickname());
        }
    }

    // ========================================================
    //  2. 초대 수락
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

        // 4. 초대 상태 수락으로 변경 (Invitation 테이블)
        invitation.setStatus(Status.ACCEPTED);
        invitationMapper.updateStatus(invitation);

        // 5. [핵심] 실제 멤버로 등록 (Status 없이 Role만 부여)
        // 여기서는 수락 과정이므로 검증보다는 등록(addMember)이 주 목적입니다.
        teamMemberService.addMember(invitation.getTeamId(), loginUserId, Role.MEMBER);

        // 6. Redis 정리
        redisUtil.deleteData(RedisKeyType.INVITATION.getKey(token));
    }

    // ========================================================
    //  3. 초대 거절
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
}