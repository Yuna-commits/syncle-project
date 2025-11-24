package com.nullpointer.domain.auth.service.impl;

import com.nullpointer.domain.auth.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.verify-base-url}")
    private String verifyBaseUrl;

    /**
     * HTML 형식을 지원하는 MimeMessage 전송
     */
    @Async // 메일 전송 때문에 회원가입 응답이 느려지는 것을 방지하기 위해 비동기 처리
    @Override
    public void sendVerificationEmail(String toEmail, String token) {
        // /api/auth/email-verify?token=xxx
        String url = verifyBaseUrl + "?token=" + token;

        String htmlContent = getVerificationHtml(url);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();

            // Helper (true: 멀티파트 모드-이미지/파일 첨부 가능)
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("[SYNCLE] 회원가입 인증을 완료해주세요");

            // HTML 설정 (true: html 모드 활성화)
            helper.setText(htmlContent, true);

            // 메일 전송
            mailSender.send(mimeMessage);
            log.info("인증 메일 발송 성공: {}", toEmail);
        } catch (MessagingException e) {
            log.error("메일 생성 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    private String getVerificationHtml(String url) {
        return """
                 <!DOCTYPE html>
                 <html lang="ko">
                 <head>
                     <meta charset="UTF-8">
                     <meta name="viewport" content="width=device-width, initial-scale=1.0">
                     <title>이메일 인증</title>
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
                                 NullPointer
                             </h1>
                \s
                             <div style="
                                 width: 100%%;\s
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
                                 <strong>SYNCLE</strong> 협업 플랫폼 가입을 환영합니다.<br>
                                 아래 버튼을 클릭하여 이메일 인증을 완료하고 계정을 활성화해주세요.
                             </p>
                \s
                             <div style="text-align: center; margin: 32px 0;">
                                 <a href="%s" target="_blank" style="
                                     display: inline-block;
                                     background-color: #3b82f6;
                                     color: #ffffff;
                                     font-size: 14px;
                                     font-weight: 500;
                                     text-decoration: none;
                                     padding: 12px 24px;
                                     border-radius: 8px;
                                     box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                                 ">
                                     이메일 인증하기
                                 </a>
                             </div>
                \s
                             <p style="
                                 color: #6b7280;
                                 font-size: 13px;
                                 line-height: 20px;
                                 margin-top: 32px;
                                 word-break: break-all;
                             ">
                                 만약 버튼이 작동하지 않는다면 아래 링크를 복사하여 브라우저에 붙여넣어 주세요:<br>
                                 <a href="%s" style="color: #3b82f6; text-decoration: underline;">%s</a>
                             </p>
                         </div>
                \s
                         <div style="margin-top: 24px; text-align: center;">
                             <p style="color: #9ca3af; font-size: 12px;">&copy; 2025 NullPointer Team. All rights reserved.</p>
                         </div>
                \s
                     </div>
                 </body>
                 </html>
                \s""".formatted(url, url, url);
    }

}
