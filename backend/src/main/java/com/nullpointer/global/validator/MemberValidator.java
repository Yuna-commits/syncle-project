package com.nullpointer.global.validator;

import com.nullpointer.domain.board.mapper.BoardMapper;
import com.nullpointer.domain.board.mapper.BoardSettingMapper;
import com.nullpointer.domain.board.vo.BoardSettingVo;
import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.domain.board.vo.enums.PermissionLevel;
import com.nullpointer.domain.board.vo.enums.Visibility;
import com.nullpointer.domain.member.mapper.BoardMemberMapper;
import com.nullpointer.domain.member.mapper.TeamMemberMapper;
import com.nullpointer.domain.member.vo.BoardMemberVo;
import com.nullpointer.domain.member.vo.TeamMemberVo;
import com.nullpointer.domain.member.vo.enums.Role;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
@RequiredArgsConstructor
public class MemberValidator {
    private final TeamMemberMapper teamMemberMapper;
    private final BoardMemberMapper boardMemberMapper;
    private final BoardMapper boardMapper;
    private final BoardSettingMapper boardSettingMapper;
    // ========================================================
    //  1. 팀 권한 확인
    // ========================================================

    /**
     * 팀 MEMBER인지 확인 (단순 접근 권한)
     * - 팀 페이지 조회
     */
    public void validateTeamMember(Long teamId, Long userId) {
        if (!teamMemberMapper.existsByTeamIdAndUserId(teamId, userId)) {
            throw new BusinessException(ErrorCode.TEAM_ACCESS_DENIED);
        }
    }

    /**
     * 팀 OWNER인지 확인 (관리 권한)
     * - 팀 설정 변경, 삭제, 멤버 추방
     */
    public void validateTeamOwner(Long teamId, Long userId, ErrorCode errorCode) {
        TeamMemberVo member = teamMemberMapper.findMember(teamId, userId);
        // 멤버 정보가 없거나, 역할이 OWNER가 아닌 경우
        if (member == null || !member.getRole().equals(Role.OWNER)) {
            throw new BusinessException(errorCode);
        }
    }

    /**
     * 팀 멤버 초대 시 중복 가입 방지를 위한 검증
     * - 현재 활동 중인 멤버 -> 예외
     * - 신규, 탈퇴 사용자면 통과
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
    // ========================================================
    //  2. 보드 권한 확인
    // ========================================================

    /**
     * 보드 관리자(OWNER) 권한 확인
     * - 보드 삭제, 보드 설정 변경, 멤버 초대/추방/권한 변경
     * - 명시적인 보드 멤버이면서 역할이 'OWNER'여야 함
     */
    public void validateBoardManager(Long boardId, Long userId) {
        Role effectiveRole = resolveEffectiveBoardRole(boardId, userId);
        // OWNER만 보드 관리자 권한을 가짐
        if (effectiveRole != Role.OWNER) {
            throw new BusinessException(ErrorCode.BOARD_UPDATE_FORBIDDEN);
        }
    }

    /**
     * 보드 작업자(OWNER/MEMBER)
     * - 리스트/카드 생성, 수정, 삭제, 이동, 댓글 작성 등
     * - VIEWER는 불가능
     */
    public void validateBoardEditor(Long boardId, Long userId) {
        Role effectiveRole = resolveEffectiveBoardRole(boardId, userId);
        // 권한이 아예 없거나 VIEWER인 경우 작업 불가
        if (effectiveRole == null || effectiveRole == Role.VIEWER) {
            throw new BusinessException(ErrorCode.BOARD_ACCESS_DENIED);
        }
    }

    /**
     * 보드 조회(VIEWER) 권한 검증
     * - 보드 진입, 리스트/카드 조회
     * - VIEWER, MEMBER, OWNER 모두 가능
     */
    public void validateBoardViewer(Long boardId, Long userId) {
        Role effectiveRole = resolveEffectiveBoardRole(boardId, userId);
        // 권한이 없으면 접근 불가
        if (effectiveRole == null) {
            throw new BusinessException(ErrorCode.BOARD_ACCESS_DENIED);
        }
    }

    /**
     * 보드 초대 권한 검증
     * - OWNER: 관리자만 초대 가능
     * - MEMBERS: 멤버 이상 초대 가능 (VIEWER 불가)
     * - @param permissionExtractor BoardSettingVo에서 검사할 권한 필드를 꺼내는 함수
     */
    public void validateBoardSetting(Long boardId, Long userId, Function<BoardSettingVo, PermissionLevel> permissionExtractor) {
        Role role = resolveEffectiveBoardRole(boardId, userId);

        // 1. 권한이 없거나 VIEWER인 경우 초대 불가
        if (role == null || role == Role.VIEWER) {
            throw new BusinessException(ErrorCode.BOARD_ACCESS_DENIED);
        }

        // 2. OWNER는 설정과 무관하게 항상 가능
        if (role == Role.OWNER) {
            return;
        }

        // 3. MEMBER인 경우 설정을 확인
        BoardSettingVo settings = boardSettingMapper.findBoardSettingsByBoardId(boardId);

        // 함수형 인터페이스를 통해 필요한 설정값 가져오기
        PermissionLevel requiredLevel = permissionExtractor.apply(settings);

        // 설정이 '관리자만(OWNER)'으로 되어있다면 일반 멤버는 실패
        if (requiredLevel == PermissionLevel.OWNER) {
            throw new BusinessException(ErrorCode.PERMISSION_FORBIDDEN);
        }
    }

    // ========================================================
    //  3. 실질적 권한(Effective Role) 계산
    // ========================================================

    /**
     * 현재 사용자가 해당 보드에서 행사할 수 있는 '최종 권한' 계산
     * 1. 보드 멤버 테이블에 명시적으로 존재하는지?
     * 2. 보드가 PRIVATE 공개이면 더 확인 필요 x (보드 멤버 테이블에 없는 사용자 접근 불가)
     * 3. 보드가 TEAM 공개이면 팀 멤버를 확인하여 권한 매핑
     * - OWNER/MEMBER -> MEMBER
     * - VIEWER -> VIEWER
     */
    private Role resolveEffectiveBoardRole(Long boardId, Long userId) {
        // 1. 보드 정보 조회
        BoardVo board = boardMapper.findBoardByBoardId(boardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));

        // 2. 명시적 권한 확인 - 보드 멤버 테이블 조회
        // 사용자가 이 보드에 직접 초대되어 멤버로 등록되어 있는지 확인
        BoardMemberVo boardMember = boardMemberMapper.findMember(boardId, userId);
        if (boardMember != null) {
            return boardMember.getRole(); // DB에 저장된 role 반환
        }

        // 3. 같은 팀 멤버 확인
        TeamMemberVo teamMember = teamMemberMapper.findMember(board.getTeamId(), userId);
        if (teamMember != null) {
            return (teamMember.getRole() == Role.VIEWER) ? Role.VIEWER : Role.MEMBER;
        }

        // 4. PUBLIC 보드 확인 (변경 사항)
        //        팀원도 아니고 보드 멤버도 아니지만, PUBLIC이면 누구나 조회 가능(VIEWER)
        if (board.getVisibility() == Visibility.PUBLIC) {
            return Role.VIEWER;
        }

        // 5. 모두 해당하지 않으면 권한 없음
        return null;
    }
}