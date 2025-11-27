package com.nullpointer.domain.member.service.impl;

import com.nullpointer.domain.member.dto.board.BoardInviteRequest;
import com.nullpointer.domain.member.dto.board.BoardMemberResponse;
import com.nullpointer.domain.member.dto.board.BoardRoleUpdateRequest;
import com.nullpointer.domain.member.mapper.BoardMemberMapper;
import com.nullpointer.domain.member.service.BoardMemberService;
import com.nullpointer.domain.member.vo.BoardMemberVo;
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
    private final MemberValidator memberVal;

    @Override
    public void inviteBoardMember(Long boardId, BoardInviteRequest req, Long userId) {
        // 1. 요청자가 초대 권한(OWNER)이 있는지 확인
        memberVal.validateBoardOwner(boardId, userId, ErrorCode.MEMBER_INVITE_FORBIDDEN);

        for (Long targetUserId : req.getUserIds()) {
            // 2. 이미 존재하는 멤버인지 확인
            if (boardMemberMapper.existsByBoardIdAndUserId(boardId, targetUserId)) {
                throw new BusinessException(ErrorCode.MEMBER_ALREADY_EXISTS);
            }
            BoardMemberVo vo = req.toVo(boardId, targetUserId);
            boardMemberMapper.insertBoardMember(vo);
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
        if (!boardMemberMapper.existsByBoardIdAndUserId(boardId, memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }
        BoardMemberVo vo = req.toVo(boardId, memberId);
        boardMemberMapper.updateBoardRole(vo);
    }

    @Override
    public void deleteBoardMember(Long boardId, Long memberId, Long userId) {
        // 1. 멤버 존재 확인
        if (!boardMemberMapper.existsByBoardIdAndUserId(boardId, memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        // 2. 권한 확인 (본인 탈퇴 or OWNER의 추방)
        if (!userId.equals(memberId)) {
            memberVal.validateBoardOwner(boardId, userId, ErrorCode.MEMBER_DELETE_FORBIDDEN);
        }

        boardMemberMapper.deleteBoardMember(boardId, memberId);
    }

}
