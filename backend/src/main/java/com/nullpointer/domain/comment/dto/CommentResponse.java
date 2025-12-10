package com.nullpointer.domain.comment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    // 댓글 기본 정보
    private Long id;
    private Long cardId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 작성자 정보 (JOIN해서 가져올 데이터)
    private Long writerId;
    private String writerName;       // nickname
    private String writerProfileImg; // profile_img
    private String writerEmail;      // email
}