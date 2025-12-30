package com.nullpointer.domain.comment.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
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
    private Boolean isWriterLeft;
    
    // 부모 ID 및 자식 댓글 리스트
    private Long parentId;
    @Builder.Default
    private List<CommentResponse> replies = new ArrayList<>();
}