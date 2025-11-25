package com.nullpointer.domain.member.mapper;

import com.nullpointer.domain.member.dto.board.BoardMemberResponse;
import com.nullpointer.domain.member.vo.BoardMemberVo;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface BoardMemberMapper {

    // 보드 멤버 초대
    void insertBoardMember(BoardMemberVo boardMemberVo);

    // 보드 멤버 조회
    List<BoardMemberResponse> findMembersByBoardId(Long boardId);

    // 보드 역할 변경
    void updateBoardRole(BoardMemberVo boardMemberVo);

    // 보드 탈퇴
    void deleteBoardMember(@Param("boardId") Long boardId, @Param("userId") Long memberId);
}
