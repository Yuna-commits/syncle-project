package com.nullpointer.domain.comment.service;

import com.nullpointer.domain.card.mapper.CardMapper;
import com.nullpointer.domain.card.vo.CardVo;
import com.nullpointer.domain.comment.dto.CommentRequest;
import com.nullpointer.domain.comment.dto.CommentResponse;
import com.nullpointer.domain.comment.mapper.CommentMapper;
import com.nullpointer.domain.comment.vo.CommentVo;
import com.nullpointer.domain.list.mapper.ListMapper;
import com.nullpointer.domain.list.vo.ListVo;
import com.nullpointer.domain.notification.event.CardEvent;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.global.common.SocketSender;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.util.MentionProcessor;
import com.nullpointer.global.validator.MemberValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentMapper commentMapper;
    private final CardMapper cardMapper;
    private final ListMapper listMapper;
    private final UserMapper userMapper;

    private final SocketSender socketSender;
    private final MemberValidator memberVal;

    private final MentionProcessor mentionProcessor;
    private final ApplicationEventPublisher publisher; // 이벤트 발행기


    // 목록 조회
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long cardId, Long userId) {
        // [권한 검증] VIEWER 이상
        validateCardAndPermission(cardId, userId, true);

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
        // [권한 검증] MEMBER 이상 & boardId 조회
        Long boardId = validateCardAndPermission((cardId), userId, false);

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

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "CHECKLIST_CREATE", userId, null);

        // [알림] 멘션/댓글/답글 알림 처리
        handleNotification(card, boardId, actor, request);

        // 저장된 데이터를 Full 정보(작성자 포함)로 다시 조회해서 리턴
        return commentMapper.selectCommentById(request.getId());
    }

    // 수정
    @Transactional
    public void updateComment(Long userId, Long commentId, String content) {
        // 댓글 조회
        CommentVo commentVo = commentMapper.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHECKLIST_NOT_FOUND));

        // [권한 검증] 본인 확인
        if (!commentVo.getWriterId().equals(userId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // [권한 검증] MEMBER 이상 & boardId 조회
        Long boardId = validateCardAndPermission(commentVo.getCardId(), userId, false);

        commentMapper.updateComment(commentId, content);

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "COMMENT_UPDATE", userId, null);
    }

    // 삭제
    @Transactional
    public void deleteComment(Long userId, Long commentId) {
        // 댓글 조회
        CommentVo commentVo = commentMapper.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHECKLIST_NOT_FOUND));

        // [권한 검증] 본인 확인
        if (!commentVo.getWriterId().equals(userId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // [권한 검증] MEMBER 이상 & boardId 조회
        Long boardId = validateCardAndPermission(commentVo.getCardId(), userId, false);

        commentMapper.deleteComment(commentId);

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "COMMENT_DELETE", userId, null);
    }

    /**
     * Helper Methods
     */

    // 카드 -> 리스트 -> 보드 순으로 id를 찾고 권한 검증
    private Long validateCardAndPermission(Long cardId, Long userId, boolean readOnly) {
        CardVo card = cardMapper.findById(cardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CARD_NOT_FOUND));

        ListVo list = listMapper.findById(card.getListId())
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));

        Long boardId = list.getBoardId();

        if (readOnly) {
            memberVal.validateBoardViewer(boardId, userId); // 조회 시 VIEWER 이상
        } else {
            memberVal.validateBoardEditor(boardId, userId); // 쓰기 시 MEMBER 이상
        }

        return boardId;
    }

    // 알림 처리 (멘션 + 댓글)
    private void handleNotification(CardVo card, Long boardId, UserVo actor, CommentRequest request) {
        // 멘션 파싱
        Set<Long> mentionedUserIds = mentionProcessor.parseMentions(request.getContent());

        // [멘션] 알림 발송
        for (Long targetId : mentionedUserIds) {
            if (targetId.equals(actor.getId())) continue; // 본인 제외

            publishCommentEvent(card, boardId, actor, request.getContent(),
                    CardEvent.EventType.MENTION, targetId);
        }

        // [댓글/답글] 알림 대상 결정
        Long primaryTargetId;
        CardEvent.EventType eventType;

        if (request.getParentId() != null) {
            // 답글인 경우 -> 원댓글 작성자
            eventType = CardEvent.EventType.REPLY;
            CommentVo parent = commentMapper.findById(request.getParentId()).orElse(null);
            primaryTargetId = (parent != null) ? parent.getWriterId() : null;
        } else {
            // 일단 댓글인 경우 -> 카드 담당자
            eventType = CardEvent.EventType.COMMENT;
            primaryTargetId = card.getAssigneeId();
        }

        // [댓글/답글] 알림 발송 (멘션된 사람이 아니고 본인이 아닐 때)
        if (primaryTargetId != null
                && !primaryTargetId.equals(actor.getId())
                && !mentionedUserIds.contains(primaryTargetId)) {
            publishCommentEvent(card, boardId, actor, request.getContent(), eventType, primaryTargetId);
        }
    }

    // [이벤트] 댓글 이벤트 발행
    private void publishCommentEvent(CardVo card, Long boardId, UserVo actor, String content, CardEvent.EventType type, Long targetUserId) {
        CardEvent event = CardEvent.builder()
                .cardId(card.getId())
                .cardTitle(card.getTitle())
                .boardId(boardId)
                .listId(card.getListId())
                .eventType(type) // COMMENT || REPLY || MENTION
                .commentContent(content)
                .actorId(actor.getId()) // 댓글 작성자
                .actorNickname(actor.getNickname())
                .actorProfileImg(actor.getProfileImg())
                .assigneeId(card.getAssigneeId()) // 담당자에게 알림
                .targetUserId(targetUserId) // 실제 알림 받을 대상
                .build();

        publisher.publishEvent(event);
    }

}