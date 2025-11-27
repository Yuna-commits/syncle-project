package com.nullpointer.domain.invitation.dto;

import com.nullpointer.domain.invitation.vo.enums.Status;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TeamInvitationResponse {
    private Long id;
    private Long teamId;
    private Long inviteeId;

    private Status status;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;

    // user 테이블 조인 데이터
    private String inviteeEmail;
    private String inviteeName;
    private String inviteeProfile_img;
}