package com.nullpointer.domain.notification.dto;

import com.nullpointer.domain.notification.vo.NotificationSettingVo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationSettingDto {
    /**
     * JSON 구조
     */
    private boolean dnd;
    private EmailConfig email;
    private PushConfig push;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmailConfig {
        private boolean invites;
        private boolean mentions;
        private boolean assignments;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PushConfig {
        private boolean mentions;
        private boolean comments;
        private boolean assignments;
        private boolean dueDates;
        private boolean cardUpdates;
        private boolean cardMoves;
    }

    // VO -> DTO 변환
    public static NotificationSettingDto from(NotificationSettingVo setting) {
        return NotificationSettingDto.builder()
                .dnd(setting.isDnd())
                .email(new EmailConfig(
                        setting.isEmailInvites(),
                        setting.isEmailMentions(),
                        setting.isEmailAssignments()))
                .push(new PushConfig(
                        setting.isPushMentions(),
                        setting.isPushComments(),
                        setting.isPushAssignments(),
                        setting.isPushDueDates(),
                        setting.isPushCardUpdates(),
                        setting.isPushCardMoves()
                ))
                .build();
    }

    // DTO -> VO 변환
    public NotificationSettingVo toVo(Long userId) {
        return NotificationSettingVo.builder()
                .userId(userId)
                .dnd(this.dnd)
                .emailInvites(this.email.isInvites())
                .emailMentions(this.email.isMentions())
                .emailAssignments(this.email.isAssignments())
                .pushMentions(this.push.isMentions())
                .pushComments(this.push.isComments())
                .pushAssignments(this.push.isAssignments())
                .pushDueDates(this.push.isDueDates())
                .pushCardUpdates(this.push.isCardUpdates())
                .pushCardMoves(this.push.isCardMoves())
                .build();
    }
}
