package com.nullpointer.domain.list.service;

import com.nullpointer.domain.list.dto.CreateListRequest;
import com.nullpointer.domain.list.dto.ListResponse;

/**
 * 리스트 관련 비즈니스 로직 인터페이스
 */
public interface ListService {

    ListResponse createList(Long boardId, CreateListRequest request);
}
