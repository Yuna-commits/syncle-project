package com.nullpointer.domain.invitation.service.impl;

import com.nullpointer.domain.invitation.service.InvitationEmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvitationEmailServiceImpl implements InvitationEmailService {
    private final JavaMailSender mailSender;

    /**
     * 초대 이메일 발송
     *
     * @param toEmail     수신자 이메일
     * @param inviteUrl   프론트엔드 초대 수락 페이지 URL (토큰 포함)
     * @param teamName    초대된 팀 이름
     * @param inviterName 초대한 사람의 이름(닉네임)
     */
    @Override
    @Async
    public void sendInvitationEmail(String toEmail, String inviteUrl, String teamName, String inviterName) {
        String subject = String.format("[SYNCLE] '%s' 팀에서 초대장이 도착했습니다.", teamName);
        String htmlContent = getInvitationHtml(teamName, inviterName, inviteUrl);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // HTML 모드 활성화

            mailSender.send(mimeMessage);
            log.info("초대 메일 발송 성공: {} (Team: {})", toEmail, teamName);

        } catch (MessagingException e) {
            log.error("초대 메일 발송 실패: {}", e.getMessage());
            // 비동기 메서드라 예외를 던져도 Controller에서 잡을 수 없으므로 로그만 남기거나 별도 처리
        }
    }

    private String getInvitationHtml(String teamName, String inviterName, String inviteUrl) {
        return """
                 <!DOCTYPE html>
                 <html lang="ko">
                 <head>
                     <meta charset="UTF-8">
                     <meta name="viewport" content="width=device-width, initial-scale=1.0">
                     <title>팀 초대</title>
                 </head>
                 <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;">
                \s
                     <div style="background-color: #f9fafb; padding: 40px 20px; text-align: center;">
                \s
                         <div style="
                             max-width: 480px;
                             margin: 0 auto;
                             background-color: #ffffff;
                             border-radius: 8px;
                             border: 1px solid #e5e7eb;
                             padding: 40px 32px;
                             box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                             text-align: left;
                         ">
                             <h1 style="
                                 color: #111827;
                                 font-size: 24px;
                                 font-weight: bold;
                                 margin: 0 0 8px 0;
                             ">
                                 Syncle
                             </h1>
                \s
                             <div style="
                                 width: 100%%;
                                 height: 1px;
                                 background-color: #e5e7eb;
                                 margin: 24px 0;
                             "></div>
                \s
                             <p style="
                                 color: #374151;
                                 font-size: 16px;
                                 line-height: 24px;
                                 margin-bottom: 24px;
                             ">
                                 안녕하세요!<br>
                                 <strong>%s</strong>님이 회원님을 <strong>'%s'</strong> 팀으로 초대했습니다.<br>
                                 아래 버튼을 클릭하여 초대를 수락하고 협업을 시작하세요.
                             </p>
                \s
                             <div style="text-align: center; margin: 32px 0;">
                                 <a href="%s" target="_blank" style="
                                     display: inline-block;
                                     background-color: #3b82f6;
                                     color: #ffffff;
                                     font-size: 16px;
                                     font-weight: 600;
                                     text-decoration: none;
                                     padding: 14px 32px;
                                     border-radius: 6px;
                                     transition: background-color 0.2s;
                                     box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
                                 ">
                                     초대 수락하기
                                 </a>
                             </div>
                \s
                             <p style="
                                 color: #6b7280;
                                 font-size: 14px;
                                 line-height: 20px;
                                 margin-top: 32px;
                                 text-align: center;
                             ">
                                 이 초대 링크는 <strong>7일간</strong> 유효합니다.<br>
                                 본인이 초대받지 않았다면 이 메일을 무시해주세요.
                             </p>
                         </div>
                \s
                         <div style="margin-top: 24px; text-align: center;">
                             <p style="color: #9ca3af; font-size: 12px;">&copy; 2025 Syncle Team. All rights reserved.</p>
                         </div>
                \s
                     </div>
                 </body>
                 </html>
                \s""".formatted(inviterName, teamName, inviteUrl);
    }

}
