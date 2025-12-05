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

    // 보드 멤버 조회(탈퇴 멤버 포함)
    BoardMemberVo findMemberIncludeDeleted(@Param("boardId") Long boardId, @Param("userId") Long memberId);

    // 보드 역할 변경
    void updateBoardRole(BoardMemberVo boardMemberVo);

    // 보드 탈퇴
    void deleteBoardMember(@Param("boardId") Long boardId, @Param("userId") Long memberId);

    // 중복 검사 및 존재 확인
    boolean existsByBoardIdAndUserId(@Param("boardId") Long boardId, @Param("userId") Long userId);

    // 권한 확인용 조회
    BoardMemberVo findMember(@Param("boardId") Long boardId, @Param("userId") Long userId);

    // 탈퇴 멤버 복구
    void restoreMember(@Param("boardId") Long boardId, @Param("userId") Long userId);

    // 보드 내 OWNER 수 count
    long countBoardOwner();

    // 보드 권한 체크
    boolean hasAccessToBoard(Long boardId, Long userId);

}
