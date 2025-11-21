package com.nullpointer.domain.member.vo;

import com.nullpointer.domain.member.vo.enums.InvitationStatus;
import com.nullpointer.domain.member.vo.enums.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor // 기본 생성자
@AllArgsConstructor
@ToString
@Builder
public class MemberVo {
    private Long teamId;
    private Long userId;
    private Long boardId;

    private Role role;
    private InvitationStatus invitationStatus;

    private LocalDateTime joinedAt;
    private LocalDateTime deletedAt;
}
