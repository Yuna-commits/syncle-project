package com.nullpointer.domain.member.service.impl;

import com.nullpointer.domain.activity.dto.request.ActivitySaveRequest;
import com.nullpointer.domain.activity.service.ActivityService;
import com.nullpointer.domain.activity.vo.enums.ActivityType;
import com.nullpointer.domain.board.mapper.BoardMapper;
import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.domain.invitation.event.InvitationEvent;
import com.nullpointer.domain.member.dto.board.BoardInviteRequest;
import com.nullpointer.domain.member.dto.board.BoardMemberResponse;
import com.nullpointer.domain.member.dto.board.BoardRoleUpdateRequest;
import com.nullpointer.domain.member.event.MemberEvent;
import com.nullpointer.domain.member.mapper.BoardMemberMapper;
import com.nullpointer.domain.member.service.BoardMemberService;
import com.nullpointer.domain.member.vo.BoardMemberVo;
import com.nullpointer.domain.member.vo.enums.Role;
import com.nullpointer.domain.notification.vo.enums.NotificationType;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.global.common.SocketSender;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.util.RedisUtil;
import com.nullpointer.global.validator.MemberValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class BoardMemberServiceImpl implements BoardMemberService {

    private final BoardMemberMapper boardMemberMapper;
    private final BoardMapper boardMapper;
    private final UserMapper userMapper;
    private final MemberValidator memberVal;
    private final ActivityService activityService;
    private final SocketSender socketSender;
    private final ApplicationEventPublisher publisher;
    private final RedisUtil redisUtil;

    /**
     * 보드 멤버 관리 권한
     * - 보드 멤버 초대/추방/권한 변경 - OWNER만 가능
     */

    @Override
    public void inviteBoardMember(Long boardId, BoardInviteRequest req, Long userId) {
        // 1. 요청자가 초대 권한(OWNER)이 있는지 확인
        memberVal.validateBoardManager(boardId, userId);

        // 2. 알림용 보드, 초대자 정보 조회
        BoardVo board = boardMapper.findBoardByBoardId(boardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));

        Long teamId = board.getTeamId();

        UserVo inviter = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // refactor) for문 안에서 쿼리 사용 -> 한 번만 사용하여 일괄 처리되도록 변경
        List<Long> receiverIds = req.getUserIds();

        // 3. 기존 맴버 이력 일괄 조회 & Map 변환
        List<BoardMemberVo> histories = boardMemberMapper.findAllByBoardIdAndUserIdsIncludeDeleted(boardId, receiverIds);

        Map<Long, BoardMemberVo> historyMap = histories.stream()
                .collect(Collectors.toMap(BoardMemberVo::getUserId, vo -> vo));

        // 4. 신규/복구/중복 분류
        List<BoardMemberVo> toInsert = new ArrayList<>();
        List<Long> toRestore = new ArrayList<>();

        // 알림을 보낼 최종 대상 id 목록
        List<Long> finalTargetIds = new ArrayList<>();

        for (Long receiverId : receiverIds) {
            BoardMemberVo existing = historyMap.get(receiverId);

            if (existing == null) {
                // 신규 멤버 -> INSERT
                toInsert.add(req.toVo(boardId, receiverId));
                finalTargetIds.add(receiverId);
            } else if (existing.getDeletedAt() != null) {
                // 탈퇴 멤버 -> UPDATE
                toRestore.add(receiverId);
                finalTargetIds.add(receiverId);
            } else {
                // 이미 활동 중인 멤버 -> 예외처리
                throw new BusinessException(ErrorCode.MEMBER_ALREADY_EXISTS);
            }
        }

        // 5. DB 저장/업데이트
        if (!toInsert.isEmpty()) {
            boardMemberMapper.insertBoardMembersBulk(toInsert);
        }

        if (!toRestore.isEmpty()) {
            boardMemberMapper.restoreMembersBulk(boardId, toRestore);
        }

        // 알림 발송
        for (Long receiverId : finalTargetIds) {
            // [알림] 보드 멤버 초대 이벤트 발행
            publishBoardEvent(inviter, receiverId, board, NotificationType.BOARD_INVITE);
            // 로그 저장
            // inviteMemberLog(receiverId, userId, boardId, teamId);
        }

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "BOARD_MEMBER_INVITE", userId, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BoardMemberResponse> getBoardMembers(Long teamId) {
        return boardMemberMapper.findMembersByBoardId(teamId);
    }

    @Override
    public void changeBoardRole(Long boardId, Long targetId, BoardRoleUpdateRequest req, Long ownerId) {
        // 1. OWNER 권한 확인
        memberVal.validateBoardManager(boardId, ownerId);

        // 알림용 조회
        BoardVo board = boardMapper.findBoardByBoardId(boardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));
        UserVo owner = userMapper.findById(ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 2. 멤버 존재 확인
        if (!boardMemberMapper.existsByBoardIdAndUserId(boardId, targetId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        Role newRole = req.getRole();

        // 추가) OWNER 권한 위임 로직
        if (newRole == Role.OWNER) {
            // 1. 나(OWNER)를 MEMBER로 강등
            BoardMemberVo me = BoardMemberVo.builder()
                    .boardId(boardId)
                    .userId(ownerId)
                    .role(Role.MEMBER)
                    .build();

            boardMemberMapper.updateBoardRole(me);

            // 2. 대상(targetId)를 OWNER로 승격
            BoardMemberVo target = BoardMemberVo.builder()
                    .boardId(boardId)
                    .userId(targetId)
                    .role(Role.OWNER)
                    .build();

            boardMemberMapper.updateBoardRole(target);
        } else {
            // 일반적인 권한 변경 (MEMBER <-> VIEWER)
            if (ownerId.equals(targetId)) {
                throw new BusinessException(ErrorCode.OWNER_CANNOT_DOWNGRADE_SELF);
            }

            BoardMemberVo vo = req.toVo(boardId, targetId);
            boardMemberMapper.updateBoardRole(vo);
        }

        // 로그 기록을 위해 보드 정보 조회하여 teamId 획득
//        BoardVo board = boardMapper.findBoardByBoardId(boardId);
//        Long teamId = (board != null) ? board.getTeamId() : null;

        // 멤버 권한 변경 로그 저장
        // changeRoleLog(teamId, boardId, memberId, userId, oldRole, req.getRole());

        // [알림] 권한 변경 알림 발송
        publishRolChangeEvent(owner, targetId, board, req.getRole());

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "BOARD_MEMBER_UPDATED", ownerId, null);
    }

    @Override
    public void deleteBoardMember(Long boardId, Long memberId, Long userId) {
        BoardVo board = boardMapper.findBoardByBoardId(boardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));

        UserVo actor = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 1. 멤버 존재 확인
        if (!boardMemberMapper.existsByBoardIdAndUserId(boardId, memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        // 알림 대상, 타입 결정
        NotificationType notificationType;
        Long receiverId;

        // 2. 권한 확인 (본인 탈퇴 or OWNER의 추방)
        if (!userId.equals(memberId)) {
            // 강퇴시키는 경우 -> OWNER 권한 확인
            memberVal.validateBoardManager(boardId, userId);
            notificationType = NotificationType.BOARD_MEMBER_KICKED;
            receiverId = memberId; // 추방 대상에게 알림
        } else {
            // 본인 탈퇴인 경우
            BoardMemberVo me = boardMemberMapper.findMember(boardId, userId);
            // 본인이 OWNER이면 탈퇴 불가
            if (me.getRole() == Role.OWNER) {
                throw new BusinessException(ErrorCode.OWNER_MUST_TRANSFER_BEFORE_LEAVE);
            }
            notificationType = NotificationType.BOARD_MEMBER_LEFT;
            receiverId = findBoardOwnerId(boardId); // 관리자에게 알림
        }

        // DB 삭제 처리
        boardMemberMapper.deleteBoardMember(boardId, memberId);

        // 탈퇴/강퇴 로그 저장
        // kickMemberLog(boardId, memberId, ownerId);

        // [알림] 관리자/추방 대상에게 알림 발송
        publishBoardEvent(actor, receiverId, board, notificationType);

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "BOARD_MEMBER_DELETED", userId, null);
    }

    /**
     * 보드 멤버 관리 로그
     */
    // 팀 멤버 보드 초대 로그
    private void inviteMemberLog(Long targetUserId, Long ownerId, Long boardId, Long teamId) {
        UserVo targetUser = userMapper.findById(targetUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        activityService.saveLog(
                ActivitySaveRequest.builder()
                        .userId(ownerId)
                        .teamId(teamId)
                        .boardId(boardId)
                        .type(ActivityType.INVITE_MEMBER)
                        .targetId(targetUserId)
                        .targetName(targetUser.getNickname())
                        .description(targetUser.getNickname() + "님을 보드에 초대했습니다.")
                        .build());
    }

    // 보드 멤버 권한 변경 로그
    private void changeRoleLog(Long teamId, Long boardId, Long targetUserId, Long ownerId, Role oldRole, Role newRole) {
        UserVo targetUser = userMapper.findById(targetUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        activityService.saveLog(
                ActivitySaveRequest.builder()
                        .userId(ownerId) // 변경한 관리자 ID
                        .teamId(teamId)
                        .boardId(boardId)
                        .type(ActivityType.UPDATE_MEMBER_ROLE)
                        .targetId(targetUserId)
                        .targetName(targetUser.getNickname())
                        .description(String.format("권한을 %s -> %s (으)로 변경했습니다.", oldRole, newRole))
                        .build());
    }

    // 멤버 탈퇴/강퇴 로그
    private void kickMemberLog(Long boardId, Long targetUserId, Long ownerId) {
        UserVo targetUser = userMapper.findById(targetUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        activityService.saveLog(
                ActivitySaveRequest.builder()
                        .userId(ownerId != null ? ownerId : targetUserId) // 강퇴시킨 관리자 ID 또는 본인 ID
                        .teamId(null)
                        .boardId(boardId)
                        .type(ActivityType.KICK_MEMBER)
                        .targetId(targetUserId)
                        .targetName(targetUser.getNickname())
                        .description(targetUser.getNickname() + "님이 " + (ownerId != null ? "OWNER에 의해 팀에서 강퇴되었습니다." : "팀에서 탈퇴했습니다."))
                        .build());
    }

    /**
     * Helper Methods
     */

    // 보드 OWNER id 목록 조회
    private Long findBoardOwnerId(Long boardId) {
        return boardMemberMapper.findMembersByBoardId(boardId).stream()
                .filter(m -> m.getRole() == Role.OWNER)
                .map(BoardMemberResponse::getUserId)
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    // [이벤트] 멤버 초대/추방/탈퇴 이벤트 발행
    private void publishBoardEvent(UserVo sender, Long receiverId, BoardVo board, NotificationType type) {
        InvitationEvent event = InvitationEvent.builder()
                .senderId(sender.getId())
                .senderNickname(sender.getNickname())
                .senderProfileImg(sender.getProfileImg())
                .receiverId(receiverId)
                .targetId(board.getId())
                .targetName(board.getTitle())
                .type(type)
                .build();

        publisher.publishEvent(event);
    }

    // [이벤트] 권한 변경 이벤트 발행
    private void publishRolChangeEvent(UserVo sender, Long receiverId, BoardVo board, Role newRole) {
        MemberEvent event = MemberEvent.builder()
                .targetUserId(receiverId)
                .targetId(board.getId())
                .targetName(board.getTitle())
                .targetType(MemberEvent.TargetType.BOARD)
                .senderId(sender.getId())
                .senderNickname(sender.getNickname())
                .senderProfileImg(sender.getProfileImg())
                .newRole(newRole)
                .type(NotificationType.PERMISSION_CHANGED)
                .build();

        publisher.publishEvent(event);
    }
}
