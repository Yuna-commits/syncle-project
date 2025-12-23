package com.nullpointer.domain.invitation.event;

import com.nullpointer.domain.notification.vo.enums.NotificationType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InvitationEvent {
    private Long senderId; // 초대한 사람
    private String senderNickname;
    private String senderProfileImg;

    private Long receiverId; // 초대받은 사람
    private String receiverNickname;

    private Long targetId; // teamId || boardId
    private String targetName; // teamName || boardTitle

    private NotificationType type; // TEAM_INVITE || BOARD_INVITE

    private String token; // 팀 초대 토큰
}
