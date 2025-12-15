package com.nullpointer.domain.comment.service.impl;

import com.nullpointer.domain.card.mapper.CardMapper;
import com.nullpointer.domain.card.vo.CardVo;
import com.nullpointer.domain.comment.dto.CommentRequest;
import com.nullpointer.domain.comment.dto.CommentResponse;
import com.nullpointer.domain.comment.mapper.CommentMapper;
import com.nullpointer.domain.comment.service.CommentService;
import com.nullpointer.domain.comment.vo.CommentVo;
import com.nullpointer.domain.notification.event.CardEvent;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.global.common.SocketSender;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.validator.CardValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
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
    private final CardMapper cardMapper;
    private final UserMapper userMapper;

    private final SocketSender socketSender;
    private final CardValidator cardVal;

    private final ApplicationEventPublisher publisher; // 이벤트 발행기

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
        // 작성자 ID, 카드 ID 주입
        request.setWriterId(userId);
        request.setCardId(cardId);

        // 저장 (request객체에 id가 담김)
        commentMapper.insertComment(request);

        // 알림 반환용 데이터 조회
        // 댓글 작성자 정보
        UserVo actor = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 카드 정보 (제목, 담당자, 보드 id)
        CardVo card = cardMapper.findById(cardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CARD_NOT_FOUND));

        Long boardId = cardVal.findBoardIdByCardId(cardId);

        // 기본 설정 (새 댓글인 경우)
        CardEvent.EventType eventType = CardEvent.EventType.COMMENT;
        Long targetUserId = null; // 일반 댓글은 카드 담당자에게만 알림

        // 댓글 타입 판별
        if (request.getParentId() != null) {
            // 답글인 경우 '원댓글 작성자'를 찾아서 알림 타겟으로 지정
            eventType = CardEvent.EventType.REPLY;
            CommentVo parentComment = commentMapper.findById(request.getParentId()).orElse(null);
            if (parentComment != null) {
                targetUserId = parentComment.getWriterId();
            }
        }

        // [이벤트] 댓글 알림 발행
        CardEvent event = CardEvent.builder()
                .cardId(cardId)
                .cardTitle(card.getTitle())
                .boardId(boardId)
                .listId(card.getListId())
                .eventType(eventType) // COMMENT || REPLY
                .commentContent(request.getContent())
                .actorId(actor.getId()) // 댓글 작성자
                .actorNickname(actor.getNickname())
                .actorProfileImg(actor.getProfileImg())
                .assigneeId(card.getAssigneeId()) // 담당자에게 알림
                .targetUserId(targetUserId) // !null이면 원댓글 작성자에게도 알림
                .build();

        publisher.publishEvent(event);

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "CHECKLIST_CREATE", userId, null);

        // 저장된 데이터를 Full 정보(작성자 포함)로 다시 조회해서 리턴
        return commentMapper.selectCommentById(request.getId());
    }

    // 수정
    @Transactional
    public void updateComment(Long userId, Long commentId, String content) {
        // 댓글 조회
        CommentVo commentVo = commentMapper.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHECKLIST_NOT_FOUND));

        commentMapper.updateComment(commentId, content);

        // 카드ID 조회
        Long boardId = cardVal.findBoardIdByCardId(commentVo.getCardId());

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "COMMENT_UPDATE", userId, null);
    }

    // 삭제
    @Transactional
    public void deleteComment(Long userId, Long commentId) {
        // 댓글 조회
        CommentVo commentVo = commentMapper.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHECKLIST_NOT_FOUND));

        commentMapper.deleteComment(commentId);

        // 카드ID 조회
        Long boardId = cardVal.findBoardIdByCardId(commentVo.getCardId());

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "COMMENT_DELETE", userId, null);
    }
}