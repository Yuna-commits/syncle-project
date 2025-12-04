package com.nullpointer.domain.list.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateListOrderRequest {
    private Long listId;
    private Integer orderIndex;

}
