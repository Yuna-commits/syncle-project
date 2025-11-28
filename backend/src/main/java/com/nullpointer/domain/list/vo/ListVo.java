package com.nullpointer.domain.list.vo;

/**
 * list 테이블의 한 행(row)을 표현하는 VO 입니다.
 */
public class ListVo {

    private Long id;
    private Long boardId;
    private String title;
    // 정렬용 컬럼 (DB: order_index)
    private Integer orderIndex;

    public ListVo() {
    }

    public ListVo(Long id, Long boardId, String title, Integer orderIndex) {
        this.id = id;
        this.boardId = boardId;
        this.title = title;
        this.orderIndex = orderIndex;
    }

    public Long getId() {
        return id;
    }

    public Long getBoardId() {
        return boardId;
    }

    public String getTitle() {
        return title;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setBoardId(Long boardId) {
        this.boardId = boardId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }
}
