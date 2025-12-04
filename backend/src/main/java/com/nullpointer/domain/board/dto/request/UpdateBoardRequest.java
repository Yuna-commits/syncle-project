package com.nullpointer.domain.board.dto.request;

import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.domain.board.vo.enums.Visibility;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBoardRequest {

    @Size(max = 30, message = "보드 이름은 최대 30자까지 가능합니다.")
    private String title;

    @Size(max = 100, message = "설명은 최대 100자까지 가능합니다.")
    private String description;

    private Visibility visibility;

    public BoardVo toVo(Long boardId) {
        return BoardVo.builder()
                .id(boardId)
                .title(this.title)
                .description(this.description)
                .visibility(this.visibility)
                .build();
    }
}
