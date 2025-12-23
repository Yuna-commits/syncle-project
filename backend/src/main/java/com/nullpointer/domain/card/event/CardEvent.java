package com.nullpointer.domain.card.event;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CardEvent {

    public enum EventType {
        CREATED, UPDATED, MOVED, DELETED,
        ASSIGNED, COMMENT, REPLY, MENTION,
        CHECKLIST, LABEL, ATTACHMENT,
        DEADLINE_NEAR,
    }

    // 필수 정보
    private EventType eventType;
    private Long cardId;
    private String cardTitle;
    private Long boardId;
    private Long teamId;

    // 행위자 정보
    private Long actorId; // 행동한 사람
    private String actorNickname; // 행동한 사람의 닉네임
    private String actorProfileImg;

    // 알림 타겟 정보
    private Long assigneeId; // 카드 담당자 (기본 수신자)
    private String assigneeNickname;
    private Long targetUserId; // 타겟 수신자 id (답글, 멘션용)

    // 상세 메시지 정보
    private Long listId; // 카드가 속한/이동한 리스트 id
    private String listTitle;
    private String prevListTitle; // 이동 전 리스트명

    private String content; // 댓글, 체크리스트, 파일명
    private Boolean isChecked; // 체크리스트 완료 여부

    private String labelName;
    private Boolean isLabelAdded;

    // 변경 상세 정보
    private String fieldName;         // 변경된 항목의 이름 (예: "제목", "마감일", "설명")
    private String oldValue;          // 변경 전 값
    private String newValue;          // 변경 후 값

}
