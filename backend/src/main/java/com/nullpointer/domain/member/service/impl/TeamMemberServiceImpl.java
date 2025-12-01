package com.nullpointer.domain.member.service.impl;

import com.nullpointer.domain.activity.dto.request.ActivitySaveRequest;
import com.nullpointer.domain.activity.service.ActivityService;
import com.nullpointer.domain.activity.vo.enums.ActivityType;
import com.nullpointer.domain.member.dto.team.TeamMemberResponse;
import com.nullpointer.domain.member.dto.team.TeamRoleUpdateRequest;
import com.nullpointer.domain.member.mapper.TeamMemberMapper;
import com.nullpointer.domain.member.service.TeamMemberService;
import com.nullpointer.domain.member.vo.TeamMemberVo;
import com.nullpointer.domain.member.vo.enums.Role;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
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
    private final UserMapper userMapper;
    private final MemberValidator memberVal;
    private final ActivityService activityService;

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
        Role oldRole = vo.getRole();
        teamMemberMapper.updateTeamRole(vo);

        // 멤버 권한 변경 로그 저장
        changeRoleLog(teamId, memberId, userId, oldRole, req.getRole());
    }

    @Override
    @Transactional
    public void deleteTeamMember(Long teamId, Long memberId, Long userId) {
        Long ownerId = null;

        // 1. 대상 멤버 존재 확인
        if (!teamMemberMapper.existsByTeamIdAndUserId(teamId, memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        // 2. 권한 로직: 본인 탈퇴 or OWNER의 강제 추방
        if (!userId.equals(memberId)) {
            // userId가 OWNER인지 확인
            memberVal.validateTeamOwner(teamId, userId, ErrorCode.MEMBER_DELETE_FORBIDDEN);
            ownerId = userId;
        }

        // 3. 탈퇴 처리
        teamMemberMapper.deleteTeamMember(teamId, memberId);

        // 탈퇴/강퇴 로그 저장
        kickMemberLog(teamId, memberId, ownerId);
    }

    /**
     * 팀 멤버 관리 로그
     */

    // 멤버 권한 변경 로그
    private void changeRoleLog(Long teamId, Long targetUserId, Long ownerId, Role oldRole, Role newRole) {
        UserVo targetUser = userMapper.findById(targetUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        activityService.saveLog(
                ActivitySaveRequest.builder()
                        .userId(ownerId) // 변경한 관리자 ID
                        .teamId(teamId)
                        .boardId(null)
                        .type(ActivityType.UPDATE_MEMBER_ROLE)
                        .targetId(targetUserId)
                        .targetName(targetUser.getNickname())
                        .description(String.format("권한을 %s -> %s (으)로 변경했습니다.", oldRole, newRole))
                        .build());
    }

    // 멤버 탈퇴/강퇴 로그
    private void kickMemberLog(Long teamId, Long targetUserId, Long ownerId) {
        UserVo targetUser = userMapper.findById(targetUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        activityService.saveLog(
                ActivitySaveRequest.builder()
                        .userId(ownerId != null ? ownerId : targetUserId) // 강퇴시킨 관리자 ID 또는 본인 ID
                        .teamId(teamId)
                        .boardId(null)
                        .type(ActivityType.KICK_MEMBER)
                        .targetId(targetUserId)
                        .targetName(targetUser.getNickname())
                        .description(targetUser.getNickname() + "님이 " + (ownerId != null ? "OWNER에 의해 팀에서 강퇴되었습니다." : "팀에서 탈퇴했습니다."))
                        .build());
    }

}