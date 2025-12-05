package com.nullpointer.domain.list.service.impl;

import com.nullpointer.domain.activity.dto.request.ActivitySaveRequest;
import com.nullpointer.domain.activity.service.ActivityService;
import com.nullpointer.domain.activity.vo.enums.ActivityType;
import com.nullpointer.domain.board.mapper.BoardMapper;
import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.domain.list.dto.CreateListRequest;
import com.nullpointer.domain.list.dto.ListResponse;
import com.nullpointer.domain.list.dto.UpdateListOrderRequest;
import com.nullpointer.domain.list.dto.UpdateListRequest;
import com.nullpointer.domain.list.mapper.ListMapper;
import com.nullpointer.domain.list.service.ListService;
import com.nullpointer.domain.list.vo.ListVo;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.validator.member.MemberValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * 리스트 생성/조회/수정/삭제 로직 구현체
 */
@Service
@RequiredArgsConstructor
public class ListServiceImpl implements ListService {

    private final ListMapper listMapper;
    private final MemberValidator memberVal;
    private final BoardMapper boardMapper;
    private final ActivityService activityService;

    /**
     * 리스트 권한
     * - 조회 -> VIEWER 이상
     * - 생성/수정/삭제/이동 -> MEMBER 이상
     */

    @Override
    @Transactional
    public ListResponse createList(Long boardId, CreateListRequest request, Long userId) {
        // 권한 확인 - MEMBER 이상
        memberVal.validateBoardEditor(boardId, userId);

        // 리스트 생성
        ListVo listVo = new ListVo();
        listVo.setBoardId(boardId);
        listVo.setTitle(request.getTitle());
        listVo.setOrderIndex(9999);

        listMapper.insertList(listVo);

        // 로그 저장
        saveActivityLog(userId, boardId, ActivityType.CREATE_LIST, listVo.getId(), listVo.getTitle(), "리스트를 생성했습니다.");

        return ListResponse.builder()
                .id(listVo.getId())
                .boardId(listVo.getBoardId())
                .title(listVo.getTitle())
                .orderIndex(listVo.getOrderIndex())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ListResponse> getLists(Long boardId, Long userId) {
        // 권한 확인 - VIEWER 이상
        memberVal.validateBoardViewer(boardId, userId);

        List<ListVo> voList = listMapper.findByBoardId(boardId);

        List<ListResponse> responseList = new ArrayList<>();
        for (ListVo vo : voList) {
            ListResponse res = ListResponse.builder()
                    .id(vo.getId())
                    .boardId(vo.getBoardId())
                    .title(vo.getTitle())
                    .orderIndex(vo.getOrderIndex())
                    .build();

            responseList.add(res);
        }

        return responseList;
    }

    @Override
    @Transactional
    public void updateListOrders(Long boardId, List<UpdateListOrderRequest> request, Long userId) {
        // 권한 확인 - MEMBER 이상 (순서 변경도 작업 권한 필요)
        memberVal.validateBoardEditor(boardId, userId);

        // 요청한 데이터를 변환
        List<ListVo> updateList = request.stream()
                .map(item -> ListVo.builder()
                        .id(item.getListId())
                        .boardId(boardId)
                        .orderIndex(item.getOrderIndex())
                        .build())
                .toList();

        // 빈 리스트가 아닐 경우에만 업데이트 수행
        if (!updateList.isEmpty()) {
            listMapper.updateListOrdersBulk(updateList);
        }
    }

    @Override
    @Transactional
    public void updateList(Long listId, UpdateListRequest request, Long userId) {
        // 리스트 존재 확인 & 보드 id 조회
        ListVo list = listMapper.findById(listId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));

        // 작업 권한 확인 -> VIEWER 불가
        memberVal.validateBoardEditor(list.getBoardId(), userId);

        // 업데이트
        listMapper.updateListInfo(ListVo.builder().id(listId).title(request.getTitle()).build());
    }

    @Override
    @Transactional
    public void deleteList(Long listId, Long userId) {
        // 리스트 존재 확인 & 보드 id 조회
        ListVo list = listMapper.findById(listId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));

        // 작업 권한 확인 -> VIEWER 불가
        memberVal.validateBoardEditor(list.getBoardId(), userId);

        // 삭제
        listMapper.softDeleteList(listId);

        // 로그 저장
        saveActivityLog(userId, list.getBoardId(), ActivityType.DELETE_LIST, listId, list.getTitle(), "리스트를 삭제했습니다.");
    }

    // 리스트 활동 로그 저장
    private void saveActivityLog(Long userId, Long boardId, ActivityType type, Long targetId, String targetName, String description) {
        // 팀 ID 조회를 위해 보드 정보 가져오기
        BoardVo board = boardMapper.findBoardByBoardId(boardId);
        Long teamId = (board != null) ? board.getTeamId() : null;

        activityService.saveLog(ActivitySaveRequest.builder()
                .userId(userId)
                .teamId(teamId)
                .boardId(boardId)
                .type(type)
                .targetId(targetId)
                .targetName(targetName)
                .description(description)
                .build());
    }
}
