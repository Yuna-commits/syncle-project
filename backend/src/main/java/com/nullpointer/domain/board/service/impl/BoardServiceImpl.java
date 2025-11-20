package com.nullpointer.domain.board.service.impl;

import com.nullpointer.domain.board.dto.BoardResponse;
import com.nullpointer.domain.board.dto.CreateBoardRequest;
import com.nullpointer.domain.board.mapper.BoardMapper;
import com.nullpointer.domain.board.service.BoardService;
import com.nullpointer.domain.board.vo.BoardVo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {

    private final BoardMapper boardMapper;

    @Override
    public void createBoard(Long teamId, CreateBoardRequest req) {
        // 1. DTO -> VO
        BoardVo board = BoardVo.builder()
                .title(req.getTitle())
                .teamId(teamId)
                .description(req.getDescription())
                .visibility(req.getVisibility())
                .build();

        boardMapper.insertBoard(board);
    }

    @Override
    public List<BoardResponse> getMyBoards(Long userId) {
        List<BoardVo> boards = boardMapper.findBoardById(userId);
        return boards.stream().map(BoardResponse::from).toList();
    }
}
