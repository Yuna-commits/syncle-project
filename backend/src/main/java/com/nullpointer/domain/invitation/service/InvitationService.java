package com.nullpointer.domain.invitation.service;

import com.nullpointer.domain.invitation.dto.TeamInviteRequest;

public interface InvitationService {
    void sendInvitation(Long teamId, TeamInviteRequest req, Long inviterId);

    void acceptInvitation(String token, Long userId);

    void rejectInvitation(String token, Long userId);
}
