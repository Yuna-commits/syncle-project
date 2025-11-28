package com.nullpointer.domain.list.dto;

/**
 * 리스트 정보 수정 요청 DTO
 * - title : 새 리스트 제목
 * - role  : 이 요청을 하는 사용자의 역할 (OWNER 또는 MEMBER 만 허용)
 */
public class UpdateListRequest {

    private String title;
    private String role;

    public UpdateListRequest() {
    }

    public UpdateListRequest(String title, String role) {
        this.title = title;
        this.role = role;
    }

    public String getTitle() {
        return title;
    }

    public String getRole() {
        return role;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
