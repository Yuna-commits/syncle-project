package com.nullpointer.domain.list.mapper;

import com.nullpointer.domain.list.vo.ListVo;
import org.apache.ibatis.annotations.Mapper;

/**
 * list 테이블과 통신하는 MyBatis Mapper 인터페이스
 */
@Mapper
public interface ListMapper {

    void insertList(ListVo listVo);
}
