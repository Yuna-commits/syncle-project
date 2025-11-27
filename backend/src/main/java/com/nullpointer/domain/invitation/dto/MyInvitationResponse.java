package com.nullpointer.domain.invitation.dto;

import com.nullpointer.domain.invitation.vo.enums.Status;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MyInvitationResponse {
    private Long id;
    private Long teamId;
    private Long inviterId;

    private Status status;
    private LocalDateTime createdAt;

    // team 테이블 조인 데이터
    private String teamName;

    // user 테이블 조인 데이터
    private String inviterEmail;
    private String inviterName;
    private String inviterProfile_img;
}
