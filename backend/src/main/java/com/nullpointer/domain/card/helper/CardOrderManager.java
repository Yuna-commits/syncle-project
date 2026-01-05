package com.nullpointer.domain.card.helper;

import com.nullpointer.domain.card.mapper.CardMapper;
import com.nullpointer.domain.card.vo.CardVo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CardOrderManager {

    private final CardMapper cardMapper;

    // 카드 순서 및 리스트 이동
    public void moveCardOrder(CardVo card, Long newListId, Integer newOrder) {
        Long oldListId = card.getListId();
        Integer oldOrder = card.getOrderIndex();

        if (oldListId.equals(newListId)) {
            // Case A: 같은 리스트 내 이동
            moveInSameList(oldListId, oldOrder, newOrder);
        } else {
            // Case B: 다른 리스트로 이동
            moveToDifferentList(oldListId, newListId, oldOrder, newOrder);
        }

        // 3. 대상 카드 정보 업데이트
        card.setListId(newListId);
        card.setOrderIndex(newOrder);
        cardMapper.updateCardLocation(card);
    }

    // 같은 리스트 내 이동
    private void moveInSameList(Long oldListId, Integer oldOrder, Integer newOrder) {
        if (oldOrder < newOrder) {
            // 아래로 이동: 사이의 카드들을 위로(-1) 당김
            cardMapper.updateOrderIndex(oldListId, oldOrder + 1, newOrder, -1);
        } else if (oldOrder > newOrder) {
            // 위로 이동: 사이의 카드들을 아래로(+1) 밈
            cardMapper.updateOrderIndex(oldListId, newOrder, oldOrder - 1, 1);
        }
    }

    // 다른 리스트로 이동
    private void moveToDifferentList(Long oldListId, Long newListId, Integer oldOrder, Integer newOrder) {
        // 기존 리스트 정리: 빠진 카드 뒤의 카드들을 당김(-1)
        cardMapper.updateOrderIndex(oldListId, oldOrder + 1, Integer.MAX_VALUE, -1);

        // 새 리스트 공간 확보: 들어갈 자리 뒤의 카드들을 밈(+1)
        cardMapper.updateOrderIndex(newListId, newOrder, Integer.MAX_VALUE, 1);
    }

}
