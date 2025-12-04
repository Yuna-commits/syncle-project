package com.nullpointer.domain.board.dto.response;

import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.domain.board.vo.enums.Visibility;
import com.nullpointer.domain.list.dto.ListWithCardsResponse;
import com.nullpointer.domain.member.dto.board.BoardMemberResponse;
import com.nullpointer.domain.member.dto.team.TeamMemberResponse;
import com.nullpointer.domain.member.vo.enums.Role;
import lombok.Builder;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Builder
public class BoardViewResponse {
    private Long id;
    private String title;
    private String description;
    private Visibility visibility;
    private Long ownerId;

    // 네비게이션 용 팀 정보
    private Long teamId;
    private String teamName;

    // 리스트 목록 (카드 포함)
    private List<ListWithCardsResponse> lists;

    // 멤버 정보
    private List<BoardMemberResponse> boardMembers;
    private List<TeamMemberResponse> teamMembers;

    // 로그인한 사용자의 즐겨찾기 여부
    private Boolean isFavorite;

    public static BoardViewResponse of(BoardVo board,
                                       List<ListWithCardsResponse> lists,
                                       List<BoardMemberResponse> boardMembers,
                                       List<TeamMemberResponse> teamMembers,
                                       boolean isFavorite) {
        Long ownerId = boardMembers.stream()
                .filter(m -> m.getRole() == Role.OWNER)
                .map(BoardMemberResponse::getUserId)
                .findFirst()
                .orElse(null);

        return BoardViewResponse.builder()
                .id(board.getId())
                .title(board.getTitle())
                .description(board.getDescription())
                .visibility(board.getVisibility())
                .ownerId(ownerId)
                .teamId(board.getTeamId())
                .teamName(board.getTeamName())
                .lists(lists != null ? lists : new ArrayList<>())
                .boardMembers(boardMembers)
                .teamMembers(teamMembers)
                .isFavorite(isFavorite)
                .build();
    }
}