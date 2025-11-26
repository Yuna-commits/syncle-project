package com.nullpointer.global.validator.team;

import com.nullpointer.domain.team.mapper.TeamMapper;
import com.nullpointer.domain.team.vo.TeamVo;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TeamValidator {
    private final TeamMapper teamMapper;
    // ========================================================
    //  1. 리소스 존재 및 유효성 확인
    // ========================================================

    /**
     * 유효한 팀 가져오기
     */
    public TeamVo getValidTeam(Long teamId) {
        TeamVo team = teamMapper.findTeamByTeamId(teamId);
        if (team == null) {
            throw new BusinessException(ErrorCode.TEAM_NOT_FOUND);
        }
        if (team.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.TEAM_DELETED);
        }
        return team;
    }
}
