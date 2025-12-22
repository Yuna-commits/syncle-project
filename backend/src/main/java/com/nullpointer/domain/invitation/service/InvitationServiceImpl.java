package com.nullpointer.domain.invitation.service;

import com.nullpointer.domain.activity.dto.request.ActivitySaveRequest;
import com.nullpointer.domain.activity.service.ActivityService;
import com.nullpointer.domain.activity.vo.enums.ActivityType;
import com.nullpointer.domain.invitation.dto.MyInvitationResponse;
import com.nullpointer.domain.invitation.dto.TeamInvitationResponse;
import com.nullpointer.domain.invitation.dto.TeamInviteRequest;
import com.nullpointer.domain.invitation.mapper.InvitationMapper;
import com.nullpointer.domain.invitation.vo.InvitationVo;
import com.nullpointer.domain.invitation.vo.enums.Status;
import com.nullpointer.domain.member.mapper.BoardMemberMapper;
import com.nullpointer.domain.member.mapper.TeamMemberMapper;
import com.nullpointer.domain.member.service.TeamMemberService;
import com.nullpointer.domain.member.vo.BoardMemberVo;
import com.nullpointer.domain.member.vo.enums.Role;
import com.nullpointer.domain.notification.event.InvitationEvent;
import com.nullpointer.domain.notification.vo.enums.NotificationType;
import com.nullpointer.domain.team.mapper.TeamMapper;
import com.nullpointer.domain.team.vo.TeamVo;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.global.common.SocketSender;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.common.enums.RedisKeyType;
import com.nullpointer.global.email.EmailService;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.util.RedisUtil;
import com.nullpointer.global.validator.MemberValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
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
    private final EmailService emailService;
    private final TeamMapper teamMapper;
    private final UserMapper userMapper;
    private final RedisUtil redisUtil;
    private final MemberValidator memberValidator;
    private final ActivityService activityService;
    private final TeamMemberMapper teamMemberMapper;
    private final BoardMemberMapper boardMemberMapper;
    private final ApplicationEventPublisher publisher;
    private final SocketSender socketSender;

    @Value("${app.domain.frontend.url}")
    private String frontendUrl;

    // ========================================================
    //  초대 메일 발송
    // ========================================================
    @Override
    @Transactional
    public void sendInvitation(Long teamId, TeamInviteRequest req, Long inviterId) {
        // === 기본 검증 ===
        memberValidator.validateTeamOwner(teamId, inviterId, ErrorCode.MEMBER_INVITE_FORBIDDEN);

        TeamVo team = teamMapper.findTeamByTeamId(teamId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TEAM_NOT_FOUND));

        UserVo inviter = userMapper.findById(inviterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // refactor) for문 안에서 쿼리 사용 -> 한 번만 사용하여 일괄 처리되도록 변경
        List<Long> targetIds = req.getUserIds();

        // === 데이터 일괄 조회 ===
        // 1. 초대할 사용자 정보, ID 조회
        List<UserVo> receivers = userMapper.findAllByIds(targetIds);

        // 2. 이미 팀 멤버인 사용자 ID 조회
        List<Long> existingMemberIds = teamMemberMapper.findExistingMemberUserIds(teamId, targetIds);
        Set<Long> existingMemberSet = new HashSet<>(existingMemberIds);

        // 3. 이미 대기 중인 초대장이 있는 사용자 ID 조회
        List<Long> pendingInviteeIds = invitationMapper.findPendingInviteeIds(teamId, targetIds);
        Set<Long> pendingInviteeSet = new HashSet<>(pendingInviteeIds);

        // === 초대장 생성 ===
        List<InvitationVo> invitationsToInsert = new ArrayList<>();

        // 초대가 발송될 사용자 ID 목록 (이전 기록 삭제용)
        List<Long> finalTargetIds = new ArrayList<>();
        // 사용자 정보 조회용 {key: userId, value: UserVo}
        Map<Long, UserVo> receiverMap = new HashMap<>();

        for (UserVo receiver : receivers) {
            Long userId = receiver.getId();

            // 검증
            if (userId.equals(inviterId)) continue; // 본인 제외 초대
            if (existingMemberSet.contains(userId)) continue; // 이미 멤버인 경우
            if (pendingInviteeSet.contains(userId)) continue; // 이미 초대된 경우

            // 초대하는 멤버 ID 수집
            finalTargetIds.add(userId);
            receiverMap.put(userId, receiver);

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
        }

        // 대상이 없으면 종료
        if (invitationsToInsert.isEmpty()) return;

        // === DB 작업 ===
        // 새로 초대하는 인원들에 대해, 기존의 '만료됨(EXPIRED)' 또는 '거절됨(REJECTED)' 상태인 내역 삭제
        invitationMapper.deletePreviousInvitations(teamId, finalTargetIds);

        // DB에 한 번에 저장 (Bulk Insert)
        invitationMapper.insertInvitationsBulk(invitationsToInsert);

        // === 알림, 이메일 발송 ===
        for (InvitationVo invitation : invitationsToInsert) {
            // inviteeId로 Map에서 수신자 정보 꺼내기
            UserVo receiver = receiverMap.get(invitation.getInviteeId());

            if (receiver == null) continue;

            // Redis 저장
            redisUtil.setDataExpire(
                    RedisKeyType.INVITATION.getKey(invitation.getToken()),
                    String.valueOf(receiver.getId()),
                    RedisKeyType.INVITATION.getDefaultTtl()
            );

            // 이메일 전송
            String inviteUrl = UriComponentsBuilder.fromUriString(frontendUrl)
                    .path("/invite/accept")
                    .queryParam("token", invitation.getToken())
                    .build()
                    .toUriString();

            emailService.sendInvitationEmail(receiver.getEmail(), inviteUrl, team.getName(), inviter.getNickname());

            // [알림] 초대 알림 발송
            publishInviteEvent(inviter, receiver.getId(), team.getId(), team.getName(), invitation.getToken());
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

        // [알림] 초대 수락 알림 발송
        publishResponseEvent(invitation, NotificationType.INVITE_ACCEPTED);

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

        // [알림] 초대 거절 알림 발송
        publishResponseEvent(invitation, NotificationType.INVITE_REJECTED);

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

    @Override
    @Transactional
    public Long joinBoardByToken(String token, Long userId) {

        Object data = redisUtil.getData("board_invite:" + token);
        if (data == null) {
            throw new BusinessException(ErrorCode.INVITATION_NOT_FOUND);
        }

        Long boardId = Long.parseLong(data.toString());

        // 이미 멤버인지 확인
        if (boardMemberMapper.existsByBoardIdAndUserId(boardId, userId)) {
            throw new BusinessException(ErrorCode.MEMBER_ALREADY_EXISTS);
        }

        // VIEWER 권한으로 보드 멤버 등록
        BoardMemberVo member = BoardMemberVo.builder()
                .boardId(boardId)
                .userId(userId)
                .role(Role.VIEWER)
                .build();

        boardMemberMapper.insertBoardMember(member);

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "MEMBER_JOIN", userId, member);

        return boardId;
    }

    /**
     * Helper Methods
     */

    // [이벤트] 초대 이벤트 발행
    private void publishInviteEvent(UserVo sender, Long receiverId, Long targetId, String targetName, String token) {
        InvitationEvent event = InvitationEvent.builder()
                .senderId(sender.getId())
                .senderNickname(sender.getNickname())
                .senderProfileImg(sender.getProfileImg())
                .receiverId(receiverId)
                .targetId(targetId)
                .targetName(targetName)
                .type(NotificationType.TEAM_INVITE)
                .token(token)
                .build();

        publisher.publishEvent(event);
    }

    // [이벤트] 초대 응답 이벤트 발행
    private void publishResponseEvent(InvitationVo invitation, NotificationType type) {
        // 수락/거절한 사람 (현재 로그인한 사람)
        UserVo actor = userMapper.findById(invitation.getInviteeId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 알림을 받을 사람 (초대를 보낸 사람)
        Long receiverId = invitation.getInviterId();

        InvitationEvent event = InvitationEvent.builder()
                .senderId(actor.getId())
                .senderNickname(actor.getNickname())
                .senderProfileImg(actor.getProfileImg())
                .receiverId(receiverId)
                .targetId(invitation.getTeamId())
                .targetName(invitation.getTeamName())
                .type(type)
                .build();

        publisher.publishEvent(event);
    }
}