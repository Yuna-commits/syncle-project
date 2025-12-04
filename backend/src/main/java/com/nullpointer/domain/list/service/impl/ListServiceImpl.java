package com.nullpointer.domain.list.service.impl;

import com.nullpointer.domain.list.dto.CreateListRequest;
import com.nullpointer.domain.list.dto.ListResponse;
import com.nullpointer.domain.list.dto.UpdateListOrderRequest;
import com.nullpointer.domain.list.dto.UpdateListRequest;
import com.nullpointer.domain.list.mapper.ListMapper;
import com.nullpointer.domain.list.service.ListService;
import com.nullpointer.domain.list.vo.ListVo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * 리스트 생성/조회/수정/삭제 로직 구현체
 */
@Service
public class ListServiceImpl implements ListService {

    private final ListMapper listMapper;

    public ListServiceImpl(ListMapper listMapper) {
        this.listMapper = listMapper;
    }

    // ---------------------- 생성 ----------------------

    @Override
    @Transactional
    public ListResponse createList(Long boardId, CreateListRequest request) {
        ListVo listVo = new ListVo();
        listVo.setBoardId(boardId);
        listVo.setTitle(request.getTitle());
        listVo.setOrderIndex(9999);

        listMapper.insertList(listVo);

        ListResponse response = new ListResponse();
        response.setId(listVo.getId());
        response.setBoardId(listVo.getBoardId());
        response.setTitle(listVo.getTitle());
        response.setOrderIndex(listVo.getOrderIndex());

        return response;
    }

    // ---------------------- 목록 조회 ----------------------

    @Override
    @Transactional(readOnly = true)
    public List<ListResponse> getLists(Long boardId) {
        List<ListVo> voList = listMapper.findByBoardId(boardId);

        List<ListResponse> responseList = new ArrayList<>();
        for (ListVo vo : voList) {
            ListResponse res = new ListResponse();
            res.setId(vo.getId());
            res.setBoardId(vo.getBoardId());
            res.setTitle(vo.getTitle());
            res.setOrderIndex(vo.getOrderIndex());
            responseList.add(res);
        }

        return responseList;
    }

    // ---------------------- 순서 변경 ----------------------

    @Override
    @Transactional
    public void updateListOrders(Long boardId, List<UpdateListOrderRequest> request) {
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

    // ---------------------- 리스트 정보 수정 ----------------------

    @Override
    @Transactional
    public void updateList(Long listId, UpdateListRequest request) {

        ListVo vo = new ListVo();
        vo.setId(listId);
        vo.setTitle(request.getTitle());

        listMapper.updateListInfo(vo);
    }

    // ---------------------- 리스트 삭제 (soft) ----------------------

    @Override
    @Transactional
    public void deleteList(Long listId) {
        listMapper.softDeleteList(listId);
    }
}
