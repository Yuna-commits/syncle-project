package com.nullpointer.domain.board.mapper;


import com.nullpointer.domain.board.vo.BoardVo;

import java.util.List;

public interface BoardMapper {

    // 보드 추가하기
    void insertBoard(BoardVo board);

    // 내 보드 목록 조회
    List<BoardVo> findBoardById(Long user_id);

}
