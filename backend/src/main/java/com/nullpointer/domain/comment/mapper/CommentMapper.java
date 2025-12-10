package com.nullpointer.domain.comment.mapper;

import com.nullpointer.domain.comment.dto.CommentRequest;
import com.nullpointer.domain.comment.dto.CommentResponse;
import com.nullpointer.domain.comment.vo.CommentVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface CommentMapper {
    // 댓글 목록 조회
    List<CommentResponse> selectCommentsByCardId(Long cardId);

    // 댓글 등록
    void insertComment(CommentRequest request);

    // 댓글 수정
    void updateComment(@Param("commentId") Long commentId, @Param("content") String content);

    // 댓글 삭제 (Soft Delete)
    void deleteComment(Long commentId);

    // 단건 조회 (저장 후 바로 반환할 때 필요)
    CommentResponse selectCommentById(Long id);
}