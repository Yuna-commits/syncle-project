package com.nullpointer.domain.member.service.impl;

import com.nullpointer.domain.member.dto.board.BoardInviteRequest;
import com.nullpointer.domain.member.dto.board.BoardMemberResponse;
import com.nullpointer.domain.member.dto.board.BoardRoleUpdateRequest;
import com.nullpointer.domain.member.mapper.BoardMemberMapper;
import com.nullpointer.domain.member.service.BoardMemberService;
import com.nullpointer.domain.member.vo.BoardMemberVo;
import lombok.Builder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Builder

public class BoardMemberServiceImpl implements BoardMemberService {
    private final BoardMemberMapper boardMemberMapper;

    @Override
    public void inviteBoardMember(BoardInviteRequest req) {
        for (Long userId : req.getUserIds()) {
            BoardMemberVo vo = BoardMemberVo.builder()
                    .boardId(req.getBoardId())
                    .userId(userId)
                    .role(req.getRole())
                    .build();

            boardMemberMapper.insertBoardMember(vo);
        }
    }

    @Override
    public List<BoardMemberResponse> getBoardMembers(Long teamId) {
        return boardMemberMapper.findMembersByBoardId(teamId);
    }

    @Override
    public void changeBoardRole(Long boardId, Long memberId, BoardRoleUpdateRequest req) {
        BoardMemberVo vo = req.toVo(boardId, memberId);
        boardMemberMapper.updateBoardRole(vo);
    }

    @Override
    public void deleteBoardMember(Long boardId, Long memberId) {
        boardMemberMapper.deleteBoardMember(boardId, memberId);
    }
}
