package com.nullpointer.domain.card.mapper;

import com.nullpointer.domain.card.dto.CardResponse;
import com.nullpointer.domain.card.vo.CardVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * card 테이블과 통신하는 MyBatis Mapper
 */
@Mapper
public interface CardMapper {

    // 카드 생성
    void insertCard(CardVo cardVo);

    // 특정 리스트의 카드 목록 조회
    List<CardResponse> findCardsWithDetailsByListId(Long listId);

    CardResponse findCardDetailById(Long id);

    // 카드 이동
    void updateCardLocation(CardVo cardVo);

    // 카드 조회
    Optional<CardVo> findById(Long id);

    // 순서 재정렬
    void updateOrderIndex(@Param("listId") Long listId,
                          @Param("startOrder") int startOrder,
                          @Param("endOrder") int endOrder,
                          @Param("updateValue") int updateValue);

    // 카드 수정
    void updateCard(CardVo cardVo);

    // 카드 아카이브 토글
    void updateCardArchiveStatus(@Param("cardId") Long cardId, @Param("isArchived") boolean isArchived);

    // 카드 삭제
    void deleteCard(Long cardId);

    // 리스트 삭제 시 하위 데이터 일괄 삭제
    void deleteAllCardsByListId(Long listId);

    // 보드 삭제 시 하위 데이터 일괄 삭제
    void deleteAllCardsByBoardId(Long boardId);

    // 팀 삭제 시 하위 데이터 일괄 삭제
    void deleteAllCardsByTeamId(Long teamId);

    // 담당자 변경
    void updateCardAssignee(@Param("cardId") Long cardId, @Param("assigneeId") Long assineeId);

    // 마감일 초기화
    void deleteCardDates(Long cardId);

    // 우선순위 초기화
    void deleteCardPriority(Long cardId);

    // 라벨 초기화
    void deleteCardLabel(Long cardId);

    // 내 일정 조회(캘린더)
    List<CardResponse> findCardsByAssigneeIdAndFilters(Long userId, Long teamId, Long boardId);

    // 마감일 임박 카드 조회
    List<CardVo> findCardsDueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // 담당자 조회
    Long findAssigneeIdByCardId(Long cardId);
}
