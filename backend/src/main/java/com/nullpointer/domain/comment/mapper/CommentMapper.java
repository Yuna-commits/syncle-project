package com.nullpointer.domain.comment.mapper;

import com.nullpointer.domain.comment.dto.CommentRequest;
import com.nullpointer.domain.comment.dto.CommentResponse;
import com.nullpointer.domain.comment.vo.CommentVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

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

    // 카드 삭제 시 하위 데이터 일괄 삭제
    void deleteAllCommentsByCardId(Long cardId);

    // 리스트 삭제 시 하위 데이터 일괄 삭제
    void deleteAllCommentsByListId(Long listId);

    // 보드 삭제 시 하위 데이터 일괄 삭제
    void deleteAllCommentsByBoardId(Long boardId);

    // 팀 삭제 시 하위 데이터 일괄 삭제
    void deleteAllCommentsByTeamId(Long teamId);

    // 단건 조회 (저장 후 바로 반환할 때 필요)
    CommentResponse selectCommentById(Long id);

    // 댓글 조회
    Optional<CommentVo> findById(Long commentId);
}