package com.nullpointer.domain.activity.listener;

import com.nullpointer.domain.activity.dto.request.ActivitySaveRequest;
import com.nullpointer.domain.activity.service.ActivityService;
import com.nullpointer.domain.activity.vo.enums.ActivityType;
import com.nullpointer.domain.card.event.CardEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class ActivityEventListener {

    private final ActivityService activityService;

    /**
     * 카드 이벤트 활동 기록
     */
    @Async
    @EventListener
    public void handleCardEvent(CardEvent event) {
        if (event.getEventType() == CardEvent.EventType.DEADLINE_NEAR ||
                event.getEventType() == CardEvent.EventType.MENTION) return;

        ActivityType type = mapToActivityType(event);
        String detailMsg = generateDetail(event);

        String finalDescription = (detailMsg != null && !detailMsg.isEmpty()) ? detailMsg : type.getDescription();

        ActivitySaveRequest req = ActivitySaveRequest.builder()
                .userId(event.getActorId())
                .boardId(event.getBoardId())
                .teamId(event.getTeamId())
                .type(type)
                .targetId(event.getCardId())
                .targetName(event.getCardTitle())
                .description(finalDescription)
                .build();

        activityService.saveLog(req);
    }

    /**
     * 타입 변환
     * CardEvent -> ActivityType
     */
    private ActivityType mapToActivityType(CardEvent event) {
        Set<String> fields = event.getChangedFields();

        return switch (event.getEventType()) {
            // 생성, 이동, 삭제
            case CREATED -> ActivityType.CREATE_CARD;
            case MOVED -> ActivityType.MOVE_CARD;
            case DELETED -> ActivityType.DELETE_CARD;

            // 2. 댓글
            case COMMENT -> ActivityType.ADD_COMMENT; // Enum 이름 변경 반영
            case REPLY -> ActivityType.ADD_REPLY;

            // 3. 파일 첨부
            case ATTACHMENT -> ActivityType.UPLOAD_FILE;

            // 4. 체크리스트
            case CHECKLIST -> ActivityType.CHECKLIST_COMPLETED;

            // 5. 수정
            case UPDATED -> {
                // 완료 여부 변경
                if (fields.contains("COMPLETE")) {
                    yield Boolean.TRUE.equals(event.getIsComplete())
                            ? ActivityType.COMPLETE_CARD
                            : ActivityType.UNCOMPLETE_CARD;
                }
                // 마감일 변경
                if (fields.contains("DUE_DATE")) {
                    yield ActivityType.UPDATE_DUE_DATE;
                }
                // 중요도 변경
                if (fields.contains("PRIORITY")) {
                    yield ActivityType.UPDATE_PRIORITY;
                }
                // 아카이브 (보관) 변경
                if (fields.contains("ARCHIVE")) {
                    // CardEvent에 isArchived 필드가 있다고 가정하거나,
                    // 변경 로직에서 넘어온 값으로 판단
                    yield Boolean.TRUE.equals(event.getIsArchived())
                            ? ActivityType.ARCHIVE_CARD
                            : ActivityType.RESTORE_CARD;
                }

                // 그 외 일반 수정 (제목, 설명, 라벨 등)
                yield ActivityType.UPDATE_CARD;
            }

            // 담당자 변경은 보통 UPDATE_CARD로 처리하거나 별도 타입 추가
            case ASSIGNED -> ActivityType.UPDATE_CARD;

            // 그 외
            default -> ActivityType.UPDATE_CARD;
        };
    }

    /**
     * 로그에 보여줄 상세 메시지 작성
     */
    private String generateDetail(CardEvent event) {
        CardEvent.EventType type = event.getEventType();
        Set<String> changedFields = event.getChangedFields(); // 변경된 필드 목록

        // 카드 이동
        if (type == CardEvent.EventType.MOVED) {
            if (event.getPrevListTitle() != null && event.getListTitle() != null) {
                return String.format("'%s' ➔️ '%s'", event.getPrevListTitle(), event.getListTitle());
            }
            return "리스트 이동";
        }

        // 카드 수정
        if (type == CardEvent.EventType.UPDATED) {
            if (changedFields.contains("TITLE")) {
                return "제목 변경";
            }
            if (changedFields.contains("DESCRIPTION")) {
                return "설명 수정";
            }
            if (changedFields.contains("PRIORITY")) {
                return String.format("중요도: %s", event.getPriority().getLabel());
            }
            if (changedFields.contains("DUE_DATE")) {
                // 날짜 포맷팅 (예: 12월 25일)
                String dateStr = event.getDueDate() != null
                        ? event.getDueDate().format(DateTimeFormatter.ofPattern("MM/dd"))
                        : "삭제됨";
                return String.format("마감일: %s", dateStr);
            }
            if (changedFields.contains("LABEL")) {
                // 라벨명이 있다면 표시
                return "라벨 변경";
            }
            return "내용 수정";
        }

        // 파일 첨부
        if (type == CardEvent.EventType.ATTACHMENT) {
            String fileName = changedFields.stream().findFirst().orElse("파일");
            // 파일명이 너무 길면 자르기
            return fileName.length() > 20 ? fileName.substring(0, 17) + "..." : fileName;
        }

        // 체크리스트
        if (type == CardEvent.EventType.CHECKLIST) {
            return event.getChecklistContent() != null
                    ? String.format("항목 완료: %s", event.getChecklistContent())
                    : "체크리스트 완료";
        }

        // 담당자 지정
        if (type == CardEvent.EventType.ASSIGNED) {
            // 본인이 본인을 배정한 경우 vs 남이 배정한 경우 구분 가능
            return "담당자로 지정됨";
        }

        return "";
    }

}
