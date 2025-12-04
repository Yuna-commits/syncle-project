package com.nullpointer.global.validator.member;

import com.nullpointer.domain.member.mapper.BoardMemberMapper;
import com.nullpointer.domain.member.mapper.TeamMemberMapper;
import com.nullpointer.domain.member.vo.BoardMemberVo;
import com.nullpointer.domain.member.vo.TeamMemberVo;
import com.nullpointer.domain.member.vo.enums.Role;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MemberValidator {

    private final TeamMemberMapper teamMemberMapper;
    private final BoardMemberMapper boardMemberMapper;

    // ========================================================
    //  1. 권한 확인
    // ========================================================

    /**
     * 팀 멤버인지 확인 (접근 권한)
     */
    public void validateTeamMember(Long teamId, Long userId) {
        if (!teamMemberMapper.existsByTeamIdAndUserId(teamId, userId)) {
            throw new BusinessException(ErrorCode.TEAM_ACCESS_DENIED);
        }
    }

    /**
     * 팀 소유자(OWNER)인지 확인 (수정/삭제 권한)
     */
    public void validateTeamOwner(Long teamId, Long userId, ErrorCode errorCode) {
        TeamMemberVo member = teamMemberMapper.findMember(teamId, userId);
        if (member == null || !member.getRole().equals(Role.OWNER)) {
            throw new BusinessException(errorCode);
        }
    }

    /**
     * 보드 멤버인지 확인 (접근 권한)
     */
    public void validateBoardMember(Long boardId, Long userId) {
        if (boardMemberMapper.existsByBoardIdAndUserId(boardId, userId)) {
            throw new BusinessException(ErrorCode.BOARD_ACCESS_DENIED);
        }
    }

    /**
     * 보드 소유자(OWNER)인지 확인 (수정/삭제 권한)
     */
    public void validateBoardOwner(Long boardId, Long userId, ErrorCode errorCode) {
        BoardMemberVo member = boardMemberMapper.findMember(boardId, userId);
        if (member == null || !member.getRole().equals(Role.OWNER)) {
            throw new BusinessException(errorCode);
        }
    }

    // ========================================================
    //  2. 중복 방지 (새로 추가할 부분!)
    // ========================================================

    /**
     * 팀 멤버가 아닌지 확인 (초대/가입 시 중복 방지)
     * 용도: 초대장 발송 시 이미 멤버라면 에러 발생
     */
    public void validateNotTeamMember(Long teamId, Long userId, ErrorCode errorCode) {
        // 탈퇴한 멤버 포함하여 팀 멤버 조회
        TeamMemberVo member = teamMemberMapper.findMemberIncludeDeleted(teamId, userId);

        // 멤버 데이터가 존재하고 deleted_at이 NULL이면 현재 활동 중인 팀 멤버 -> 예외
        if (member != null && member.getDeletedAt() == null) {
            throw new BusinessException(errorCode); // 예: MEMBER_ALREADY_EXISTS
        }

        // member가 null(신규)이거나 member.getDeleted_at이 null이 아니면(탈퇴) 통과
    }
}