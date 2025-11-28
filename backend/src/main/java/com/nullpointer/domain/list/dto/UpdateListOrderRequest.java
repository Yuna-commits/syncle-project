package com.nullpointer.domain.list.dto;

import java.util.List;

/**
 * 여러 리스트의 order_index 를 한 번에 수정할 때 사용하는 요청 DTO
 *
 * 예:
 * {
 *   "lists": [
 *     { "listId": 10, "orderIndex": 0 },
 *     { "listId": 11, "orderIndex": 1 }
 *   ]
 * }
 */
public class UpdateListOrderRequest {

    private List<ListOrderItem> lists;

    public UpdateListOrderRequest() {
    }

    public UpdateListOrderRequest(List<ListOrderItem> lists) {
        this.lists = lists;
    }

    public List<ListOrderItem> getLists() {
        return lists;
    }

    public void setLists(List<ListOrderItem> lists) {
        this.lists = lists;
    }

    /**
     * 리스트 하나의 id + 새 orderIndex 를 담는 내부 클래스
     */
    public static class ListOrderItem {
        private Long listId;
        private Integer orderIndex;

        public ListOrderItem() {
        }

        public ListOrderItem(Long listId, Integer orderIndex) {
            this.listId = listId;
            this.orderIndex = orderIndex;
        }

        public Long getListId() {
            return listId;
        }

        public Integer getOrderIndex() {
            return orderIndex;
        }

        public void setListId(Long listId) {
            this.listId = listId;
        }

        public void setOrderIndex(Integer orderIndex) {
            this.orderIndex = orderIndex;
        }
    }
}
