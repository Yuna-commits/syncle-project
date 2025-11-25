package com.nullpointer.domain.user.dto.response;

import com.nullpointer.domain.user.vo.enums.VerifyStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    // 기본 정보
    private Long id;
    private String email;
    private String nickname;
    private String description;
    private String position;
    private String profileImg;
    private VerifyStatus verifyStatus;

    // 활동 정보
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private UserActivityStats activity;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserActivityStats {

        private Long participatedTeams; // 참여 팀 개수
        private Long participatedBoards; // 참여 보드 개수
        private Long createdCards; // 작성한 카드 개수
        private Long createdComments; // 작성한 댓글 개수

        /**
         * 알림 기능 구현 후 추가
         */
        // private Long unreadNotifications; // 안 읽은 알림 개수

    }

}
