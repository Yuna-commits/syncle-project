package com.nullpointer.domain.member.mapper;

import java.util.List;

import com.nullpointer.domain.member.dto.MemberResponse;
import com.nullpointer.domain.member.vo.MemberVo;


public interface MemberMapper {

    // 멤버 초대
    void insertMember(MemberVo memberVo);

    // 팀 멤버 조회
    List<MemberResponse> findMembersByTeamId(Long teamId);
}
