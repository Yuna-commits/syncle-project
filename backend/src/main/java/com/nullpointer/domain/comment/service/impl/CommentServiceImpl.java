package com.nullpointer.domain.comment.service.impl;

import com.nullpointer.domain.comment.dto.CommentRequest;
import com.nullpointer.domain.comment.dto.CommentResponse;
import com.nullpointer.domain.comment.mapper.CommentMapper;
import com.nullpointer.domain.comment.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentMapper commentMapper;

    // 목록 조회
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long cardId, Long userId) {

        // 1. 전체 댓글 Flat List 조회
        List<CommentResponse> allComments = commentMapper.selectCommentsByCardId(cardId);

        // 2. 계층 구조로 변환
        List<CommentResponse> rootComments = new ArrayList<>();
        Map<Long, CommentResponse> map = new HashMap<>();

        // ID로 쉽게 찾기 위해 Map에 넣기
        for (CommentResponse c : allComments) {
            map.put(c.getId(), c);
            c.setReplies(new ArrayList<>()); // 리스트 초기화
        }

        // 부모-자식 연결
        for (CommentResponse c : allComments) {
            if (c.getParentId() != null) {
                // 부모가 있으면 부모의 replies에 추가
                CommentResponse parent = map.get(c.getParentId());
                if (parent != null) {
                    parent.getReplies().add(c);
                }
            } else {
                // 부모가 없으면 최상위(Root) 댓글
                rootComments.add(c);
            }
        }

        return rootComments; // 구조화된 리스트 반환
    }

    // 등록
    @Transactional
    public CommentResponse createComment(Long cardId, Long userId, CommentRequest request) {
        // 1. 작성자 ID, 카드 ID 주입
        request.setWriterId(userId);
        request.setCardId(cardId);

        // 2. 저장 (request객체에 id가 담김)
        commentMapper.insertComment(request);

        // 3. 저장된 데이터를 Full 정보(작성자 포함)로 다시 조회해서 리턴
        return commentMapper.selectCommentById(request.getId());
    }

    // 수정
    @Transactional
    public void updateComment(Long userId, Long commentId, String content) {
        // (옵션) 여기서 userId로 본인 확인 로직 추가 가능
        commentMapper.updateComment(commentId, content);
    }

    // 삭제
    @Transactional
    public void deleteComment(Long userId, Long commentId) {
        commentMapper.deleteComment(commentId);
    }
}