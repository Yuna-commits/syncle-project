package com.nullpointer.domain.board.mapper;


import com.nullpointer.domain.board.dto.response.BoardResponse;
import com.nullpointer.domain.board.vo.BoardVo;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface BoardMapper {

    // 보드 추가하기
    void insertBoard(BoardVo boardVo);

    // 내 보드 목록 조회
    List<BoardVo> findBoardByUserId(Long userId);

    // 특정 팀 보드 목록 조회
    List<BoardResponse> findBoardWithFavoriteStatus(@Param("teamId") Long teamId, @Param("userId") Long userId);

    // 보드 상세 조회
    BoardVo findBoardByBoardId(Long boardId);

    // 보드 정보 수정
    void updateBoard(BoardVo boardVo);

    // 보드 삭제
    void deleteBoard(Long boardId);

    // 보드 개수 체크
    int countBoardByTeamId(Long teamId);

    //소속 멤버 보드 조회
    List<BoardVo> findMemberBoard(@Param("teamId") Long teamId, @Param("userId") Long memberId);

    // 즐겨찾기 관련 메서드
    int countFavorite(Long userId);

    boolean existsFavorite(@Param("boardId") Long boardId, @Param("userId") Long userId);

    void insertFavorite(@Param("boardId") Long boardId, @Param("userId") Long userId);

    void deleteFavorite(@Param("boardId") Long boardId, @Param("userId") Long userId);

}
