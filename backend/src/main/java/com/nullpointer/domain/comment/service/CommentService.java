package com.nullpointer.domain.comment.service;

import com.nullpointer.domain.comment.dto.CommentRequest;
import com.nullpointer.domain.comment.dto.CommentResponse;

import java.util.List;

public interface CommentService {
    
    // 댓글 조회
    List<CommentResponse> getComments(Long cardId, Long userId);

    // 댓글 생성
    CommentResponse createComment(Long cardId, Long userId, CommentRequest request);

    // 댓글 수정
    void updateComment(Long userId, Long commentId, String content);
    
    // 댓글 삭제
    void deleteComment(Long userId, Long commentId);
}
