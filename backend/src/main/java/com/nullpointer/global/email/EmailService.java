package com.nullpointer.global.email;

import com.nullpointer.global.common.enums.VerificationType;

public interface EmailService {

    // 인증 코드 발송
    void sendVerificationEmail(String toEmail, String code, VerificationType type);

    // 인증 링크 발송
    void sendVerificationLink(String toEmail, String token);

    // 초대 링크 발송
    void sendInvitationEmail(String toEmail, String inviteUrl, String teamName, String inviterName);

    // 초대 알림 발송
    void sendActivityNotification(String toEmail, String subject, String message, String linkUrl);
    
}
