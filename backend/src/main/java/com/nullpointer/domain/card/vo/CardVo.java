package com.nullpointer.domain.card.vo;

/**
 * card 테이블 한 행(row)을 나타내는 VO
 */
public class CardVo {

    private Long id;
    private Long listId;
    private String title;
    private String description;

    public CardVo() {
    }

    public CardVo(Long id, Long listId, String title, String description) {
        this.id = id;
        this.listId = listId;
        this.title = title;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public Long getListId() {
        return listId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setListId(Long listId) {
        this.listId = listId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
