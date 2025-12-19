package com.nullpointer.domain.notification.dto;

import com.nullpointer.domain.notification.vo.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {

    private Long id; // Redis 식별자

    private Long receiverId; // 알림을 받는 사용자 id
    private Long senderId; // 행동을 한 사용자 id
    private String senderNickname;
    private String senderProfileImg;

    private Long boardId;
    private Long targetId; // 이벤트 대상 테이블 id

    private NotificationType type; // 알림 유형
    private String message; // 알림 메시지 본문
    private String targetUrl; // 클릭 시 이동할 링크
    private Boolean isRead; // 읽음 여부
    private LocalDateTime createdAt;

    private String token; // 팀 초대 토큰

}
