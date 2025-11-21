package com.nullpointer.domain.member.dto;

import com.nullpointer.domain.member.vo.enums.InvitationStatus;
import com.nullpointer.domain.member.vo.enums.Role;
import lombok.Getter;

@Getter
public class MemberResponse {

    // 기존 필드
    private Long teamId;
    private Long userId;
    private Role role;
    private InvitationStatus  invitationStatus;

    // user 테이블에서 가져온 정보
    private String email;
    private String nickname;
    private String position;
    private String profileImg;

}
