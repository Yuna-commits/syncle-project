package com.nullpointer.domain.comment.controller;

import com.nullpointer.domain.comment.dto.CommentRequest;
import com.nullpointer.domain.comment.service.CommentService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Comment", description = "댓글 수정 및 삭제 API")
@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentManageController {

    private final CommentService commentService;
    
    // 댓글 수정
    @PatchMapping("/{commentId}")
    public ApiResponse<String> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommentRequest request,
            @LoginUser Long userId
    ) {
        commentService.updateComment(userId, commentId, request.getContent());
        return ApiResponse.success("댓글 수정 성공");
    }

    // 댓글 삭제
    @DeleteMapping("/{commentId}")
    public ApiResponse<String> deleteComment(
            @PathVariable Long commentId,
            @LoginUser Long userId
    ) {
        commentService.deleteComment(userId, commentId);
        return ApiResponse.success("댓글 삭제 성공");
    }
}
