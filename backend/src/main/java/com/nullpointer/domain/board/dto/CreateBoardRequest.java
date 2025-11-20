package com.nullpointer.domain.board.dto;

import com.nullpointer.domain.board.vo.enums.Visibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreateBoardRequest {
    @NotBlank(message = "보드 제목은 필수 입력 값입니다.")
    private String title;

    @Size(max = 100, message = "설명은 최대 100자까지 가능합니다.")
    private String description;

    private Visibility visibility;
}
