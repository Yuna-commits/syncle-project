package com.nullpointer.domain.activity.listener;

import com.nullpointer.domain.activity.dto.request.ActivitySaveRequest;
import com.nullpointer.domain.activity.service.ActivityService;
import com.nullpointer.domain.activity.vo.enums.ActivityType;
import com.nullpointer.domain.board.event.BoardEvent;
import com.nullpointer.domain.card.event.CardEvent;
import com.nullpointer.domain.team.event.TeamEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.util.StringUtils;

@Slf4j
@Component
@RequiredArgsConstructor
public class ActivityEventListener {

    private final ActivityService activityService;

    /**
     * 카드 이벤트 활동 기록
     * - @TransactionalEventListener 커밋 성공 시에만 실행
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCardEvent(CardEvent event) {
        // 단순 알림용 이벤트는 로깅 제외
        if (event.getEventType() == CardEvent.EventType.DEADLINE_NEAR ||
                event.getEventType() == CardEvent.EventType.MENTION) return;

        try {
            ActivityType type = mapToActivityType(event);
            String detailMsg = generateDetail(event);

            String finalDescription = StringUtils.hasText(detailMsg) ? detailMsg : type.getDescription();

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
        } catch (Exception e) {
            log.error("활동 로그 저장 실패: cardId={}, error={}", event.getCardId(), e.getMessage());
        }
    }

    /**
     * 보드 이벤트 활동 기록
     */
    @Async
    @EventListener
    public void handleBoardEvent(BoardEvent event) {
        ActivityType type = null;
        String description = "";

        switch (event.getEventType()) {
            case CREATE_BOARD -> {
                type = ActivityType.CREATE_BOARD;
                description = "보드를 생성했습니다.";
            }
            case UPDATE_BOARD -> {
                type = ActivityType.UPDATE_BOARD;
                description = "보드 설정을 변경했습니다.";
            }
            case DELETE_BOARD -> {
                type = ActivityType.DELETE_BOARD;
                description = "보드를 삭제했습니다.";
            }
            // 리스트 관련 처리
            case CREATE_LIST -> {
                type = ActivityType.CREATE_LIST;
                description = String.format("'%s' 리스트를 생성했습니다.", event.getListTitle());
            }
            case DELETE_LIST -> {
                type = ActivityType.DELETE_LIST;
                description = String.format("'%s' 리스트를 삭제했습니다.", event.getListTitle());
            }
            default -> {
                return;
            } // 처리하지 않는 타입
        }

        ActivitySaveRequest req = ActivitySaveRequest.builder()
                .type(type)
                .userId(event.getActorId())
                .teamId(event.getTeamId())
                .boardId(event.getBoardId())
                .targetId(event.getBoardId()) // 타겟은 보드
                .targetName(event.getBoardTitle())
                .description(description)
                .build();

        activityService.saveLog(req);
    }

    /**
     * 팀 이벤트 활동 기록
     */
    @Async
    @EventListener
    public void handleTeamEvent(TeamEvent event) {
        ActivityType type = null;
        String description = "";

        switch (event.getEventType()) {
            case CREATE_TEAM -> {
                type = ActivityType.CREATE_TEAM;
                description = "팀을 생성했습니다.";
            }
            case UPDATE_TEAM -> {
                type = ActivityType.UPDATE_TEAM;
                description = "팀 설정을 변경했습니다.";
            }
            case DELETE_TEAM -> {
                type = ActivityType.DELETE_TEAM;
                description = "팀을 삭제했습니다.";
            }
            default -> {
                return;
            }
        }

        ActivitySaveRequest req = ActivitySaveRequest.builder()
                .type(type)
                .userId(event.getActorId())
                .teamId(event.getTeamId())
                .boardId(null) // 팀 로그는 보드 ID 없음
                .targetId(event.getTeamId())
                .targetName(event.getTeamName())
                .description(description)
                .build();

        activityService.saveLog(req);
    }

    /**
     * 타입 변환
     * CardEvent -> ActivityType
     */
    private ActivityType mapToActivityType(CardEvent event) {
        return switch (event.getEventType()) {
            case CREATED -> ActivityType.CREATE_CARD;
            case UPDATED, ASSIGNED, MOVED, LABEL, ATTACHMENT -> ActivityType.UPDATE_CARD;
            case COMMENT, REPLY, MENTION -> ActivityType.ADD_COMMENT;
            case CHECKLIST -> ActivityType.CHECKLIST_COMPLETED;
            default -> ActivityType.UPDATE_CARD;
        };
    }

    /**
     * 로그에 보여줄 상세 메시지 작성
     */
    private String generateDetail(CardEvent event) {
        return switch (event.getEventType()) {
            case UPDATED -> {
                if (event.getFieldName() == null) yield "카드를 수정했습니다.";

                String oldVal = event.getOldValue() == null ? "없음" : event.getOldValue();
                String newVal = event.getNewValue() == null ? "없음" : event.getNewValue();

                yield String.format("'%s'를 '%s'에서 '%s'(으)로 변경했습니다.",
                        event.getFieldName(), oldVal, newVal);
            }

            case MOVED -> String.format("카드를 '%s'에서 '%s'(으)로 이동했습니다.",
                    event.getPrevListTitle(), event.getListTitle());

            case ASSIGNED -> {
                // 본인이 본인을 지정한 경우
                if (event.getActorId().equals(event.getAssigneeId())) {
                    yield "본인을 담당자로 지정했습니다.";
                }
                // 타인을 지정한 경우
                yield String.format("'%s'님을 담당자로 지정했습니다.", event.getAssigneeNickname());
            }

            case CHECKLIST -> {
                boolean isCompleted = Boolean.TRUE.equals(event.getIsChecked());
                yield String.format("체크리스트 '%s'을(를) %s했습니다.",
                        truncate(event.getContent(), 15), isCompleted ? "완료" : "완료 해제");
            }

            case LABEL -> {
                boolean isAdded = Boolean.TRUE.equals(event.getIsLabelAdded());
                yield String.format("라벨 '%s'을(를) %s했습니다.",
                        event.getLabelName(), isAdded ? "추가" : "삭제");
            }

            case COMMENT -> "카드에 댓글을 남겼습니다." + truncate(event.getContent(), 20);

            case REPLY -> "댓글에 답글을 작성했습니다." + truncate(event.getContent(), 20);

            case ATTACHMENT -> String.format("파일 '%s'을(를) 첨부했습니다.", event.getContent());

            case CREATED -> "새로운 카드를 생성했습니다.";

            case DELETED -> "카드를 삭제했습니다.";

            default -> "";
        };
    }

    private String truncate(String str, int length) {
        if (str == null) return "";
        return str.length() > length ? str.substring(0, length) + "..." : str;
    }


}
