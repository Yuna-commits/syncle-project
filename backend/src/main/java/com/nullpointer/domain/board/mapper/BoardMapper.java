package com.nullpointer.domain.board.mapper;


import com.nullpointer.domain.board.vo.BoardVo;

import java.util.List;

public interface BoardMapper {

    // 보드 추가하기
    void insertBoard(BoardVo boardVo);

    // 내 보드 목록 조회
    List<BoardVo> findBoardByUserId(Long user_id);

    // 특정 팀 보드 목록 조회
    List<BoardVo> findBoardByTeamId(Long team_id);

    // 보드 상세 조회
    BoardVo findBoardByBoardId(Long board_id);

    // 보드 정보 수정
    void updateBoard(BoardVo boardVo);

    // 보드 삭제
    void deleteBoard(Long boardId);
}
