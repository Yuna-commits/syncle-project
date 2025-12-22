package com.nullpointer.domain.notification.listener;

import com.nullpointer.domain.card.event.CardEvent;
import com.nullpointer.domain.invitation.event.InvitationEvent;
import com.nullpointer.domain.member.event.MemberEvent;
import com.nullpointer.domain.notification.dto.NotificationDto;
import com.nullpointer.domain.notification.mapper.NotificationSettingMapper;
import com.nullpointer.domain.notification.vo.NotificationSettingVo;
import com.nullpointer.domain.notification.vo.enums.NotificationType;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.global.common.SocketSender;
import com.nullpointer.global.common.enums.RedisKeyType;
import com.nullpointer.global.email.EmailService;
import com.nullpointer.global.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final RedisUtil redisUtil;
    private final UserMapper userMapper;
    private final SocketSender socketSender;
    private final NotificationSettingMapper settingMapper;
    private final EmailService emailService;

    @Value("${app.domain.frontend.url}")
    private String frontendUrl;

    /**
     * 카드 이벤트 처리 리스너
     */
    @Async
    @EventListener
    public void handleCardEvent(CardEvent event) {
        log.info("카드 이벤트 수신: type={}, cardId={}", event.getEventType(), event.getCardId());

        // 1. 알림 대상 판별 (본인 제외)
        Long actorId = event.getActorId();
        Long receiverId = null; // 카드 담당자에게 알림
        String message = "";
        NotificationType type = null;
        String targetUrl = String.format("/board/%d?cardId=%d", event.getBoardId(), event.getCardId());

        // 2. 이벤트 타입에 따라 수신자와 메시지 결정
        switch (event.getEventType()) {
            case ASSIGNED:
                receiverId = event.getAssigneeId(); // 담당자에게 알림
                type = NotificationType.CARD_ASSIGNED; // 담당자 지정
                message = String.format(
                        "'%s' 카드의 담당자로 지정되었습니다.",
                        event.getCardTitle());
                break;
            case MOVED:
                receiverId = event.getAssigneeId(); // 담당자에게 알림
                type = NotificationType.CARD_MOVED;
                message = String.format("담당 카드 '%s'가 '%s' 리스트로 이동되었습니다.",
                        event.getCardTitle(), event.getListTitle());
                break;
            case UPDATED:
                receiverId = event.getAssigneeId();
                type = NotificationType.CARD_UPDATED;
                message = generateUpdateMessage(event);
                break;
            case COMMENT:
                receiverId = event.getAssigneeId(); // 담당자에게 알림
                type = NotificationType.COMMENT;
                message = String.format("담당 카드 '%s'에 새 댓글이 달렸습니다.:%s",
                        event.getCardTitle(), getSafeSubstring(event.getCommentContent(), 20));
                break;
            case REPLY:
                receiverId = event.getTargetUserId(); // 원 댓글 작성자에게 알림
                type = NotificationType.COMMENT_REPLY;
                message = String.format("회원님의 댓글에 답글이 달렸습니다.:%s",
                        getSafeSubstring(event.getCommentContent(), 20));
                break;
            case MENTION:
                receiverId = event.getTargetUserId(); // 멘션된 사람에게 알림
                type = NotificationType.MENTION;
                message = String.format("'%s'님이 회원님을 언급했습니다:%s",
                        event.getActorNickname(),
                        getSafeSubstring(event.getCommentContent(), 20));
                break;
            case CHECKLIST:
                // 완료일 때만 알림 발송
                if (Boolean.TRUE.equals(event.getChecklistDone())) {
                    receiverId = event.getAssigneeId(); // 담당자에게 알림
                    type = NotificationType.CHECKLIST_COMPLETED;
                    message = String.format("'%s'님이 담당 카드 '%s'의 항목을 완료했습니다.:%s",
                            event.getActorNickname(),
                            event.getCardTitle(), getSafeSubstring(event.getChecklistContent(), 20));
                }
                break;
            case DEADLINE_NEAR:
                receiverId = event.getAssigneeId(); // 담당자에게 알림
                type = NotificationType.DEADLINE_NEAR;
                message = String.format("'%s'님이 담당 카드 '%s'의 마감이 임박했습니다.",
                        event.getActorNickname(), event.getCardTitle());
                break;
            case ATTACHMENT:
                String fileName = event.getChangedFields().iterator().next();
                receiverId = event.getAssigneeId();
                type = NotificationType.FILE_UPLOAD;
                message = String.format("'%s'님이 담당 카드 '%s'에 파일을 첨부했습니다.: %s",
                        event.getActorNickname(),
                        event.getCardTitle(), fileName);
                break;
            default:
                return;
        }

        // 수신자가 없거나 본인에게 보내는 알림이면 중단
        if (receiverId == null || receiverId.equals(actorId)) {
            return;
        }

        // 메시지가 없으면 알림 생략
        if (message.isEmpty()) return;

        // 알림 객체 생성
        NotificationDto noti = NotificationDto.builder()
                .id(System.currentTimeMillis())
                .receiverId(receiverId)
                .senderId(event.getActorId())
                .senderNickname(event.getActorNickname())
                .senderProfileImg(event.getActorProfileImg())
                .boardId(event.getBoardId())
                .targetId(event.getCardId())
                .type(type)
                .message(message)
                .targetUrl(targetUrl) // 클릭 시 해당 보드의 카드 상세로 이동
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        // redis 저장, 소켓 전송
        saveAndSendNotification(noti);
    }

    /**
     * 초대 이벤트 리스너
     */
    @Async
    @EventListener
    public void handleInvitationEvent(InvitationEvent event) {
        log.info("초대 이벤트 수신: type={}, targetId={}", event.getType(), event.getTargetId());

        String message = "";
        String targetUrl = "";

        // 메시지 및 링크 생성
        switch (event.getType()) {
            case TEAM_INVITE:
                message = String.format("'%s'님이 회원님을 '%s' 팀에 초대했습니다.", event.getSenderNickname(), event.getTargetName());
                targetUrl = "/teams/" + event.getTargetId() + "/boards"; // 팀 페이지로 이동
                sendTeamInvitationEmail(event);
                break;
            case BOARD_INVITE:
                message = String.format("'%s'님이 회원님을 '%s' 보드에 추가했습니다.", event.getSenderNickname(), event.getTargetName());
                targetUrl = "/board/" + event.getTargetId(); // 해당 보드로 이동
                break;
            case INVITE_ACCEPTED:
                message = String.format("'%s'님이 '%s' 팀 초대를 수락했습니다.", event.getSenderNickname(), event.getTargetName());
                targetUrl = "/teams/" + event.getTargetId() + "/members"; // 팀 멤버 목록 페이지로 이동
                break;
            case INVITE_REJECTED:
                message = String.format("'%s'님이 '%s' 팀 초대를 거절했습니다.", event.getSenderNickname(), event.getTargetName());
                targetUrl = "/teams/" + event.getTargetId() + "/members"; // 팀 멤버 목록 페이지로 이동
                break;
            case TEAM_MEMBER_KICKED:
                message = String.format("'%s' 팀에서 제외되었습니다.", event.getTargetName());
                targetUrl = "/dashboard";
                break;
            case TEAM_MEMBER_LEFT:
                message = String.format("'%s'님이 '%s' 팀을 떠났습니다.", event.getSenderNickname(), event.getTargetName());
                targetUrl = "/teams/" + event.getTargetId() + "/members"; // 팀 멤버 목록 페이지로 이동
                break;
            case BOARD_MEMBER_KICKED:
                message = String.format("'%s' 보드에서 제외되었습니다.", event.getTargetName());
                targetUrl = "/dashboard";
                break;
            case BOARD_MEMBER_LEFT:
                message = String.format("'%s'님이 '%s' 보드를 떠났습니다.", event.getSenderNickname(), event.getTargetName());
                targetUrl = "/board/" + event.getTargetId(); // 해당 보드로 이동
                break;
            case TEAM_DELETED:
                message = String.format("'%s' 팀이 삭제되었습니다.", event.getTargetName());
                targetUrl = "/dashboard";
                break;
            case BOARD_DELETED:
                message = String.format("'%s' 보드가 삭제되었습니다.", event.getTargetName());
                targetUrl = "/dashboard";
                break;
            default:
                return;
        }

        // 알림 객체 생성
        NotificationDto noti = NotificationDto.builder()
                .id(System.currentTimeMillis())
                .receiverId(event.getReceiverId())
                .senderId(event.getSenderId())
                .senderNickname(event.getSenderNickname())
                .senderProfileImg(event.getSenderProfileImg())
                .type(event.getType())
                .message(message)
                .targetUrl(targetUrl)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .token(event.getToken())
                .build();

        // redis 저장, 소켓 전송
        saveAndSendNotification(noti);
    }

    @Async
    @EventListener
    public void handleMemberEvent(MemberEvent event) {
        log.info("권한 변경 이벤트 수신: type={}, targetId={}", event.getType(), event.getTargetId());

        MemberEvent.TargetType targetType = event.getTargetType();

        String message = String.format("'%s' %s에서의 권한이 '%s'(으)로 변경되었습니다.",
                event.getTargetName(),
                targetType.getLabel(),
                event.getNewRole().getLabel());

        String targetUrl = "/teams/" + event.getTargetId() + "/members"; // 팀 멤버 목록 페이지로 이동

        if (targetType == MemberEvent.TargetType.BOARD) {
            targetUrl = "/board/" + event.getTargetId(); // 해당 보드 페이지로 이동
        }

        // 알림 객체 생성
        NotificationDto noti = NotificationDto.builder()
                .id(System.currentTimeMillis())
                .receiverId(event.getTargetUserId())
                .senderId(event.getSenderId())
                .senderNickname(event.getSenderNickname())
                .senderProfileImg(event.getSenderProfileImg())
                .type(event.getType())
                .message(message)
                .targetUrl(targetUrl)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        // redis 저장, 소켓 전송
        saveAndSendNotification(noti);
    }

    /**
     * Helper Method
     */
    // 20자 미만일 때 에러 방지
    private String getSafeSubstring(String content, int length) {
        if (content == null) return "";
        if (content.length() <= length) return content;
        return content.substring(0, length) + "...";
    }

    private String generateUpdateMessage(CardEvent event) {
        Set<String> fields = event.getChangedFields();
        if (fields == null || fields.isEmpty()) return "";

        String cardTitle = event.getCardTitle();

        // 1. 완료 처리
        if (fields.contains("COMPLETE")) {
            return Boolean.TRUE.equals(event.getIsComplete())
                    ? String.format("담당 카드 '%s'가 완료 처리되었습니다.", cardTitle)
                    : String.format("담당 카드 '%s'의 완료 처리가 취소되었습니다.", cardTitle);
        }

        // 2. 중요도 변경 (Priority Enum의 label 활용)
        if (fields.contains("PRIORITY")) {
            String label = event.getPriority().getLabel(); // "높음", "보통", "낮음"
            return String.format("담당 카드 '%s'의 중요도가 '%s'(으)로 변경되었습니다.", cardTitle, label);
        }

        // 3. 마감일 변경
        if (fields.contains("DUE_DATE")) {
            if (event.getDueDate() != null) {
                String dateStr = event.getDueDate().format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일"));
                return String.format("담당 카드 '%s'의 마감일이 %s로 변경되었습니다.", cardTitle, dateStr);
            } else {
                return String.format("담당 카드 '%s'의 마감일 설정이 해제되었습니다.", cardTitle);
            }
        }

        // 그 외 (제목, 설명 등)
        return String.format("담당 카드 '%s'의 내용이 수정되었습니다.", cardTitle);
    }

    // Redis 알림 저장, 소켓 전송 (소켓/푸시/이메일)
    private void saveAndSendNotification(NotificationDto noti) {
        Long receiverId = noti.getReceiverId();

        // 수신자의 알림 설정 조회 (없으면 기본값)
        NotificationSettingVo settings = settingMapper.findByUserId(receiverId)
                .orElse(NotificationSettingVo.createDefault(receiverId));

        // 1. 방해 금지 모드이면 모든 알림 중단
        if (settings.isDnd()) return;

        // 수신자 정보 조회
        UserVo receiver = userMapper.findById(noti.getReceiverId()).orElse(null);
        if (receiver == null) return;

        // 2. 실시간 알림 설정 확인
        if (shouldSendPush(settings, noti.getType())) {
            // Redis 저장
            // key: "np:notification:{userId}"
            String key = RedisKeyType.NOTIFICATION.getKey(String.valueOf(noti.getReceiverId()));
            redisUtil.addList(key, noti, RedisKeyType.NOTIFICATION.getDefaultTtl());

            // 용량 관리 (최근 50개만 유지)
            redisUtil.trimList(key, 110);

            // 이메일로 소켓 메시지 전송
            // WebSocket 실시간 전송
            // 구독 경로: /queue/notifications/{email} <- Spring Security의 username이 이메일이기 때문
            // 프론트엔드가 이 경로를 구독해야 함
            socketSender.sendGlobalSocketMessage(
                    receiver.getEmail(),    // 수신자 이메일
                    noti.getType().name(),  // 타입 (예: CARD_MOVE)
                    noti.getSenderId(),     // 보낸 사람 ID
                    noti.getMessage(),      // "홍길동님이 카드를 이동했습니다."
                    noti);
        }

        // 3. 활동 이메일 설정 확인 (멘션, 담당자 지정, 보드 초대)
        if (shouldSendActivityEmail(settings, noti.getType())) {
            String subject = "[SYNCLE] 새로운 알림이 도착했습니다.";
            emailService.sendActivityNotification(
                    receiver.getEmail(),
                    subject,
                    noti.getMessage(),
                    noti.getTargetUrl() // 클릭 시 이동할 경로
            );
            log.info("활동 알림 메일 발송: receiver={}", receiver.getEmail());
        }
    }

    // 초대 이메일 발송 처리
    private void sendTeamInvitationEmail(InvitationEvent event) {
        Long receiverId = event.getReceiverId();

        // 수신자의 알림 설정 조회 (없으면 기본값)
        NotificationSettingVo settings = settingMapper.findByUserId(receiverId)
                .orElse(NotificationSettingVo.createDefault(receiverId));

        // DND이거나 설정 OFF이면 발송 x
        if (settings.isDnd() || !settings.isEmailInvites()) return;

        // 수신자 정보 조회
        UserVo receiver = userMapper.findById(receiverId).orElse(null);
        if (receiver == null) return;


        // 수락 링크 생성
        String inviteUrl = UriComponentsBuilder.fromUriString(frontendUrl)
                .path("/invite/accept")
                .queryParam("token", event.getToken())
                .build()
                .toUriString();

        // 메일 발송
        emailService.sendInvitationEmail(
                receiver.getEmail(),
                inviteUrl,
                event.getTargetName(), // 팀 이름
                event.getSenderNickname()); // 초대한 사람

        log.info("팀 초대 메일 발송 완료: receiver={}", receiver.getEmail());
    }

    // 알림 설정과 타입을 비교하여 푸시/소켓 알림 발송 여부 결정
    private boolean shouldSendPush(NotificationSettingVo settings, NotificationType type) {
        // 타입별 설정 확인
        return switch (type) {
            // 멘션
            case MENTION -> settings.isPushMentions();
            // 담당자 지정
            case CARD_ASSIGNED -> settings.isPushAssignments();
            // 카드 이동
            case CARD_MOVED -> settings.isPushCardMoves();
            // 댓글, 답글
            case COMMENT, COMMENT_REPLY -> settings.isPushComments();
            // 마감 임박
            case DEADLINE_NEAR -> settings.isPushDueDates();
            // 카드 수정, 체크리스트 상태 변경, 파일 첨부
            case CARD_UPDATED, CHECKLIST_COMPLETED, FILE_UPLOAD -> settings.isPushCardUpdates();
            // 팀/보드 설정은 기본적으로 전송
            case TEAM_INVITE, INVITE_ACCEPTED, INVITE_REJECTED, TEAM_MEMBER_KICKED, TEAM_MEMBER_LEFT, TEAM_DELETED,
                 BOARD_INVITE, BOARD_MEMBER_KICKED, BOARD_MEMBER_LEFT, BOARD_DELETED, PERMISSION_CHANGED -> true;

            default -> true;
        };
    }

    // 활동 이메일 발송 여부 결정 (초대 제외)
    private boolean shouldSendActivityEmail(NotificationSettingVo settings, NotificationType type) {
        return switch (type) {
            case MENTION -> settings.isEmailMentions();
            case CARD_ASSIGNED -> settings.isEmailAssignments();
            case BOARD_INVITE -> settings.isEmailInvites();
            default -> false;
        };
    }

}
