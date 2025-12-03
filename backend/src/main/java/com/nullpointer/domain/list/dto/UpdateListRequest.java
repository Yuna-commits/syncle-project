package com.nullpointer.domain.list.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 리스트 정보 수정 요청 DTO
 * - title : 새 리스트 제목
 * - role  : 이 요청을 하는 사용자의 역할 (OWNER 또는 MEMBER 만 허용)
 */
@Setter
@Getter
public class UpdateListRequest {

    private String title;
    private String role;

    public UpdateListRequest(String title, String role) {
        this.title = title;
        this.role = role;
    }

}
