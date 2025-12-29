package com.nullpointer.domain.member.mapper;

import com.nullpointer.domain.member.dto.board.BoardMemberResponse;
import com.nullpointer.domain.member.vo.BoardMemberVo;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface BoardMemberMapper {

    // 보드 멤버 초대
    void insertBoardMember(BoardMemberVo boardMemberVo);

    // 보드 멤버 일괄 초대
    void insertBoardMembersBulk(@Param("list") List<BoardMemberVo> boardMemberVos);

    // 보드 멤버 id 조회
    List<Long> findAllMemberIdsByBoardId(@Param("boardId") Long boardId);

    // 보드 멤버 조회
    List<BoardMemberResponse> findMembersByBoardId(Long boardId);

    // 보드 멤버 일괄 조회(탈퇴 멤버 포함)
    List<BoardMemberVo> findAllByBoardIdAndUserIdsIncludeDeleted(@Param("boardId") Long boardId, @Param("userIds") List<Long> userIds);

    // 보드 역할 변경
    void updateBoardRole(BoardMemberVo boardMemberVo);

    // 보드 탈퇴
    void deleteBoardMember(@Param("boardId") Long boardId, @Param("userId") Long memberId);

    // 팀 탈퇴 시 보드 탈퇴
    void deleteByTeamIdAndUserId(@Param("teamId") Long teamId, @Param("userId") Long userId);

    // 중복 검사 및 존재 확인
    boolean existsByBoardIdAndUserId(@Param("boardId") Long boardId, @Param("userId") Long userId);

    // 권한 확인용 조회
    BoardMemberVo findMember(@Param("boardId") Long boardId, @Param("userId") Long userId);

    // 탈퇴 멤버 일괄 복구
    void restoreMembersBulk(@Param("boardId") Long boardId, @Param("userIds") List<Long> userIds);

    // 보드 권한 체크
    boolean hasAccessToBoard(Long boardId, Long userId);

}
