package com.nullpointer.domain.member.vo;

import com.nullpointer.domain.member.vo.enums.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor // 기본 생성자
@AllArgsConstructor
@ToString
@Builder
public class TeamMemberVo {
    private Long teamId;
    private Long userId;

    @Builder.Default
    private Role role = Role.MEMBER;

    private LocalDateTime joinedAt;
    private LocalDateTime deletedAt;
}
