package com.nullpointer.domain.list.mapper;

import com.nullpointer.domain.list.vo.ListVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

/**
 * list 테이블과 통신하는 MyBatis Mapper 인터페이스
 */
@Mapper
public interface ListMapper {

    // 리스트 1개 생성
    void insertList(ListVo listVo);

    // 리스트 1개에 담긴 정보 조회
    Optional<ListVo> findById(Long listId);

    // 특정 보드의 리스트 목록 조회
    List<ListVo> findByBoardId(@Param("boardId") Long boardId);

    // 리스트 순서 일괄 업데이트 (Bulk Update)
    void updateListOrdersBulk(List<ListVo> list);

    // 리스트 정보(title) 수정
    void updateListInfo(ListVo listVo);

    // 리스트 soft delete (deleted_at 업데이트)
    void softDeleteList(@Param("listId") Long listId);
}
