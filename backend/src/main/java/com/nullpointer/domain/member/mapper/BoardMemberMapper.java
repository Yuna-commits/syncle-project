package com.nullpointer.domain.member.mapper;

import com.nullpointer.domain.member.dto.board.BoardMemberResponse;
import com.nullpointer.domain.member.vo.BoardMemberVo;
import com.nullpointer.domain.member.vo.enums.Role;
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

    // 본인이 오너인 보드 ID 목록
    List<Long> findBoardIdsByOwnerId(Long userId);

    // 특정 보드의 멤버 수
    int countMembersByBoardId(Long boardId);

    // 특정 보드의 오너 id 조회
    Long findOwnerIdByBoardId(Long boardId);

    // 참여한 모든 보드 id 목록 조회
    List<Long> findBoardIdsByUserId(Long userId);

    // 회원 탈퇴 시 소속한 모든 보드 일괄 탈퇴
    void deleteAllByUserId(Long userId);

    // 팀 탈퇴 시 보드 탈퇴
    void deleteByTeamIdAndUserId(@Param("teamId") Long teamId, @Param("userId") Long userId);

    // 보드 삭제 시 보드 멤버 일괄 삭제
    void deleteAllMembersByBoardId(Long boardId);

    // 팀 삭제 시 보드 멤버 일괄 삭제
    void deleteAllMembersByTeamId(Long teamId);

    // 중복 검사 및 존재 확인
    boolean existsByBoardIdAndUserId(@Param("boardId") Long boardId, @Param("userId") Long userId);

    // 권한 확인용 조회
    BoardMemberVo findMember(@Param("boardId") Long boardId, @Param("userId") Long userId);

    // 탈퇴 멤버 일괄 복구
    void restoreMembersBulk(@Param("boardId") Long boardId, @Param("userIds") List<Long> userIds);

    // 탈퇴 멤버 1명 복구
    int restoreMember(@Param("boardId") Long boardId, @Param("userId") Long userId, @Param("role") Role role);

    // 보드 권한 체크
    boolean hasAccessToBoard(Long boardId, Long userId);

}
