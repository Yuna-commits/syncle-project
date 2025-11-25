package com.nullpointer.domain.board.service.impl;

import com.nullpointer.domain.board.dto.request.CreateBoardRequest;
import com.nullpointer.domain.board.dto.request.UpdateBoardRequest;
import com.nullpointer.domain.board.dto.response.BoardDetailResponse;
import com.nullpointer.domain.board.dto.response.BoardResponse;
import com.nullpointer.domain.board.mapper.BoardMapper;
import com.nullpointer.domain.board.service.BoardService;
import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.domain.member.mapper.BoardMemberMapper;
import com.nullpointer.domain.member.vo.BoardMemberVo;
import com.nullpointer.domain.member.vo.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {

    private final BoardMapper boardMapper;
    private final BoardMemberMapper boardMemberMapper;

    @Override
    public void createBoard(Long teamId, CreateBoardRequest req, Long userId) {
        // 1. 보드 VO 생성 (DTO -> VO)
        BoardVo boardVo = BoardVo.builder()
                .title(req.getTitle())
                .teamId(teamId)
                .description(req.getDescription())
                .visibility(req.getVisibility())
                .build();

        boardMapper.insertBoard(boardVo);

        // 2. 방금 만든 보드 ID 가져오기
        Long createBoardId = boardVo.getId();

        // 3. 보드 멤버 VO 생성 (DTO -> VO)
        BoardMemberVo boardMemberVo = BoardMemberVo.builder()
                .boardId(createBoardId)
                .userId(userId)
                .role(Role.OWNER)
                .build();

        boardMemberMapper.insertBoardMember(boardMemberVo);
    }

    @Override
    public List<BoardResponse> getMyBoards(Long userId) {
        List<BoardVo> boards = boardMapper.findBoardByUserId(userId);
        return boards.stream().map(BoardResponse::from).toList();
    }

    @Override
    public List<BoardResponse> getTeamBoards(Long teamId) {
        List<BoardVo> boards = boardMapper.findBoardByTeamId(teamId);
        return boards.stream().map(BoardResponse::from).toList();
    }

    @Override
    public BoardDetailResponse getBoardDetail(Long boardId) {
        BoardVo vo = boardMapper.findBoardByBoardId(boardId);
        return BoardDetailResponse.from(vo);
    }

    @Override
    public void updateBoard(Long boardId, UpdateBoardRequest req, Long userId) {
        BoardVo vo = req.toVo(boardId);
        boardMapper.updateBoard(vo);
    }

    @Override
    public void deleteBoard(Long boardId, Long userId) {
        boardMapper.deleteBoard(boardId);
    }
}
