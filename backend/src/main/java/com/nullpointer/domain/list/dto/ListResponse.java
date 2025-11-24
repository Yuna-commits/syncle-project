package com.nullpointer.domain.list.dto;

/**
 * 리스트 생성 후 클라이언트에게 돌려주는 응답 DTO
 */
public class ListResponse {

    private Long id;
    private Long boardId;
    private String title;

    public ListResponse() {
    }

    public ListResponse(Long id, Long boardId, String title) {
        this.id = id;
        this.boardId = boardId;
        this.title = title;
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

    public void setId(Long id) {
        this.id = id;
    }

    public void setBoardId(Long boardId) {
        this.boardId = boardId;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
