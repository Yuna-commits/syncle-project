package com.nullpointer.domain.invitation.service;

import com.nullpointer.domain.invitation.dto.MyInvitationResponse;
import com.nullpointer.domain.invitation.dto.TeamInvitationResponse;
import com.nullpointer.domain.invitation.dto.TeamInviteRequest;

import java.util.List;

public interface InvitationService {
    void sendInvitation(Long teamId, TeamInviteRequest req, Long inviterId);

    void acceptInvitation(String token, Long userId);

    void rejectInvitation(String token, Long userId);

    List<TeamInvitationResponse> getSentInvitations(Long teamId, Long userId);

    List<MyInvitationResponse> getMyInvitations(Long userId);

    void removeInvitation(Long invitationId, Long userId);

    Long joinBoardByToken(String token, Long userId);
}
