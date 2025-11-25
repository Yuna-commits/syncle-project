package com.nullpointer.domain.member.dto.board;

import com.nullpointer.domain.member.vo.BoardMemberVo;
import com.nullpointer.domain.member.vo.enums.Role;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BoardRoleUpdateRequest {
    private Role role;

    public BoardMemberVo toVo(Long boardId, Long memberId) {
        return BoardMemberVo.builder()
                .boardId(boardId)
                .userId(memberId)
                .role(this.role)
                .build();
    }

}
