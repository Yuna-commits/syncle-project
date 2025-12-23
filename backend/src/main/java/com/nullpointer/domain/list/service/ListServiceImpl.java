package com.nullpointer.domain.list.service;

import com.nullpointer.domain.board.event.BoardEvent;
import com.nullpointer.domain.board.vo.BoardSettingVo;
import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.domain.list.dto.CreateListRequest;
import com.nullpointer.domain.list.dto.ListResponse;
import com.nullpointer.domain.list.dto.UpdateListOrderRequest;
import com.nullpointer.domain.list.dto.UpdateListRequest;
import com.nullpointer.domain.list.mapper.ListMapper;
import com.nullpointer.domain.list.vo.ListVo;
import com.nullpointer.domain.member.mapper.BoardMemberMapper;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.global.common.SocketSender;
import com.nullpointer.global.common.constants.AppConstants;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.validator.BoardValidator;
import com.nullpointer.global.validator.MemberValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 리스트 생성/조회/수정/삭제 로직 구현체
 */
@Service
@RequiredArgsConstructor
public class ListServiceImpl implements ListService {

    private final ListMapper listMapper;
    private final MemberValidator memberVal;
    private final SocketSender socketSender;
    private final ApplicationEventPublisher publisher;
    private final UserMapper userMapper;
    private final BoardValidator boardVal;
    private final BoardMemberMapper boardMemberMapper;

    /**
     * 리스트 권한
     * - 조회 -> VIEWER 이상
     * - 생성/수정/삭제/이동 -> MEMBER 이상
     */

    @Override
    @Transactional
    public ListResponse createList(Long boardId, CreateListRequest request, Long userId) {
        // 사용자 조회
        UserVo actor = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        BoardVo board = boardVal.getValidBoard(boardId);

        // 권한 확인 (보드 권한 설정에 따라)
        memberVal.validateBoardSetting(boardId, userId, BoardSettingVo::getListEditPermission);

        // 리스트 생성
        ListVo listVo = new ListVo();
        listVo.setBoardId(boardId);
        listVo.setTitle(request.getTitle());
        listVo.setOrderIndex(AppConstants.DEFAULT_ORDER_INDEX); // refactor) 하드코딩 대신 상수 클래스 사용

        listMapper.insertList(listVo);

        // [이벤트] 리스트 생성 이벤트 발행
        publishListEvent(actor, board, null, BoardEvent.EventType.CREATE_LIST, listVo);

        ListResponse response = ListResponse.builder()
                .id(listVo.getId())
                .boardId(listVo.getBoardId())
                .title(listVo.getTitle())
                .orderIndex(listVo.getOrderIndex())
                .build();

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "LIST_CREATE", userId, response);

