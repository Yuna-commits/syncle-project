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
    private Long assigneeId; // 담당자

    private Boolean isComplete; // 완료 여부
    private Priority priority; // 중요도
    private LocalDateTime dueDate; // 마감일

    // 변경된 속성 목록
    private Set<String> changedFields;

    private EventType eventType;

    public enum EventType {
        ASSIGNED, MOVED, UPDATED
    }
}
