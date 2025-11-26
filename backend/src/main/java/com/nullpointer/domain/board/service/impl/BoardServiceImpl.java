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
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.validator.board.BoardValidator;
import com.nullpointer.global.validator.member.MemberValidator;
import com.nullpointer.global.validator.team.TeamValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {

    private final BoardMapper boardMapper;
    private final BoardMemberMapper boardMemberMapper;
    private final TeamValidator teamVal;
    private final MemberValidator memberVal;
    private final BoardValidator boardVal;

    @Override
    @Transactional
    public void createBoard(Long teamId, CreateBoardRequest req, Long userId) {

        // 팀 유효성 확인
        teamVal.getValidTeam(teamId);

        // 팀 소속 여부 확인
        memberVal.validateTeamMember(teamId, userId);

        // 보드 개수 제한 체크 (팀당 최대 10개)
        int currentBoardCount = boardMapper.countBoardByTeamId(teamId);
        if (currentBoardCount >= 10) {
            throw new BusinessException(ErrorCode.BOARD_LIMIT_EXCEEDED);
        }

        // 보드 VO 생성 (DTO -> VO)
        BoardVo boardVo = req.toVo(teamId);

        boardMapper.insertBoard(boardVo);

        // 방금 만든 보드 ID 가져오기
        Long createBoardId = boardVo.getId();

        // 보드 멤버 VO 생성 (DTO -> VO)
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
    @Transactional(readOnly = true)
    public BoardDetailResponse getBoardDetail(Long boardId) {
        // 1. 공통 검증 메서드로 보드 조회
        BoardVo boardVo = boardVal.getValidBoard(boardId);
        return BoardDetailResponse.from(boardVo);
    }

    @Override
    @Transactional
    public void updateBoard(Long boardId, UpdateBoardRequest req, Long userId) {

        // 1. 공통 검증 메서드로 보드 조회
        BoardVo boardVo = boardVal.getValidBoard(boardId);

        // 2. 권한 체크 (OWNER)
        memberVal.validateTeamOwner(boardId, userId, ErrorCode.BOARD_UPDATE_FORBIDDEN);

        boardMapper.updateBoard(boardVo);
    }

    @Override
    @Transactional
    public void deleteBoard(Long boardId, Long userId) {
        // 1. 공통 검증 메서드로 보드 조회
        BoardVo boardVo = boardVal.getValidBoard(boardId);

        // 2. 권한 체크 (OWNER)
        memberVal.validateTeamOwner(boardId, userId, ErrorCode.BOARD_DELETE_FORBIDDEN);

        // 3. 삭제 진행
        boardMapper.deleteBoard(boardId);
    }

}
