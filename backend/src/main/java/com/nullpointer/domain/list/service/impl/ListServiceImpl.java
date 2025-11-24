package com.nullpointer.domain.list.service.impl;

import com.nullpointer.domain.list.dto.CreateListRequest;
import com.nullpointer.domain.list.dto.ListResponse;
import com.nullpointer.domain.list.mapper.ListMapper;
import com.nullpointer.domain.list.service.ListService;
import com.nullpointer.domain.list.vo.ListVo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 리스트 생성 로직 구현체
 */
@Service
public class ListServiceImpl implements ListService {

    private final ListMapper listMapper;

    public ListServiceImpl(ListMapper listMapper) {
        this.listMapper = listMapper;
    }

    @Override
    @Transactional
    public ListResponse createList(Long boardId, CreateListRequest request) {
        // 1. DB에 넣을 VO 만들기
        ListVo listVo = new ListVo();
        listVo.setBoardId(boardId);
        listVo.setTitle(request.getTitle());

        // 2. INSERT 실행 (id 가 채워짐)
        listMapper.insertList(listVo);

        // 3. 응답 DTO 만들어서 반환
        ListResponse response = new ListResponse();
        response.setId(listVo.getId());
        response.setBoardId(listVo.getBoardId());
        response.setTitle(listVo.getTitle());

        return response;
    }
}
