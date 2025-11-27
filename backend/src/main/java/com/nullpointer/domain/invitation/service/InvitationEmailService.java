package com.nullpointer.domain.invitation.service;

public interface InvitationEmailService {

    void sendInvitationEmail(String toEmail, String inviteUrl, String teamName, String inviterName);

}
