package com.nullpointer.domain.team.dto.response;

import com.nullpointer.domain.board.dto.response.BoardResponse;
import com.nullpointer.domain.member.dto.team.TeamMemberResponse;
import com.nullpointer.domain.member.vo.enums.Role;
import com.nullpointer.domain.team.vo.TeamVo;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class TeamDetailResponse {
    // 팀 정보
    private long  id;
    private String name;
    private String description;
    private Role boardCreateRole;


    // 멤버 목록
    private List<TeamMemberResponse> members;
    private int memberCount; // 팀 멤버 인원수
    
    // 보드 목록
    private List<BoardResponse> boards;

    public static TeamDetailResponse of(TeamVo vo,
                                        List<TeamMemberResponse> members,
                                        List<BoardResponse> boards) {
        return TeamDetailResponse.builder()
                .id(vo.getId())
                .name(vo.getName())
                .description(vo.getDescription())
                .boardCreateRole(vo.getBoardCreateRole())
                .members(members)
                .memberCount(members.size())
                .boards(boards)
                .build();
    }
}
