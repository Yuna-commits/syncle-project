package com.nullpointer.domain.list.dto;

/**
 * 리스트 생성/조회 후 클라이언트에게 내려줄 응답 DTO
 */
public class ListResponse {

    private Long id;
    private Long boardId;
    private String title;
    private Integer orderIndex;

    public ListResponse() {
    }

    public ListResponse(Long id, Long boardId, String title, Integer orderIndex) {
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
