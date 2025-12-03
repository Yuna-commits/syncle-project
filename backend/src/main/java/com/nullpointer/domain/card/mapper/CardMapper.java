package com.nullpointer.domain.card.mapper;

import com.nullpointer.domain.card.dto.CardResponse;
import com.nullpointer.domain.card.vo.CardVo;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * card 테이블과 통신하는 MyBatis Mapper
 */
@Mapper
public interface CardMapper {

    // 카드 생성
    void insertCard(CardVo cardVo);

    // 특정 리스트의 카드 목록 조회
    List<CardResponse> findCardsWithDetailsByListId(Long listId);
}
