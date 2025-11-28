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

    // ---------------------- 공통 유틸 ----------------------

    /**
     * role 값이 OWNER 또는 MEMBER 인지 검증.
     * 아니면 IllegalArgumentException 던짐.
     */
    private void validateRole(String role) {
        if (role == null || (!"OWNER".equals(role) && !"MEMBER".equals(role))) {
            throw new IllegalArgumentException("role 은 OWNER 또는 MEMBER 만 가능합니다.");
        }
    }

    // ---------------------- 생성 ----------------------

    @Override
    @Transactional
    public ListResponse createList(Long boardId, CreateListRequest request) {
        ListVo listVo = new ListVo();
        listVo.setBoardId(boardId);
        listVo.setTitle(request.getTitle());
        listVo.setOrderIndex(0); // 처음 생성 시 0 (나중에 정렬 로직 추가 가능)

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
    public void updateListOrders(Long boardId, UpdateListOrderRequest request) {
        // 여러 리스트를 한 트랜잭션 안에서 업데이트
        for (UpdateListOrderRequest.ListOrderItem item : request.getLists()) {
            ListVo vo = new ListVo();
            vo.setId(item.getListId());
            vo.setBoardId(boardId);
            vo.setOrderIndex(item.getOrderIndex());

            listMapper.updateOrderIndex(vo);
        }
    }

    // ---------------------- 리스트 정보 수정 ----------------------

    @Override
    @Transactional
    public void updateList(Long listId, UpdateListRequest request) {
        // role 이 OWNER 또는 MEMBER 인지 검증
        validateRole(request.getRole());

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
