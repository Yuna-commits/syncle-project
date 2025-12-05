package com.nullpointer.domain.list.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 리스트 생성/조회 후 클라이언트에게 내려줄 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListResponse {

    private Long id;
    private Long boardId;
    private String title;
    private Integer orderIndex;
    
}
