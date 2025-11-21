package com.nullpointer.domain.member.service;

import com.nullpointer.domain.member.dto.InvitationMemberRequest;
import com.nullpointer.domain.member.dto.MemberResponse;

import java.util.List;

public interface MemberService {

    // 멤버 초대
    void inviteMember(InvitationMemberRequest req);
    
    // 팀 멤버 조회
    List<MemberResponse> getTeamMembers(Long teamId);

}
