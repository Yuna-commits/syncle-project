package com.nullpointer.domain.board.controller;

import com.nullpointer.domain.board.dto.request.UpdateBoardRequest;
import com.nullpointer.domain.board.dto.response.BoardDetailResponse;
import com.nullpointer.domain.board.dto.response.BoardResponse;
import com.nullpointer.domain.board.dto.request.CreateBoardRequest;
import com.nullpointer.domain.board.service.BoardService;
import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import com.nullpointer.global.security.jwt.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor

public class BoardController {

    private final BoardService boardService;

    // 보드 생성
    @PostMapping("/teams/{teamId}/boards")
    public ApiResponse<String> createBoard(@PathVariable Long teamId,
                                           @Valid @RequestBody CreateBoardRequest req,
                                           @LoginUser Long userId) {
        boardService.createBoard(teamId, req, userId);
        return ApiResponse.success("보드 추가 성공");
    }

    // 내 보드 조회
    @GetMapping("/boards/me")
    public ApiResponse<List<BoardResponse>> getMyBoards(@LoginUser Long userId) {
        return ApiResponse.success(boardService.getMyBoards(userId));
    }

    // 팀 보드 조회
    @GetMapping("/teams/{teamId}/boards")
    public ApiResponse<List<BoardResponse>> getTeamBoards(@PathVariable Long teamId,
                                                          @LoginUser Long userId) {
        return ApiResponse.success(boardService.getTeamBoards(teamId));
    }

    // 보드 상세 조회
    @GetMapping("/boards/{boardId}")
    public ApiResponse<BoardDetailResponse> getBoard(@PathVariable Long boardId) {
        return ApiResponse.success(boardService.getBoardDetail(boardId));
    }

    // 보드 정보 수정
    @PatchMapping("/boards/{boardId}")
    public ApiResponse<String> updateBoard(@PathVariable Long boardId,
                                           @Valid @RequestBody UpdateBoardRequest req,
                                           @LoginUser Long userId) {
        boardService.updateBoard(boardId, req, userId);
        return ApiResponse.success("보드 정보 수정 완료");
    }

    // 보드 삭제
    @DeleteMapping("/boards/{boardId}")
    public ApiResponse<String> deleteBoard(@PathVariable Long boardId,
                                           @LoginUser Long userId) {
        boardService.deleteBoard(boardId, userId);
        return ApiResponse.success("보드 삭제 성공");
    }

}
