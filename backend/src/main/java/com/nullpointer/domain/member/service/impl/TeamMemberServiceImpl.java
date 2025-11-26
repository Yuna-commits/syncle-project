package com.nullpointer.domain.member.service.impl;

import com.nullpointer.domain.member.dto.team.TeamInviteRequest;
import com.nullpointer.domain.member.dto.team.TeamInviteUpdateRequest;
import com.nullpointer.domain.member.dto.team.TeamMemberResponse;
import com.nullpointer.domain.member.dto.team.TeamRoleUpdateRequest;
import com.nullpointer.domain.member.mapper.TeamMemberMapper;
import com.nullpointer.domain.member.service.TeamMemberService;
import com.nullpointer.domain.member.vo.TeamMemberVo;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.validator.member.MemberValidator;
import com.nullpointer.global.validator.team.TeamValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamMemberServiceImpl implements TeamMemberService {

    private final TeamMemberMapper teamMemberMapper;
    private final MemberValidator memberVal;

    @Override
    @Transactional
    public void inviteTeamMember(Long teamId, TeamInviteRequest req, Long userId) {
        // 1. 요청자가 초대 권한(OWNER)이 있는지 확인
        memberVal.validateTeamOwner(teamId, userId, ErrorCode.MEMBER_INVITE_FORBIDDEN);

        for (Long targetUserId : req.getUserIds()) {
            // 2. 이미 존재하는 멤버인지 확인
            if (teamMemberMapper.existsByTeamIdAndUserId(teamId, targetUserId)) {
                throw new BusinessException(ErrorCode.MEMBER_ALREADY_EXISTS);
            }
            TeamMemberVo vo = req.toVo(teamId, targetUserId);
            teamMemberMapper.insertTeamMember(vo);
        }
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

        // 2. 대상 멤버가 존재하는지 확인
        if (!teamMemberMapper.existsByTeamIdAndUserId(teamId, memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        // 3. 업데이트
        TeamMemberVo vo = req.toVo(teamId, memberId);
        teamMemberMapper.updateTeamRole(vo);
    }

    @Override
    @Transactional
    public void changeTeamInvite(Long teamId, Long memberId, TeamInviteUpdateRequest req, Long userId) {
        // 1. 대상 멤버 존재 확인
        if (!teamMemberMapper.existsByTeamIdAndUserId(teamId, memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        // 2. 초대 승인/거절 본인 체크
        if (!userId.equals(memberId)) {
            memberVal.validateTeamOwner(teamId, userId, ErrorCode.MEMBER_INVITE_UPDATE_FORBIDDEN);
        }

        // 3. 업데이트
        TeamMemberVo vo = req.toVo(teamId, memberId);
        teamMemberMapper.updateTeamInvite(vo);
    }

    @Override
    public void deleteTeamMember(Long teamId, Long memberId, Long userId) {
        // 1. 대상 멤버 존재 확인
        if (!teamMemberMapper.existsByTeamIdAndUserId(teamId, memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        // 2. 권한 로직 분기
        // Case A: 본인 탈퇴 (user == member) -> OK
        // Case B: 추방 (user != member) -> user가 OWNER여야 함
        if (!userId.equals(memberId)) {
            memberVal.validateTeamOwner(teamId, userId, ErrorCode.MEMBER_DELETE_FORBIDDEN);
        }

        // 3. 탈퇴 처리
        teamMemberMapper.deleteTeamMember(teamId, memberId);
    }

}