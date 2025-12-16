package com.nullpointer.domain.invitation.vo;

import com.nullpointer.domain.invitation.vo.enums.Status;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationVo {
    private Long id;
    private Long teamId;
    private String teamName;
    private Long inviterId;      // 보낸 사람 ID
    private Long inviteeId; // 받는 사람 ID
    private String token; // Redis 검증용 토큰
    @Builder.Default
    private Status status = Status.PENDING; // PENDING, ACCEPTED, REJECTED, EXPIRED
    private LocalDateTime createdAt; // 생성일
    private LocalDateTime expiredAt; // 만료일
    private LocalDateTime respondedAt; // 응답일
}