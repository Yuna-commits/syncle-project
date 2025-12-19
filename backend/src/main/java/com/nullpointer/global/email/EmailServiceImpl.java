package com.nullpointer.global.email;

import com.nullpointer.global.common.enums.VerificationType;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.domain.frontend.url}")
    private String frontendUrl;

    /**
     * 인증번호 발송 (회원가입, 비밀번호 재설정)
     */
    @Async // 메일 전송 때문에 회원가입 응답이 느려지는 것을 방지하기 위해 비동기 처리
    @Override
    public void sendVerificationEmail(String toEmail, String code, VerificationType type) {
        String subject = (type == VerificationType.SIGNUP)
                ? "[SYNCLE] 회원가입 인증번호"
                : "[SYNCLE] 비밀번호 재설정 인증번호";

        String content = "안녕하세요!<br><strong>SYNCLE</strong>입니다.<br>요청하신 인증번호를 확인해주세요.";

        // 인증번호 박스 HTML
        String actionHtml = """
                <span style="background-color: #eff6ff; color: #3b82f6; font-size: 32px; font-weight: 700; padding: 16px 24px; border-radius: 8px; letter-spacing: 6px; display: inline-block;">
                    %s
                </span>
                """.formatted(code);

        String footer = "인증번호는 5분간 유효합니다.";

        String html = buildHtmlTemplate("SYNCLE", content, actionHtml, footer);
        // MimeMessage 전송
        sendMimeMessage(toEmail, subject, html);
    }

    /**
     * 이메일 재인증 링크 발송
     */
    @Async
    @Override
    public void sendVerificationLink(String toEmail, String token) {
        String subject = "[SYNCLE] 이메일 재인증 링크";
        String linkUrl = frontendUrl + "/auth/verify-email?token=" + token;

        String content = "안녕하세요!<br>아래 버튼을 클릭하여 이메일 인증을 완료해주세요.";
        String actionHtml = getButtonHtml(linkUrl, "이메일 인증하기");
        String footer = "인증 링크는 30분간 유효합니다.";

        String html = buildHtmlTemplate("SYNCLE", content, actionHtml, footer);
        sendMimeMessage(toEmail, subject, html);
    }

    /**
     * 팀 초대장 발송
     * - 실패 시 2초 간격으로 최대 3회 재시도
     */
    @Override
    @Async("mailExecutor") // refactor) 스레드 개수 제한
    @Retryable(retryFor = MessagingException.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void sendInvitationEmail(String toEmail, String inviteUrl, String teamName, String inviterName) {
        String subject = String.format("[SYNCLE] '%s' 팀에서 초대장이 도착했습니다.", teamName);

        String content = String.format(
                "<strong>%s</strong>님이 회원님을 <strong>'%s'</strong> 팀으로 초대했습니다.",
                inviterName, teamName
        );
        String actionHtml = getButtonHtml(inviteUrl, "초대 수락하기");
        String footer = "초대 링크는 7일간 유효합니다.";

        String html = buildHtmlTemplate(teamName + "팀 초대", content, actionHtml, footer);
        sendMimeMessage(toEmail, subject, html);
    }

    /**
     * 활동 알림 발송 (멘션, 담당자 지정)
     */
    @Override
    @Async("mailExecutor")
    public void sendActivityNotification(String toEmail, String subject, String message, String linkUrl) {
        /**
         * 배포 시 URL 수정 필요
         */
        String fullUrl = frontendUrl + linkUrl;

        String actionHtml = getButtonHtml(fullUrl, "확인하러 가기");
        String footer = "본 메일은 수신 동의한 회원에게 발송됩니다.<br>알림 설정을 변경하시려면 마이페이지를 방문해주세요.";

        String html = buildHtmlTemplate("SYNCLE 알림", message, actionHtml, footer);
        sendMimeMessage(toEmail, subject, html);
    }

    /**
     * Helper Methods
     */

    // 공통 MimeMessage 전송
    private void sendMimeMessage(String toEmail, String subject, String htmlContent) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            // Helper (true: 멀티파트 모드-이미지/파일 첨부 가능)
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject(subject);
            // HTML 설정 (true: html 모드 활성화)
            helper.setText(htmlContent, true);

            // 메일 전송
            mailSender.send(mimeMessage);
            log.info("인증 메일 발송 성공: {}", toEmail);
        } catch (MessagingException e) {
            log.error("메일 생성 중 오류 발생: {}", e.getMessage());
        }
    }

    // 공통 HTML 템플릿 생성
    private String buildHtmlTemplate(String title, String content, String actionHtml, String footer) {
        return """
                 <!DOCTYPE html>
                 <html lang="ko">
                 <head>
                     <meta charset="UTF-8">
                     <meta name="viewport" content="width=device-width, initial-scale=1.0">
                 </head>
                 <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Apple SD Gothic Neo', sans-serif;">
                     <div style="width: 100%%; padding: 40px 0; text-align: center;">
                         <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 10px; border: 1px solid #e5e7eb; text-align: left; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                
                             <h1 style="color: #1f2937; font-size: 24px; font-weight: bold; margin: 0 0 24px 0;">%s</h1>
                
                             <div style="width: 100%%; height: 1px; background-color: #e5e7eb; margin-bottom: 24px;"></div>
                
                             <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                                 %s
                             </p>
                
                             <div style="text-align: center; margin-bottom: 32px;">
                                 %s
                             </div>
                
                             <div style="width: 100%%; height: 1px; background-color: #e5e7eb; margin-bottom: 24px;"></div>
                
                             <p style="color: #9ca3af; font-size: 13px; text-align: center; line-height: 1.5; margin: 0;">
                                 %s
                             </p>
                         </div>
                
                         <div style="margin-top: 24px; color: #9ca3af; font-size: 12px;">
                            &copy; 2025 Syncle Team. All rights reserved.
                         </div>
                     </div>
                 </body>
                 </html>
                """.formatted(title, content, actionHtml, footer);
    }

    // 공통 버튼 HTML 생성
    private String getButtonHtml(String url, String text) {
        return """
                <a href="%s" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background-color 0.2s;">
                    %s
                </a>
                """.formatted(url, text);
    }

}
