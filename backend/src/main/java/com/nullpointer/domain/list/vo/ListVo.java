package com.nullpointer.domain.list.vo;

/**
 * list 테이블의 한 행(row)을 표현하는 VO 입니다.
 */
public class ListVo {

    private Long id;
    private Long boardId;
    private String title;

    public ListVo() {
    }

    public ListVo(Long id, Long boardId, String title) {
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
