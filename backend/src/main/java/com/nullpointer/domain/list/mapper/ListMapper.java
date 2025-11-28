package com.nullpointer.domain.list.mapper;

import com.nullpointer.domain.list.vo.ListVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * list 테이블과 통신하는 MyBatis Mapper 인터페이스
 */
@Mapper
public interface ListMapper {

    // 리스트 1개 생성
    void insertList(ListVo listVo);

    // 특정 보드의 리스트 목록 조회
    List<ListVo> findByBoardId(@Param("boardId") Long boardId);

    // 리스트 한 개의 order_index 수정
    void updateOrderIndex(ListVo listVo);

    // 리스트 정보(title) 수정
    void updateListInfo(ListVo listVo);

    // 리스트 soft delete (deleted_at 업데이트)
    void softDeleteList(@Param("listId") Long listId);
}
