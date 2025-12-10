package com.nullpointer.domain.comment.controller;

import com.nullpointer.domain.comment.dto.CommentRequest;
import com.nullpointer.domain.comment.dto.CommentResponse;
import com.nullpointer.domain.comment.service.CommentService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards/{cardId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public ApiResponse<List<CommentResponse>> getComments(@PathVariable Long cardId,
                                                          @LoginUser Long userId) {
        return ApiResponse.success(commentService.getComments(cardId, userId));
    }

    @PostMapping
    public ApiResponse<CommentResponse> createComment(
            @PathVariable Long cardId,
            @RequestBody CommentRequest request,
            @LoginUser Long userId
    ) {
        return ApiResponse.success(commentService.createComment(cardId, userId, request));
    }

}