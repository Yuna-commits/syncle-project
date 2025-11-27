package com.nullpointer.domain.invitation.mapper;

import com.nullpointer.domain.invitation.vo.InvitationVo;
import com.nullpointer.domain.invitation.vo.enums.Status;
import io.lettuce.core.dynamic.annotation.Param;

import java.util.Optional;

public interface InvitationMapper {
    // 초대장 생성
    void insertInvitation(InvitationVo invitationVo);

    // 토큰으로 초대장 조회
    Optional<InvitationVo> findByToken(String token);

    //  ID로 초대장 조회
    Optional<InvitationVo> findById(Long id);

    // 상태 변경 (수락/거절/만료)
    void updateStatus(InvitationVo invitationVo);

    // 중복 초대 방지를 위한 존재 여부 확인
    boolean existsByTeamIdAndInviteeIdAndStatus(
            @Param("teamId") Long teamId,
            @Param("inviteeId") Long inviteeId,
            @Param("status") Status status
    );
}