package com.nullpointer.domain.board.service.impl;

import com.nullpointer.domain.activity.dto.request.ActivitySaveRequest;
import com.nullpointer.domain.activity.service.ActivityService;
import com.nullpointer.domain.activity.vo.enums.ActivityType;
import com.nullpointer.domain.board.dto.request.CreateBoardRequest;
import com.nullpointer.domain.board.dto.request.UpdateBoardRequest;
import com.nullpointer.domain.board.dto.response.BoardDetailResponse;
import com.nullpointer.domain.board.dto.response.BoardResponse;
import com.nullpointer.domain.board.dto.response.MemberBoardResponse;
import com.nullpointer.domain.board.mapper.BoardMapper;
import com.nullpointer.domain.board.service.BoardService;
import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.domain.board.vo.enums.Visibility;
import com.nullpointer.domain.list.mapper.ListMapper;
import com.nullpointer.domain.list.vo.ListVo;
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

    private static final int MAX_BOARDS_PER_TEAM = 10;

    private final BoardMapper boardMapper;
    private final BoardMemberMapper boardMemberMapper;
    private final TeamValidator teamVal;
    private final MemberValidator memberVal;
    private final BoardValidator boardVal;
    private final ListMapper listMapper;
    private final ActivityService activityService;

    @Override
    @Transactional
    public void createBoard(Long teamId, CreateBoardRequest req, Long userId) {

        // 팀 유효성 확인
        teamVal.getValidTeam(teamId);

        // 팀 소속 여부 확인
        memberVal.validateTeamMember(teamId, userId);

        // 보드 개수 제한 체크 (팀당 최대 10개)
        int currentBoardCount = boardMapper.countBoardByTeamId(teamId);
        if (currentBoardCount >= MAX_BOARDS_PER_TEAM) {
            throw new BusinessException(ErrorCode.BOARD_LIMIT_EXCEEDED);
        }

        // 보드 VO 생성 (DTO -> VO)
        BoardVo boardVo = req.toVo(teamId);

        boardMapper.insertBoard(boardVo);

        // 보드 생성 로그 저장
        createBoardLog(userId, teamId, boardVo);

        // 방금 만든 보드 ID 가져오기
        Long createBoardId = boardVo.getId();

        // 보드 멤버 VO 생성 (DTO -> VO)
        BoardMemberVo boardMemberVo = BoardMemberVo.builder().boardId(createBoardId).userId(userId).role(Role.OWNER).build();

        boardMemberMapper.insertBoardMember(boardMemberVo);
    }

    @Override
    @Transactional
    public void createDefaultBoard(Long teamId, Long userId) {
        // 1. 기본 보드 생성
        BoardVo board = BoardVo.builder().teamId(teamId).title("기본 보드").description("자유롭게 일정을 관리해보세요.").visibility(Visibility.PRIVATE).build();

        boardMapper.insertBoard(board);

        // 보드 생성 로그 저장
        createBoardLog(userId, teamId, board);

        // 방금 만든 보드 ID 가져오기
        Long boardId = board.getId();

        // 2. 보드 멤버 연결
        BoardMemberVo boardMember = BoardMemberVo.builder().boardId(boardId).userId(userId).role(Role.OWNER).build();

        boardMemberMapper.insertBoardMember(boardMember);

        // 3. 기본 리스트 3개 생성
        listMapper.insertList(createDefaultList(boardId, "To Do", 1));
        listMapper.insertList(createDefaultList(boardId, "In Progress", 2));
        listMapper.insertList(createDefaultList(boardId, "Done", 3));
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

        // 3. 업데이트 진행
        if (req.getTitle() != null) {
            boardVo.setTitle(req.getTitle());
        }
        if (req.getDescription() != null) {
            boardVo.setDescription(req.getDescription());
        }
        if (boardVo.getVisibility() != req.getVisibility()) {
            boardVo.setVisibility(req.getVisibility());
        }

        boardMapper.updateBoard(boardVo);

        // 보드 수정 로그 저장
        updateBoardLog(userId, boardVo.getTeamId(), boardVo);
    }

    @Override
    @Transactional
    public void deleteBoard(Long boardId, Long userId) {
        // 1. 공통 검증 메서드로 보드 조회
        BoardVo boardVo = boardVal.getValidBoard(boardId);

        Long teamId = boardVo.getTeamId();
        String boardTitle = boardVo.getTitle();

        // 2. 권한 체크 (OWNER)
        memberVal.validateTeamOwner(boardId, userId, ErrorCode.BOARD_DELETE_FORBIDDEN);

        // 3. 삭제 진행
        boardMapper.deleteBoard(boardId);

        // 보드 삭제 로그 저장
        deleteBoardLog(userId, teamId, boardId, boardTitle);
    }

    private ListVo createDefaultList(Long boardId, String title, int orderIndex) {
        ListVo list = new ListVo();

        list.setBoardId(boardId);
        list.setTitle(title);
        list.setOrderIndex(orderIndex);

        return list;
    }

    //소속 멤버 보드 조회
    @Override
    public List<MemberBoardResponse> getMemberBoards(Long teamId, Long memberId, Long userId) {

        // 1. 권한 체크 (OWNER)
        memberVal.validateTeamOwner(teamId, userId, ErrorCode.TEAM_ACCESS_DENIED);
        List<BoardVo> boards = boardMapper.findMemberBoard(teamId, memberId);
        return boards.stream().map(MemberBoardResponse::from).toList();
    }

    /**
     * 보드 관리 로그
     */

    // 보드 생성 로그
    private void createBoardLog(Long userId, Long teamId, BoardVo board) {
        activityService.saveLog(ActivitySaveRequest.builder()
                .userId(userId)
                .teamId(teamId)
                .boardId(board.getId())
                .type(ActivityType.CREATE_BOARD)
                .targetId(board.getId())
                .targetName(board.getTitle())
                .description("보드가 생성되었습니다.")
                .build());
    }

    // 보드 수정 로그
    private void updateBoardLog(Long userId, Long teamId, BoardVo board) {
        activityService.saveLog(ActivitySaveRequest.builder()
                .userId(userId)
                .teamId(teamId)
                .boardId(board.getId())
                .type(ActivityType.UPDATE_BOARD)
                .targetId(board.getId())
                .targetName(board.getTitle())
                .description("보드 설정을 변경했습니다.")
                .build());
    }

    // 보드 삭제 로그
    private void deleteBoardLog(Long userId, Long teamId, Long boardId, String boardTitle) {
        activityService.saveLog(ActivitySaveRequest.builder()
                .userId(userId)
                .teamId(teamId)
                .boardId(boardId)
                .type(ActivityType.DELETE_BOARD)
                .targetId(boardId)
                .targetName(boardTitle)
                .description("보드를 삭제했습니다.")
                .build());
    }

}
