package com.nullpointer.domain.board.controller;

import com.nullpointer.domain.activity.dto.request.ActivityConditionRequest;
import com.nullpointer.domain.activity.dto.response.ActivityLogResponse;
import com.nullpointer.domain.activity.dto.response.ActivityStatsResponse;
import com.nullpointer.domain.activity.service.ActivityService;
import com.nullpointer.domain.board.dto.request.CreateBoardRequest;
import com.nullpointer.domain.board.dto.request.UpdateBoardRequest;
import com.nullpointer.domain.board.dto.response.BoardDetailResponse;
import com.nullpointer.domain.board.dto.response.BoardResponse;
import com.nullpointer.domain.board.dto.response.BoardViewResponse;
import com.nullpointer.domain.board.dto.response.MemberBoardResponse;
import com.nullpointer.domain.board.service.BoardService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;
    private final ActivityService activityService;

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
        return ApiResponse.success(boardService.getTeamBoards(teamId, userId));
    }

    // 보드 상세 조회
    @GetMapping("/boards/{boardId}")
    public ApiResponse<BoardDetailResponse> getBoard(@PathVariable Long boardId,
                                                     @LoginUser Long userId) {
        return ApiResponse.success(boardService.getBoardDetail(boardId, userId));
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

    //소속 멤버 보드 조회
    @GetMapping("/teams/{teamId}/members/{memberId}/boards")
    public ApiResponse<List<MemberBoardResponse>> getMemberBoards(@PathVariable Long teamId,
                                                                  @PathVariable Long memberId,
                                                                  @LoginUser Long userId) {
        return ApiResponse.success(boardService.getMemberBoards(teamId, memberId, userId));
    }

    // 보드 활동 통계 조회
    @GetMapping("/boards/{boardId}/activities/stats")
    public ApiResponse<ActivityStatsResponse> getMyStats(@PathVariable Long boardId) {
        ActivityStatsResponse response
                = activityService.getStats(getCondition(boardId));
        return ApiResponse.success(response);
    }

    // 보드 활동 타임라인 조회
    @GetMapping("/boards/{boardId}/activities")
    public ApiResponse<List<ActivityLogResponse>> getMyActivities(
            @PathVariable Long boardId, @ModelAttribute ActivityConditionRequest condition) {
        condition.setBoardId(boardId);
        condition.setUserId(null);
        condition.setTeamId(null);

        List<ActivityLogResponse> response
                = activityService.getActivities(condition);

        return ApiResponse.success(response);
    }

    // 조회 조건 설정
    private ActivityConditionRequest getCondition(Long boardId) {
        return ActivityConditionRequest.builder()
                .boardId(boardId).build();
    }

    // 즐겨찾기 토글
    @PostMapping("/boards/{boardId}/favorite")
    public ApiResponse<String> toggleFavorite(@PathVariable Long boardId,
                                              @LoginUser Long userId) {
        boardService.toggleFavorite(boardId, userId);
        return ApiResponse.success("즐겨찾기 상태 변경 완료");
    }

    // 보드 (리스트+카드) 뷰 조회
    @GetMapping("/boards/{boardId}/view")
    public ApiResponse<BoardViewResponse> getBoardView(@PathVariable Long boardId, @LoginUser Long userId) {
        return ApiResponse.success(boardService.getBoardView(boardId, userId));
    }
}
