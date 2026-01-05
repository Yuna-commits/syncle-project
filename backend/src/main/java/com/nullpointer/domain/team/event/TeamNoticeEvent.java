package com.nullpointer.domain.team.event;

import com.nullpointer.domain.notification.vo.enums.NotificationType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TeamNoticeEvent {

    private Long teamId;
    private String teamName; // 알림 메시지에 팀 이름 표시용
    private Long noticeId;
    private String noticeTitle; // 알림 메시지에 제목 표시용
    private Long writerId; // 작성자 (알림 제외 대상)
    private String writerNickname;
    private String writerProfileImg;
    private EventType eventType; // 로그용
    private NotificationType type; // 알림용

    public enum EventType {
        CREATE, UPDATE, DELETE
    }

}
