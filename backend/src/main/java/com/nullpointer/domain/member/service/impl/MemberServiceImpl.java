package com.nullpointer.domain.member.service.impl;

import com.nullpointer.domain.member.dto.InvitationMemberRequest;
import com.nullpointer.domain.member.dto.MemberResponse;
import com.nullpointer.domain.member.mapper.MemberMapper;
import com.nullpointer.domain.member.service.MemberService;
import com.nullpointer.domain.member.vo.MemberVo;
import lombok.Builder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Builder

public class MemberServiceImpl implements MemberService {

    private final MemberMapper memberMapper;

    @Override
    public void inviteMember(InvitationMemberRequest req) {
        for (Long userId : req.getUserIds()) {
            MemberVo vo = MemberVo.builder()
                    .teamId(req.getTeamId())
                    .userId(userId)
                    .role(req.getRole())
                    .build();

            memberMapper.insertMember(vo);
        }
    }

    @Override
    public List<MemberResponse> getTeamMembers(Long teamId) {
        return memberMapper.findMembersByTeamId(teamId);
    }
}
