package com.nullpointer.domain.activity.listener;

import com.nullpointer.domain.activity.dto.request.ActivitySaveRequest;
import com.nullpointer.domain.activity.service.ActivityService;
import com.nullpointer.domain.activity.vo.enums.ActivityType;
import com.nullpointer.domain.board.event.BoardEvent;
import com.nullpointer.domain.card.event.CardEvent;
import com.nullpointer.domain.invitation.event.InvitationEvent;
import com.nullpointer.domain.member.event.MemberEvent;
import com.nullpointer.domain.notification.vo.enums.NotificationType;
import com.nullpointer.domain.team.event.TeamEvent;
import com.nullpointer.domain.team.event.TeamNoticeEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
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
    @EventListener
    public void handleBoardEvent(BoardEvent event) {
        // 1. 설정 변경은 루프를 돌며 여러 로그를 남겨야 하므로 별도 처리
        if (event.getEventType() == BoardEvent.EventType.UPDATE_BOARD_SETTINGS) {
            if (event.getSettingChanges() != null) {
                event.getSettingChanges().forEach((settingType, values) -> {
                    String oldVal = values[0];
                    String newVal = values[1];
                    String desc = String.format("%s을(를) '%s'에서 '%s'(으)로 변경했습니다.",
                            settingType.getLabel(), oldVal, newVal);

                    // 설정 변경 로그 저장 (ActivityType.UPDATE_BOARD 혹은 정의한 타입 사용)
                    ActivitySaveRequest req = ActivitySaveRequest.builder()
                            .type(ActivityType.UPDATE_BOARD_SETTINGS)
                            .userId(event.getActorId())
                            .teamId(event.getTeamId())
                            .boardId(event.getBoardId())
                            .targetId(event.getBoardId())
                            .targetName(event.getBoardTitle())
                            .description(desc)
                            .build();

                    activityService.saveLog(req);
                });
            }
            return;
        }

        // 2. 그 외 단일 로그 처리
        ActivityType type = null;
        String description = "";

        switch (event.getEventType()) {
            case CREATE_BOARD -> {
                type = ActivityType.CREATE_BOARD;
                description = String.format("'%s' 보드를 생성했습니다.", event.getBoardTitle());
            }
            case UPDATE_BOARD -> {
                type = ActivityType.UPDATE_BOARD;
                description = "보드 정보를 변경했습니다.";
            }
            case DELETE_BOARD -> {
                type = ActivityType.DELETE_BOARD;
                description = String.format("'%s' 보드를 삭제했습니다.", event.getBoardTitle());
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
            case UPDATE_LIST -> {
                type = ActivityType.UPDATE_MEMBER_ROLE;
                if (event.getIsArchived() == null) {
                    description = String.format("리스트 이름을 '%s'(으)로 변경했습니다.", event.getListTitle());
                } else if (event.getIsArchived()) {
                    description = String.format("'%s' 리스트를 보관함으로 이동했습니다.", event.getListTitle());

                } else {
                    description = String.format("'%s' 리스트를 보드로 복구했습니다.", event.getListTitle());
                }
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
    @EventListener
    public void handleTeamEvent(TeamEvent event) {
        ActivityType type = null;
        String description = "";

        switch (event.getEventType()) {
            case CREATE_TEAM -> {
                type = ActivityType.CREATE_TEAM;
                description = String.format("'%s' 팀을 생성했습니다.", event.getTeamName());
            }
            case UPDATE_TEAM -> {
                type = ActivityType.UPDATE_TEAM;
                if (event.getNewBoardCreateRole() != null) {
                    description = String.format("보드 생성 권한을 '%s'에서 '%s'(으)로 변경했습니다.",
                            event.getOldBoardCreateRole(), event.getNewBoardCreateRole());
                } else {
                    description = "팀 정보를 변경했습니다.";
                }
            }
            case DELETE_TEAM -> {
                type = ActivityType.DELETE_TEAM;
                description = String.format("'%s' 팀을 삭제했습니다.", event.getTeamName());
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
     * 초대/멤버 관리 이벤트 활동 기록
     */
    @EventListener
    public void handleInvitationEvent(InvitationEvent event) {
        try {
            // 1. 활동 타입 매핑
            ActivityType activityType = mapInvitationToActivityType(event.getType());
            if (activityType == null) return;

            // 2. 상세 메시지 생성
            String description = generateInvitationDetail(event);

            // 3. 타겟 ID 구분 (팀 vs 보드)
            Long teamId = null;
            Long boardId = null;

            if (isTeamEvent(event.getType())) {
                teamId = event.getTargetId();
            } else {
                boardId = event.getTargetId();
            }

            // 4. 로그 저장
            ActivitySaveRequest req = ActivitySaveRequest.builder()
                    .userId(event.getSenderId()) // 행위자 ID
                    .teamId(teamId)
                    .boardId(boardId)
                    .type(activityType)
                    .targetId(event.getTargetId())
                    .targetName(event.getTargetName())
                    .description(description)
                    .build();

            activityService.saveLog(req);

        } catch (Exception e) {
            log.error("초대 활동 로그 저장 실패: type={}, error={}", event.getType(), e.getMessage());
        }
    }

    /**
     * 멤버 권한 변경 이벤트 활동 기록
     */
    @EventListener
    public void handleMemberEvent(MemberEvent event) {
        if (event.getType() != NotificationType.PERMISSION_CHANGED) return;

        try {
            String description = String.format("'%s'님의 권한을 '%s'(으)로 변경했습니다.",
                    event.getTargetUserNickname(), event.getNewRole());

            Long teamId = null;
            Long boardId = null;

            if (event.getTargetType() == MemberEvent.TargetType.TEAM) {
                teamId = event.getTargetId();
            } else {
                boardId = event.getTargetId();
            }

            ActivitySaveRequest req = ActivitySaveRequest.builder()
                    .userId(event.getSenderId())
                    .teamId(teamId)
                    .boardId(boardId)
                    .type(ActivityType.UPDATE_MEMBER_ROLE)
                    .targetId(event.getTargetId()) // 권한 변경은 보드/팀 레벨의 활동으로 간주하여 타겟을 보드/팀 ID로 설정
                    .targetName(event.getTargetName())
                    .description(description)
                    .build();

            activityService.saveLog(req);

        } catch (Exception e) {
            log.error("멤버 권한 변경 로그 저장 실패: error={}", e.getMessage());
        }
    }

    /**
     * 공지사항 이벤트 활동 기록
     */
    @EventListener
    public void handleTeamNoticeEvent(TeamNoticeEvent event) {
        try {
            ActivityType type = null;
            String description = "";
            String title = event.getNoticeTitle();

            // EventType에 따라 분기 처리
            switch (event.getEventType()) {
                case CREATE -> {
                    type = ActivityType.CREATE_NOTICE;
                    description = String.format("공지사항 '%s'을(를) 등록했습니다.", title);
                }
                case UPDATE -> {
                    type = ActivityType.UPDATE_NOTICE;
                    description = String.format("공지사항 '%s'을(를) 수정했습니다.", title);
                }
                case DELETE -> {
                    type = ActivityType.DELETE_NOTICE;
                    description = String.format("공지사항 '%s'을(를) 삭제했습니다.", title);
                }
            }

            if (type == null) return;

            ActivitySaveRequest req = ActivitySaveRequest.builder()
                    .userId(event.getWriterId())
                    .teamId(event.getTeamId())
                    .boardId(null)
                    .type(type)
                    .targetId(event.getNoticeId())
                    .targetName(title)
                    .description(description)
                    .build();

            activityService.saveLog(req);

        } catch (Exception e) {
            log.error("팀 공지 활동 로그 저장 실패: noticeId={}, error={}", event.getNoticeId(), e.getMessage());
        }
    }

    /**
     * 타입 변환
     * CardEvent -> ActivityType
     */
    private ActivityType mapToActivityType(CardEvent event) {
        return switch (event.getEventType()) {
            case CREATED -> ActivityType.CREATE_CARD;
            case UPDATED -> {
                if ("진행 상태".equals(event.getFieldName()) && "완료".equals(event.getNewValue())) {
                    yield ActivityType.COMPLETE_CARD;
                }
                yield ActivityType.UPDATE_CARD;
            }
            case ASSIGNED, MOVED, LABEL, ATTACHMENT -> ActivityType.UPDATE_CARD;
            case COMMENT, REPLY, MENTION -> ActivityType.ADD_COMMENT;
            case CHECKLIST -> ActivityType.CHECKLIST_COMPLETED;
            default -> ActivityType.UPDATE_CARD;
        };
    }

    /**
     * NotificationType -> ActivityType 변환
     */
    private ActivityType mapInvitationToActivityType(NotificationType notiType) {
        return switch (notiType) {
            // 멤버 초대
            case TEAM_INVITE, BOARD_INVITE -> ActivityType.INVITE_MEMBER;
            // 멤버 추방
            case TEAM_MEMBER_KICKED, BOARD_MEMBER_KICKED -> ActivityType.KICK_MEMBER;
            // 팀 초대 수락/거절
            case INVITE_ACCEPTED -> ActivityType.ACCEPT_INVITE;
            case INVITE_REJECTED -> ActivityType.REJECT_INVITE;
            // 자진 탈퇴
            case TEAM_MEMBER_LEFT -> ActivityType.LEAVE_TEAM;
            case BOARD_MEMBER_LEFT -> ActivityType.LEAVE_BOARD;
            default -> null;
        };
    }

    /**
     * 로그에 보여줄 상세 메시지 작성
     */
    private String generateDetail(CardEvent event) {
        String cardTitle = event.getCardTitle();
        return switch (event.getEventType()) {
            case UPDATED -> {
                if (event.getFieldName() == null) yield String.format("'%s' 카드를 수정했습니다.", cardTitle);

                String oldVal = event.getOldValue() == null ? "없음" : event.getOldValue();
                String newVal = event.getNewValue() == null ? "없음" : event.getNewValue();

                yield String.format("'%s' 카드의 '%s'을(를) '%s'에서 '%s'(으)로 변경했습니다.",
                        cardTitle, event.getFieldName(), oldVal, newVal);
            }

            case MOVED -> String.format("'%s' 카드를 '%s'에서 '%s'(으)로 이동했습니다.",
                    cardTitle, event.getPrevListTitle(), event.getListTitle());

            case ASSIGNED -> {
                // 본인이 본인을 지정한 경우
                if (event.getActorId().equals(event.getAssigneeId())) {
                    yield String.format("'%s' 카드의 담당자로 본인을 지정했습니다.", cardTitle);
                }
                // 타인을 지정한 경우
                yield String.format("'%s' 카드의 담당자로 '%s'님을 지정했습니다.",
                        cardTitle, event.getAssigneeNickname());
            }

            case CHECKLIST -> {
                boolean isCompleted = Boolean.TRUE.equals(event.getIsChecked());
                yield String.format("'%s' 카드의 체크리스트 '%s'을(를) %s했습니다.",
                        cardTitle, truncate(event.getContent(), 15), isCompleted ? "완료" : "완료 해제");
            }

            case LABEL -> {
                boolean isAdded = Boolean.TRUE.equals(event.getIsLabelAdded());
                yield String.format("'%s' 카드에 라벨 '%s'을(를) %s했습니다.",
                        cardTitle, event.getLabelName(), isAdded ? "추가" : "삭제");
            }

            case COMMENT -> String.format("'%s' 카드에 댓글을 남겼습니다. : \"%s\"",
                    cardTitle, truncate(event.getContent(), 20));

            case REPLY -> String.format("'%s' 카드의 댓글에 답글을 남겼습니다. : \"%s\"",
                    cardTitle, truncate(event.getContent(), 20));

            case ATTACHMENT -> String.format("'%s' 카드에 파일 '%s'을(를) 첨부했습니다.",
                    cardTitle, event.getContent());

            case CREATED -> String.format("새로운 카드 '%s'을(를) 생성했습니다.", cardTitle);

            case DELETED -> String.format("'%s' 카드를 삭제했습니다.", cardTitle);

            default -> "";
        };
    }

    private String generateInvitationDetail(InvitationEvent event) {
        String target = event.getTargetName(); // 팀명 or 보드명
        String receiver = event.getReceiverNickname(); // 대상자 닉네임

        return switch (event.getType()) {
            case TEAM_INVITE -> String.format("'%s' 팀에 '%s'님을 초대했습니다.", target, receiver);
            case BOARD_INVITE -> String.format("'%s' 보드에 '%s'님을 초대했습니다.", target, receiver);

            case TEAM_MEMBER_KICKED -> String.format("'%s' 팀에서 '%s'님을 내보냈습니다.", target, receiver);
            case BOARD_MEMBER_KICKED -> String.format("'%s' 보드에서 '%s'님을 내보냈습니다.", target, receiver);

            case INVITE_ACCEPTED -> String.format("'%s' 팀 초대를 수락하고 참여했습니다.", target);
            case INVITE_REJECTED -> String.format("'%s' 팀 초대를 거절했습니다.", target);

            case TEAM_MEMBER_LEFT -> String.format("'%s' 팀에서 나갔습니다.", target);
            case BOARD_MEMBER_LEFT -> String.format("'%s' 보드에서 나갔습니다.", target);
            default -> event.getType().getLabel();
        };
    }

    private String truncate(String str, int length) {
        if (str == null) return "";
        return str.length() > length ? str.substring(0, length) + "..." : str;
    }

    /**
     * 팀 이벤트 여부 확인 (TeamId 매핑용)
     */
    private boolean isTeamEvent(NotificationType type) {
        return switch (type) {
            case TEAM_INVITE, TEAM_MEMBER_KICKED,
                 TEAM_MEMBER_LEFT, TEAM_DELETED,
                 INVITE_ACCEPTED // 팀 초대 수락만 있으므로 true
                    -> true;
            default -> false; // 나머지는 보드 이벤트
        };
    }

}
