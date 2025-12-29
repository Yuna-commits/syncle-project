package com.nullpointer.domain.member.event;

import com.nullpointer.domain.member.vo.enums.Role;
import com.nullpointer.domain.notification.vo.enums.NotificationType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MemberEvent {

    private Long targetUserId; // 권한이 바뀐 사람
    private String targetUserNickname;

    private Long targetId; // teamId || boardId
    private String targetName; // teamName || boardTitle
    private TargetType targetType; // 권한 변경이 일어난 대상

    private Long senderId; // 관리자
    private String senderNickname;
    private String senderProfileImg;

    private Role newRole; // 변경된 권한
    private NotificationType type;

    @Getter
    public enum TargetType {
        TEAM("팀"), BOARD("보드");

        private final String label;

        TargetType(String label) {
            this.label = label;
        }
    }

}
