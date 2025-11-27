package com.nullpointer.domain.member.service;

import com.nullpointer.domain.member.dto.board.BoardInviteRequest;
import com.nullpointer.domain.member.dto.board.BoardMemberResponse;
import com.nullpointer.domain.member.dto.board.BoardRoleUpdateRequest;

import java.util.List;

public interface BoardMemberService {

    // 보드 멤버 초대
    void inviteBoardMember(Long boardId, BoardInviteRequest req, Long userId);

    // 보드 멤버 조회
    List<BoardMemberResponse> getBoardMembers(Long boardId);

    // 보드 역할 변경
    void changeBoardRole(Long boardId, Long memberId, BoardRoleUpdateRequest req, Long userId);

    // 보드 탈퇴
    void deleteBoardMember(Long boardId, Long memberId, Long userId);

}
