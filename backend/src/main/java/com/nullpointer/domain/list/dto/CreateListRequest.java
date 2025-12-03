package com.nullpointer.domain.list.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 리스트 생성 요청 DTO
 * 예: { "title": "To Do" }
 */
@Setter
@Getter
public class CreateListRequest {

    private String title;

    public CreateListRequest(String title) {
        this.title = title;
    }

}
