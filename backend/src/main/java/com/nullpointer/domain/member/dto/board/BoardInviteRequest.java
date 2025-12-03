package com.nullpointer.domain.member.dto.board;

import com.nullpointer.domain.member.vo.BoardMemberVo;
import com.nullpointer.domain.member.vo.enums.Role;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder

public class BoardInviteRequest {
    private Long boardId;
    private List<Long> userIds;
    private Role role;

    public BoardMemberVo toVo(Long boardId, Long userId) {
        return BoardMemberVo.builder()
                .boardId(boardId)
                .userId(userId)
                .role(this.role != null ? this.role : Role.MEMBER)
                .build();
    }
}
