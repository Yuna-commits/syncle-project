package com.nullpointer.domain.member.dto.team;

import com.nullpointer.domain.member.vo.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TeamMemberResponse {

    // 기존 필드
    private Long teamId;
    private Long userId;
    private Role role;

    // user 테이블에서 가져온 정보
    private String email;
    private String nickname;
    private String position;
    private String profileImg;

}
