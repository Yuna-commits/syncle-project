package com.nullpointer.domain.board.service;

import com.nullpointer.domain.board.dto.request.CreateBoardRequest;
import com.nullpointer.domain.board.dto.request.UpdateBoardRequest;
import com.nullpointer.domain.board.dto.response.BoardDetailResponse;
import com.nullpointer.domain.board.dto.response.BoardResponse;
import com.nullpointer.domain.board.dto.response.BoardViewResponse;
import com.nullpointer.domain.board.dto.response.MemberBoardResponse;

import java.util.List;

public interface BoardService {

    // 보드 생성
    void createBoard(Long teamId, CreateBoardRequest req, Long userId);

    // 기본 보드 생성
    void createDefaultBoard(Long teamId, Long userId);

    // 내 보드 조회
    List<BoardResponse> getMyBoards(Long userId);

    // 팀 보드 조회
    List<BoardResponse> getTeamBoards(Long teamId, Long userId);

    // 보드 상세 조회
    BoardDetailResponse getBoardDetail(Long boardId, Long userId);

    // 보드 정보 수정
    void updateBoard(Long boardId, UpdateBoardRequest req, Long userId);

    // 보드 삭제
    void deleteBoard(Long boardId, Long userId);

    //소속 멤버 보드 조회
    List<MemberBoardResponse> getMemberBoards(Long teamId, Long memberId, Long userId);

    // 즐겨찾기 토글
    void toggleFavorite(Long boardId, Long userId);

    // 보드(리스트 + 카드 + 멤버) 조회
    BoardViewResponse getBoardView(Long boardId, Long userId);
}
