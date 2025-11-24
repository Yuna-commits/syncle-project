package com.nullpointer.domain.list.dto;

/**
 * 리스트 생성 요청 JSON 을 받는 DTO
 * 예: { "title": "To Do" }
 */
public class CreateListRequest {

    private String title;

    public CreateListRequest() {
    }

    public CreateListRequest(String title) {
        this.title = title;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
