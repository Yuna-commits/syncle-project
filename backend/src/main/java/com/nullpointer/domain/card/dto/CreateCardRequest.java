package com.nullpointer.domain.card.dto;

/**
 * 카드 생성 요청 DTO
 *
 * 예) { "title": "API 구현", "description": "로그인까지" }
 */
public class CreateCardRequest {

    private String title;
    private String description;

    public CreateCardRequest() {
    }

    public CreateCardRequest(String title, String description) {
        this.title = title;
        this.description = description;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