        return response;
    }


    @Override
    @Transactional(readOnly = true)
    public List<ListResponse> getLists(Long boardId, Long userId) {
        // 권한 확인 - VIEWER 이상
        memberVal.validateBoardViewer(boardId, userId);

        List<ListVo> voList = listMapper.findByBoardId(boardId);

        List<ListResponse> responseList = new ArrayList<>();
        for (ListVo vo : voList) {
            responseList.add(ListResponse.builder().id(vo.getId()).boardId(vo.getBoardId()).title(vo.getTitle()).orderIndex(vo.getOrderIndex()).build());

        }

        return responseList;
    }

    @Override
    @Transactional
    public void updateListOrders(Long boardId, List<UpdateListOrderRequest> request, Long userId) {
        // 사용자 조회
        UserVo actor = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        BoardVo board = boardVal.getValidBoard(boardId);

        // 권한 확인 (보드 권한 설정에 따라)
        memberVal.validateBoardSetting(boardId, userId, BoardSettingVo::getListEditPermission);

        // 요청한 데이터를 변환
        List<ListVo> updateList = request.stream().map(item -> ListVo.builder().id(item.getListId()).boardId(boardId).orderIndex(item.getOrderIndex()).build()).toList();

        // 빈 리스트가 아닐 경우에만 업데이트 수행
        if (!updateList.isEmpty()) {
            listMapper.updateListOrdersBulk(updateList);
        }

        // [이벤트] 리스트 순서 수정 이벤트 발행
        // publishBoardEvent(actor, board, null, BoardEvent.EventType.UPDATE_LIST_ORDER, list);

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "LIST_MOVE", userId, request);
    }

    @Override
    @Transactional
    public void updateList(Long listId, UpdateListRequest request, Long userId) {
        // 리스트 존재 확인 & 보드 id 조회
        ListVo list = listMapper.findById(listId).orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));

        // 권한 확인 (보드 권한 설정에 따라)
        memberVal.validateBoardSetting(list.getBoardId(), userId, BoardSettingVo::getListEditPermission);

        // 업데이트
        listMapper.updateListInfo(ListVo.builder().id(listId).title(request.getTitle()).build());

        // 변경된 리스트 정보 저장
        Map<String, Object> data = new HashMap<>();
        data.put("id", listId);
        data.put("title", request.getTitle());

        // 소켓 전송
        socketSender.sendSocketMessage(list.getBoardId(), "LIST_UPDATE", userId, data);
    }

    @Override
    @Transactional
    public void updateArchiveStatus(Long listId, boolean isArchived, Long userId) {
        // 사용자 조회
        UserVo actor = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 리스트 존재 확인 & 보드 id 조회
        ListVo list = listMapper.findById(listId).orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));

        BoardVo board = boardVal.getValidBoard(list.getBoardId());

        // 권한 확인 (보드 권한 설정에 따라)
        memberVal.validateBoardSetting(list.getBoardId(), userId, BoardSettingVo::getListEditPermission);

        // 업데이트
        listMapper.updateListArchiveStatus(listId, isArchived);

        // [이벤트] 리스트 보관 이벤트 발행
        // publishListEvent(actor, board, null, BoardEvent.EventType.UPDATE_LIST, list);

        // 변경된 리스트 정보 저장
        Map<String, Object> data = new HashMap<>();
        data.put("id", listId);
        data.put("isArchived", isArchived);

        // 소켓 전송
        socketSender.sendSocketMessage(list.getBoardId(), "LIST_UPDATE", userId, data);
    }

    @Override
    @Transactional
    public void deleteList(Long listId, Long userId) {
        // 사용자 조회
        UserVo actor = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 리스트 존재 확인 & 보드 id 조회
        ListVo list = listMapper.findById(listId).orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));

        BoardVo board = boardVal.getValidBoard(list.getBoardId());

        // 권한 확인 (보드 권한 설정에 따라)
        memberVal.validateBoardSetting(list.getBoardId(), userId, BoardSettingVo::getListEditPermission);

        List<Long> memberIds = boardMemberMapper.findAllMemberIdsByBoardId(board.getId());

        // 삭제
        listMapper.softDeleteList(listId);

        // [이벤트] 리스트 삭제 이벤트 발행
        publishListEvent(actor, board, memberIds, BoardEvent.EventType.DELETE_LIST, list);

        // 삭제된 리스트 정보 저장
        Map<String, Object> data = new HashMap<>();
        data.put("id", listId);

        // 소켓 전송
        socketSender.sendSocketMessage(list.getBoardId(), "LIST_DELETE", userId, data);
    }

    /**
     * Helper Methods
     */

    // [이벤트] 보드 이벤트 발행
    private void publishListEvent(UserVo actor, BoardVo board, List<Long> memberIds, BoardEvent.EventType type, ListVo list) {
        BoardEvent event = BoardEvent.builder()
                .eventType(type)
                .boardId(board.getId())
                .teamId(board.getTeamId())
                .boardTitle(board.getTitle())
                .actorId(actor.getId())
                .actorNickname(actor.getNickname())
                .actorProfileImg(actor.getProfileImg())
                .targetMemberIds(memberIds)
                .listId(list.getId())
                .listTitle(list.getTitle())
                .build();

        publisher.publishEvent(event);
    }

}
