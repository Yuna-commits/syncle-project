package com.nullpointer.domain.member.service.impl;

import com.nullpointer.domain.member.dto.team.TeamMemberResponse;
import com.nullpointer.domain.member.dto.team.TeamRoleUpdateRequest;
import com.nullpointer.domain.member.mapper.TeamMemberMapper;
import com.nullpointer.domain.member.service.TeamMemberService;
import com.nullpointer.domain.member.vo.TeamMemberVo;
import com.nullpointer.domain.member.vo.enums.Role;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.validator.member.MemberValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamMemberServiceImpl implements TeamMemberService {

    private final TeamMemberMapper teamMemberMapper;
    private final MemberValidator memberVal;

    // 멤버 추가 (초대 수락 시 호출됨)
    @Override
    @Transactional
    public void addMember(Long teamId, Long userId, Role role) {
        // 중복 체크
        if (teamMemberMapper.existsByTeamIdAndUserId(teamId, userId)) {
            throw new BusinessException(ErrorCode.MEMBER_ALREADY_EXISTS);
        }

        TeamMemberVo newMember = TeamMemberVo.builder()
                .teamId(teamId)
                .userId(userId)
                .role(role)
                .build();

        teamMemberMapper.insertTeamMember(newMember);
    }

    @Override
    public List<TeamMemberResponse> getTeamMembers(Long teamId) {
        return teamMemberMapper.findMembersByTeamId(teamId);
    }

    @Override
    @Transactional
    public void changeTeamRole(Long teamId, Long memberId, TeamRoleUpdateRequest req, Long userId) {
        // 1. 요청자가 OWNER인지 확인
        memberVal.validateTeamOwner(teamId, userId, ErrorCode.MEMBER_UPDATE_FORBIDDEN);

        // 2. 대상 멤버 존재 확인
        if (!teamMemberMapper.existsByTeamIdAndUserId(teamId, memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        // 3. 업데이트
        TeamMemberVo vo = req.toVo(teamId, memberId);
        teamMemberMapper.updateTeamRole(vo);
    }

    @Override
    @Transactional
    public void deleteTeamMember(Long teamId, Long memberId, Long userId) {
        // 1. 대상 멤버 존재 확인
        if (!teamMemberMapper.existsByTeamIdAndUserId(teamId, memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        // 2. 권한 로직: 본인 탈퇴 or OWNER의 강제 추방
        if (!userId.equals(memberId)) {
            memberVal.validateTeamOwner(teamId, userId, ErrorCode.MEMBER_DELETE_FORBIDDEN);
        }

        // 3. 탈퇴 처리
        teamMemberMapper.deleteTeamMember(teamId, memberId);
    }
}