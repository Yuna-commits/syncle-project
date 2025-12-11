package com.nullpointer.domain.comment.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CommentRequest {
    private Long id;
    private Long cardId;
    private Long writerId;
    private Long parentId;
    private String content;
}
