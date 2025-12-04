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
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.validator.member.MemberValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardMemberServiceImpl implements BoardMemberService {

    private final BoardMemberMapper boardMemberMapper;
    private final BoardMapper boardMapper;
    private final UserMapper userMapper;
    private final MemberValidator memberVal;
    private final ActivityService activityService;

    @Override
    public void inviteBoardMember(Long boardId, BoardInviteRequest req, Long userId) {
        // 1. 요청자가 초대 권한(OWNER)이 있는지 확인
        memberVal.validateBoardOwner(boardId, userId, ErrorCode.MEMBER_INVITE_FORBIDDEN);

        /**
         * TODO) 로그 로직 수정 필요
         */
        // 로그 저장을 위해 보드가 소속한 팀 id 필요
        BoardVo board = boardMapper.findBoardByBoardId(boardId);

        if (board == null) {
            throw new BusinessException(ErrorCode.BOARD_NOT_FOUND);
        }

        Long teamId = board.getTeamId();

        for (Long targetUserId : req.getUserIds()) {
            // 2. 기존 멤버 이력 조회 (탈퇴 멤버 포함)
            BoardMemberVo existingMember = boardMemberMapper.findMemberIncludeDeleted(boardId, targetUserId);

            if (existingMember == null) {
                // 신규 멤버 -> INSERT
                BoardMemberVo vo = req.toVo(boardId, targetUserId);
                boardMemberMapper.insertBoardMember(vo);
            } else if (existingMember.getDeletedAt() != null) {
                // 탈퇴 멤버 -> UPDATE (deleted_at = null)
                boardMemberMapper.restoreMember(boardId, targetUserId);
            } else {
                // 이미 활동 중인 멤버 -> 예외처리
                throw new BusinessException(ErrorCode.MEMBER_ALREADY_EXISTS);
            }

            // 팀 멤버 보드 초대 로그 저장
            inviteMemberLog(targetUserId, userId, boardId, teamId);
        }
    }

    @Override
    public List<BoardMemberResponse> getBoardMembers(Long teamId) {
        return boardMemberMapper.findMembersByBoardId(teamId);
    }

    @Override
    public void changeBoardRole(Long boardId, Long memberId, BoardRoleUpdateRequest req, Long userId) {
        // 1. 권한 확인
        memberVal.validateBoardOwner(boardId, userId, ErrorCode.MEMBER_UPDATE_FORBIDDEN);

        // 2. 멤버 존재 확인
        if (boardMemberMapper.existsByBoardIdAndUserId(boardId, memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }
        BoardMemberVo vo = req.toVo(boardId, memberId);
        Role oldRole = vo.getRole();

        boardMemberMapper.updateBoardRole(vo);

        // 멤버 권한 변경 로그 저장
        changeRoleLog(boardId, memberId, userId, oldRole, req.getRole());
    }

    @Override
    public void deleteBoardMember(Long boardId, Long memberId, Long userId) {
        Long ownerId = null;

        // 1. 멤버 존재 확인
        if (boardMemberMapper.existsByBoardIdAndUserId(boardId, memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        // 2. 권한 확인 (본인 탈퇴 or OWNER의 추방)
        if (!userId.equals(memberId)) {
            memberVal.validateBoardOwner(boardId, userId, ErrorCode.MEMBER_DELETE_FORBIDDEN);
            ownerId = userId;
        }

        boardMemberMapper.deleteBoardMember(boardId, memberId);

        // 탈퇴/강퇴 로그 저장
        kickMemberLog(boardId, memberId, ownerId);
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
    private void changeRoleLog(Long boardId, Long targetUserId, Long ownerId, Role oldRole, Role newRole) {
        UserVo targetUser = userMapper.findById(targetUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        activityService.saveLog(
                ActivitySaveRequest.builder()
                        .userId(ownerId) // 변경한 관리자 ID
                        .teamId(null)
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

}
