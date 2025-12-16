package com.nullpointer.domain.notification.event;

import com.nullpointer.domain.card.vo.enums.Priority;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Builder
public class CardEvent {
    private Long cardId;
    private String cardTitle;
    private Long boardId;

    private Long listId; // 카드가 속한/이동한 리스트 id
    private String listTitle;

    private Long actorId; // 행동한 사람
    private String actorNickname; // 행동한 사람의 닉네임
    private String actorProfileImg;

    private Long assigneeId; // 카드 담당자 (기본 수신자)

    private Boolean isComplete; // 완료 여부
    private Priority priority; // 중요도
    private LocalDateTime dueDate; // 마감일

    private String commentContent; // 댓글
    private Long commentId;
    private Long targetUserId; // 타겟 수신자 id (답글, 멘션용)

    private String checklistContent; // 체크리스트 내용
    private Boolean checklistDone; // 완료 여부

    // 변경된 속성 목록
    private Set<String> changedFields;

    private EventType eventType;

    public enum EventType {
        ASSIGNED,
        MOVED,
        UPDATED,
        COMMENT,
        REPLY,
        MENTION,
        CHECKLIST,
        DEADLINE_NEAR
    }
}
