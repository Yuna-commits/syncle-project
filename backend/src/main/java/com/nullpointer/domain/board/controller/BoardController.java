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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Board", description = "보드 CRUD 및 설정 API")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;
    private final ActivityService activityService;

    // 보드 생성
    @Operation(summary = "보드 생성", description = "팀 내에 새로운 보드를 생성합니다.")
    @PostMapping("/teams/{teamId}/boards")
    public ApiResponse<String> createBoard(@PathVariable Long teamId,
                                           @Valid @RequestBody CreateBoardRequest req,
                                           @LoginUser Long userId) {
        boardService.createBoard(teamId, req, userId);
        return ApiResponse.success("보드 추가 성공");
    }

    // 내 보드 조회
    @Operation(summary = "내 보드 목록 조회", description = "내가 속한 모든 보드를 조회합니다.")
    @GetMapping("/boards/me")
    public ApiResponse<List<BoardResponse>> getMyBoards(@LoginUser Long userId) {
        return ApiResponse.success(boardService.getMyBoards(userId));
    }

    // 팀 보드 조회
    @Operation(summary = "팀 보드 목록 조회", description = "특정 팀에 소속된 보드 목록을 조회합니다.")
    @GetMapping("/teams/{teamId}/boards")
    public ApiResponse<List<BoardResponse>> getTeamBoards(@PathVariable Long teamId,
                                                          @LoginUser Long userId) {
        return ApiResponse.success(boardService.getTeamBoards(teamId, userId));
    }

    // 보드 검색 API
    @Operation(summary = "공개 보드 검색", description = "전체 공개된 보드를 검색합니다.")
    @GetMapping("/boards/search")
    public ApiResponse<List<BoardResponse>> searchBoards(@RequestParam String keyword) {
        return ApiResponse.success(boardService.searchBoards(keyword));
    }

    // 보드 상세 조회
    @Operation(summary = "보드 상세 정보 조회", description = "보드 설정 정보를 조회합니다.")
    @GetMapping("/boards/{boardId}")
    public ApiResponse<BoardDetailResponse> getBoard(@PathVariable Long boardId,
                                                     @LoginUser Long userId) {
        return ApiResponse.success(boardService.getBoardDetail(boardId, userId));
    }

    // 보드 정보 수정
    @Operation(summary = "보드 정보 수정", description = "보드 제목, 설명, 공개 범위를 수정합니다.")
    @PatchMapping("/boards/{boardId}")
    public ApiResponse<String> updateBoard(@PathVariable Long boardId,
                                           @Valid @RequestBody UpdateBoardRequest req,
                                           @LoginUser Long userId) {
        boardService.updateBoard(boardId, req, userId);
        return ApiResponse.success("보드 정보 수정 완료");
    }

    // 보드 삭제
    @Operation(summary = "보드 삭제", description = "보드를 삭제합니다 (관리자 권한).")
    @DeleteMapping("/boards/{boardId}")
    public ApiResponse<String> deleteBoard(@PathVariable Long boardId,
                                           @LoginUser Long userId) {
        boardService.deleteBoard(boardId, userId);
        return ApiResponse.success("보드 삭제 성공");
    }

    //소속 멤버 보드 조회
    @Operation(summary = "멤버별 참여 보드 조회", description = "특정 멤버가 참여 중인 보드 목록을 조회합니다.")
    @GetMapping("/teams/{teamId}/members/{memberId}/boards")
    public ApiResponse<List<MemberBoardResponse>> getMemberBoards(@PathVariable Long teamId,
                                                                  @PathVariable Long memberId,
                                                                  @LoginUser Long userId) {
        return ApiResponse.success(boardService.getMemberBoards(teamId, memberId, userId));
    }

    // 보드 활동 통계 조회
    @Operation(summary = "보드 활동 통계 조회", description = "보드 내 활동 통계를 조회합니다.")
    @GetMapping("/boards/{boardId}/activities/stats")
    public ApiResponse<ActivityStatsResponse> getMyStats(@PathVariable Long boardId) {
        ActivityStatsResponse response
                = activityService.getStats(getCondition(boardId));
        return ApiResponse.success(response);
    }

    // 보드 활동 타임라인 조회
    @Operation(summary = "보드 활동 타임라인 조회", description = "보드 내 활동 로그를 조회합니다.")
    @GetMapping("/boards/{boardId}/activities")
    public ApiResponse<List<ActivityLogResponse>> getMyActivities(
            @PathVariable Long boardId, @ModelAttribute ActivityConditionRequest condition) {
        condition.setBoardId(boardId);
        condition.setUserId(null);
        condition.setTeamId(null);

//        List<ActivityLogResponse> response
//                = activityService.getActivities(condition);

        return ApiResponse.success(null);
    }

    // 조회 조건 설정
    private ActivityConditionRequest getCondition(Long boardId) {
        return ActivityConditionRequest.builder()
                .boardId(boardId).build();
    }

    // 즐겨찾기 토글
    @Operation(summary = "보드 즐겨찾기 토글", description = "보드를 즐겨찾기에 추가하거나 해제합니다.")
    @PostMapping("/boards/{boardId}/favorite")
    public ApiResponse<String> toggleFavorite(@PathVariable Long boardId,
                                              @LoginUser Long userId) {
        boardService.toggleFavorite(boardId, userId);
        return ApiResponse.success("즐겨찾기 상태 변경 완료");
    }

    // 보드 (리스트+카드) 뷰 조회
    @Operation(summary = "보드 전체 뷰 조회", description = "보드 화면에 필요한 리스트, 카드, 멤버 정보를 한 번에 조회합니다.")
    @GetMapping("/boards/{boardId}/view")
    public ApiResponse<BoardViewResponse> getBoardView(@PathVariable Long boardId, @LoginUser Long userId) {
        return ApiResponse.success(boardService.getBoardView(boardId, userId));
    }

    // 공유 링크 생성
    @Operation(summary = "보드 공유 링크 생성", description = "VIEWER 멤버 초대를 위한 공유 링크 생성")
    @PostMapping("/boards/{boardId}/share-link")
    public ApiResponse<String> generateShareLink(@PathVariable Long boardId, @LoginUser Long userId) {
        String token = boardService.createShareToken(boardId, userId);
        return ApiResponse.success(token);
    }


}