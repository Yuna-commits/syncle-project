package com.nullpointer.domain.notification.vo;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor // 기본 생성자
@AllArgsConstructor
@ToString
@Builder
public class NotificationSettingVo {

    private Long userId;
    private boolean dnd; // 방해 금지 모드

    // 이메일 알림
    private boolean emailInvites;
    private boolean emailMentions;
    private boolean emailAssignments;

    // 푸시 알림
    private boolean pushMentions;
    private boolean pushComments;
    private boolean pushAssignments;
    private boolean pushDueDates;
    private boolean pushCardUpdates;
    private boolean pushCardMoves;

    // 기본값 생성 메서드 (신규 유저용)
    public static NotificationSettingVo createDefault(Long userId) {
        return NotificationSettingVo.builder()
                .userId(userId)
                .dnd(false)
                .emailInvites(true).emailMentions(true).emailAssignments(true)
                .pushMentions(true).pushComments(true).pushAssignments(true)
                .pushDueDates(true).pushCardUpdates(true).pushCardMoves(false)
                .build();
    }

}
