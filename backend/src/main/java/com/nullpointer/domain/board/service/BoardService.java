package com.nullpointer.domain.board.service;

import com.nullpointer.domain.board.dto.request.UpdateBoardRequest;
import com.nullpointer.domain.board.dto.response.BoardDetailResponse;
import com.nullpointer.domain.board.dto.response.BoardResponse;
import com.nullpointer.domain.board.dto.request.CreateBoardRequest;
import com.nullpointer.domain.board.vo.BoardVo;

import java.util.List;

public interface BoardService {

    // 보드 생성
    void createBoard(Long teamId, CreateBoardRequest req, Long userId);

    // 내 보드 조회
    List<BoardResponse> getMyBoards(Long userId);

    // 팀 보드 조회
    List<BoardResponse> getTeamBoards(Long teamId);

    // 보드 상세 조회
    BoardDetailResponse getBoardDetail(Long boardId);

    // 보드 정보 수정
    void updateBoard(Long boardId, UpdateBoardRequest req, Long userId);

    // 보드 삭제
    void deleteBoard(Long boardId, Long userId);

}
