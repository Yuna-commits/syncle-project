package com.nullpointer.domain.card.mapper;

import com.nullpointer.domain.card.vo.CardVo;
import org.apache.ibatis.annotations.Mapper;

/**
 * card 테이블과 통신하는 MyBatis Mapper
 */
@Mapper
public interface CardMapper {

    void insertCard(CardVo cardVo);
}
