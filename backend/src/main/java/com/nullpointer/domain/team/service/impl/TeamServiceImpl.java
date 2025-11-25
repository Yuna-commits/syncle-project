package com.nullpointer.domain.team.service.impl;

import com.nullpointer.domain.board.dto.response.BoardResponse;
import com.nullpointer.domain.board.mapper.BoardMapper;
import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.domain.member.dto.team.TeamMemberResponse;
import com.nullpointer.domain.member.mapper.TeamMemberMapper;
import com.nullpointer.domain.member.vo.TeamMemberVo;
import com.nullpointer.domain.member.vo.enums.InvitationStatus;
import com.nullpointer.domain.member.vo.enums.Role;
import com.nullpointer.domain.team.dto.request.CreateTeamRequest;
import com.nullpointer.domain.team.dto.response.TeamDetailResponse;
import com.nullpointer.domain.team.dto.response.TeamResponse;
import com.nullpointer.domain.team.dto.request.UpdateTeamRequest;
import com.nullpointer.domain.team.mapper.TeamMapper;
import com.nullpointer.domain.team.service.TeamService;
import com.nullpointer.domain.team.vo.TeamVo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamMapper teamMapper;
    private final TeamMemberMapper teamMemberMapper;
    private final BoardMapper boardMapper;

    @Override
    @Transactional
    public void createTeam(CreateTeamRequest req, Long userId) {

        // 1. 팀 VO 생성 (DTO -> VO)
        TeamVo teamVo = TeamVo.builder()
                .name(req.getName())
                .description(req.getDescription())
                .build();

        teamMapper.insertTeam(teamVo);

        // 2. 방금 만든 팀 ID 가져오기
        Long createTeamId = teamVo.getId();

        // 3. 팀 멤버 VO 생성 (DTO -> VO)
        TeamMemberVo teamMemberVo = TeamMemberVo.builder()
                .teamId(createTeamId)
                .userId(userId)
                .role(Role.OWNER)
                .invitationStatus(InvitationStatus.ACTIVE)
                .build();

        teamMemberMapper.insertTeamMember(teamMemberVo);
    }

    @Override
    public List<TeamResponse> getTeams(Long userId) {
        List<TeamVo> teams = teamMapper.findTeamByUserId(userId);
        return teams.stream().map(TeamResponse::from).toList();
    }

    // 팀 상세 조회
    @Override
    public TeamDetailResponse getTeamDetail(Long teamId) {
        // 1. 팀 기본 정보
        TeamVo teamVo = teamMapper.findTeamByTeamId(teamId);

        // 2. 팀 멤버 목록
        List<TeamMemberResponse> members = teamMemberMapper.findMembersByTeamId(teamId);

        // 3. 팀 보드 목록
        List<BoardVo> boardVoList = boardMapper.findBoardByTeamId(teamId);

        // 4. VO -> DTO 변환
        List<BoardResponse> boards = boardVoList.stream()
                .map(BoardResponse::from)
                .collect(Collectors.toList());

        // 4. 하나의 DTO로 묶기
        return TeamDetailResponse.of(teamVo, members, boards);
    }

    @Override
    public void updateTeam(Long teamId, UpdateTeamRequest req, Long userId) {
        TeamVo teamVo = req.teamVo(teamId);
        teamMapper.updateTeam(teamVo);
    }

    // 팀 삭제
    @Override
    public void deleteTeam(Long teamId, Long userId) {
        teamMapper.DeleteTeam(teamId);
    }
}
