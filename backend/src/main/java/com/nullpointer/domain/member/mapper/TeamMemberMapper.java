package com.nullpointer.domain.member.mapper;

import com.nullpointer.domain.member.dto.team.TeamMemberResponse;
import com.nullpointer.domain.member.vo.TeamMemberVo;
import com.nullpointer.domain.member.vo.enums.Role;
import org.apache.ibatis.annotations.Param;

import java.util.List;


public interface TeamMemberMapper {

    // 팀 멤버 초대
    void insertTeamMember(TeamMemberVo teamMemberVo);

    // 팀 멤버 id 조회
    List<Long> findAllMemberIdsByTeamId(Long teamId);

    // 팀 멤버 조회
    List<TeamMemberResponse> findMembersByTeamId(Long teamId);

    // 팀 멤버 조회(탈퇴 멤버 포함)
    TeamMemberVo findMemberIncludeDeleted(@Param("teamId") Long teamId, @Param("userId") Long memberId);

    // 여러 명의 팀원 조회
    List<Long> findExistingMemberUserIds(@Param("teamId") Long teamId, @Param("userIds") List<Long> userIds);

    // 팀 역할 변경
    void updateTeamRole(TeamMemberVo vo);

    // 팀 탈퇴
    void deleteTeamMember(@Param("teamId") Long teamId, @Param("userId") Long memberId);

    // 본인이 오너인 팀 ID 목록
    List<Long> findTeamIdsByOwnerId(Long userId);

    // 특정 팀의 오너 id 조회
    Long findOwenrIdByTeamId(Long teamId);

    // 참여한 모든 팀 id 목록 조회
    List<Long> findTeamIdsByUserId(Long userId);

    // 특정 팀의 멤버 수
    int countMembersByTeamId(Long teamId);

    // 회원 탈퇴 시 소속한 모든 팀 일괄 탈퇴
    void deleteAllByUserId(Long userId);

    // 팀 삭제 시 팀 멤버 일괄 삭제
    void deleteAllMembersByTeamId(Long teamId);

    // 팀 멤버로 이미 등록되어 있는지 확인
    boolean existsByTeamIdAndUserId(@Param("teamId") Long teamId, @Param("userId") Long userId);

    // 권한 확인용 조회
    TeamMemberVo findMember(@Param("teamId") Long teamId, @Param("userId") Long userId);

    // 탈퇴 팀 멤버 복구
    void restoreMember(@Param("teamId") Long teamId, @Param("userId") Long userId, @Param("role") Role role);

}
