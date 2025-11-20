package com.nullpointer.domain.board.controller;

import com.nullpointer.domain.board.dto.BoardResponse;
import com.nullpointer.domain.board.dto.CreateBoardRequest;
import com.nullpointer.domain.board.service.BoardService;
import com.nullpointer.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
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
                                           @RequestBody CreateBoardRequest req) {
        boardService.createBoard(teamId, req);
        return ApiResponse.success("보드 추가 성공");
    }

    // 내 보드 조회
    @GetMapping("/boards/{userId}")
    public ApiResponse<List<BoardResponse>> getAllBoards(@PathVariable Long userId) {
        return ApiResponse.success(boardService.getMyBoards(userId));
    }
}
