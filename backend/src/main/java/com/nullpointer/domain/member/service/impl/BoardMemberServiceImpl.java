package com.nullpointer.domain.member.service.impl;

import com.nullpointer.domain.activity.dto.request.ActivitySaveRequest;
import com.nullpointer.domain.activity.service.ActivityService;
import com.nullpointer.domain.activity.vo.enums.ActivityType;
import com.nullpointer.domain.board.mapper.BoardMapper;
import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.domain.member.dto.board.BoardInviteRequest;
import com.nullpointer.domain.member.dto.board.BoardMemberResponse;
import com.nullpointer.domain.member.dto.board.BoardRoleUpdateRequest;
import com.nullpointer.domain.member.mapper.BoardMemberMapper;
import com.nullpointer.domain.member.service.BoardMemberService;
import com.nullpointer.domain.member.vo.BoardMemberVo;
import com.nullpointer.domain.member.vo.enums.Role;
import com.nullpointer.domain.notification.event.InvitationEvent;
import com.nullpointer.domain.notification.vo.enums.NotificationType;
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

    /**
     * 보드 멤버 관리 권한
     * - 보드 멤버 초대/추방/권한 변경 - OWNER만 가능
     */

    @Override
    public void inviteBoardMember(Long boardId, BoardInviteRequest req, Long userId) {
        // 1. 요청자가 초대 권한(OWNER)이 있는지 확인
        memberVal.validateBoardManager(boardId, userId);

        // 알림용 보드, 초대자 정보 조회
        BoardVo board = boardMapper.findBoardByBoardId(boardId);
        UserVo inviter = userMapper.findById(userId).orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (board == null) {
            throw new BusinessException(ErrorCode.BOARD_NOT_FOUND);
        }

        Long teamId = board.getTeamId();

        // refactor) for문 안에서 쿼리 사용 -> 한 번만 사용하여 일괄 처리되도록 변경
        List<Long> receiverIds = req.getUserIds();

        // 기존 맴버 이력 일괄 조회
        List<BoardMemberVo> histories = boardMemberMapper.findAllByBoardIdAndUserIdsIncludeDeleted(boardId, receiverIds);

        // Map 변환
        Map<Long, BoardMemberVo> historyMap = histories.stream()
                .collect(Collectors.toMap(BoardMemberVo::getUserId, vo -> vo));

        List<BoardMemberVo> toInsert = new ArrayList<>();
        List<Long> toRestore = new ArrayList<>();

        // 신규/복구/중복 분류
        for (Long receiverId : receiverIds) {
            BoardMemberVo existing = historyMap.get(receiverId);

            if (existing == null) {
                // 신규 멤버 -> INSERT
                toInsert.add(req.toVo(boardId, receiverId));
            } else if (existing.getDeletedAt() != null) {
                // 탈퇴 멤버 -> UPDATE
                toRestore.add(receiverId);
            } else {
                // 이미 활동 중인 멤버 -> 예외처리
                throw new BusinessException(ErrorCode.MEMBER_ALREADY_EXISTS);
            }

            publishInviteEvent(inviter, receiverId, board.getId(), board.getTitle());

            // 로그 저장
            inviteMemberLog(receiverId, userId, boardId, teamId);
        }

        // DB 저장/업데이트
        if (!toInsert.isEmpty()) {
            boardMemberMapper.insertBoardMembersBulk(toInsert);
        }

        if (!toRestore.isEmpty()) {
            boardMemberMapper.restoreMembersBulk(boardId, toRestore);
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
    public void changeBoardRole(Long boardId, Long memberId, BoardRoleUpdateRequest req, Long userId) {
        // 1. OWNER 권한 확인
        memberVal.validateBoardManager(boardId, userId);

        // 2. 멤버 존재 확인
        if (!boardMemberMapper.existsByBoardIdAndUserId(boardId, memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        // 로그 기록을 위해 보드 정보 조회하여 teamId 획득
        BoardVo board = boardMapper.findBoardByBoardId(boardId);
        Long teamId = (board != null) ? board.getTeamId() : null;

        BoardMemberVo vo = req.toVo(boardId, memberId);
        Role oldRole = vo.getRole();

        boardMemberMapper.updateBoardRole(vo);

        // 멤버 권한 변경 로그 저장
        changeRoleLog(teamId, boardId, memberId, userId, oldRole, req.getRole());

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "BOARD_MEMBER_UPDATED", userId, null);
    }

    @Override
    public void deleteBoardMember(Long boardId, Long memberId, Long userId) {
        Long ownerId = null;

        // 1. 멤버 존재 확인
        if (!boardMemberMapper.existsByBoardIdAndUserId(boardId, memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        // 2. 권한 확인 (본인 탈퇴 or OWNER의 추방)
        if (!userId.equals(memberId)) {
            // 강퇴시키는 경우 -> OWNER 권한 확인
            memberVal.validateBoardManager(boardId, userId);
            ownerId = userId;
        } else { // 본인 탈퇴인 경우 -> 보드에 OWNER 최소 한 명 이상 존재해야 함
            BoardMemberVo me = boardMemberMapper.findMember(boardId, userId);
            // 마지막 남은 OWNER인지 확인
            if (me.getRole() == Role.OWNER) {
                // 현재 보드의 OWNER 수 count
                long ownerCount = boardMemberMapper.countBoardOwner();
                if (ownerCount <= 1) {
                    throw new BusinessException(ErrorCode.LAST_OWNER_CANNOT_LEAVE);
                }
            }
        }

        boardMemberMapper.deleteBoardMember(boardId, memberId);

        // 탈퇴/강퇴 로그 저장
        kickMemberLog(boardId, memberId, ownerId);

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

    // [이벤트] 초대 이벤트 발행
    private void publishInviteEvent(UserVo sender, Long receiverId, Long targetId, String targetName) {
        InvitationEvent event = InvitationEvent.builder()
                .senderId(sender.getId())
                .senderNickname(sender.getNickname())
                .senderProfileImg(sender.getProfileImg())
                .receiverId(receiverId)
                .targetId(targetId)
                .targetName(targetName)
                .type(NotificationType.BOARD_INVITE)
                .build();

        publisher.publishEvent(event);
    }
}
