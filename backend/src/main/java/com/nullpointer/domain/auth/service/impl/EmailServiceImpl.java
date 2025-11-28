package com.nullpointer.domain.auth.service.impl;

import com.nullpointer.domain.auth.service.EmailService;
import com.nullpointer.global.common.enums.VerificationType;
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
     * 인증링크 -> 인증번호 전송으로 변경
     * 비밀번호 재설정에도 재사용 가능
     */
    @Async // 메일 전송 때문에 회원가입 응답이 느려지는 것을 방지하기 위해 비동기 처리
    @Override
    public void sendVerificationEmail(String toEmail, String code, VerificationType type) {
        String subject = (type == VerificationType.SIGNUP)
                ? "[SYNCLE] 회원가입 인증번호"
                : "[SYNCLE] 비밀번호 재설정 인증번호";

        String htmlContent = getVerificationHtml(subject, code);

        // MimeMessage 전송
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
            throw new RuntimeException(e);
        }
    }

    private String getVerificationHtml(String subject, String code) {
        return """
                 <!DOCTYPE html>
                 <html lang="ko">
                 <head>
                     <meta charset="UTF-8">
                     <meta name="viewport" content="width=device-width, initial-scale=1.0">
                     <title>%s</title>
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
                                 <strong>SYNCLE</strong>입니다.<br>
                                 요청하신 인증번호를 확인해주세요.
                             </p>
                \s
                             <div style="text-align: center; margin: 32px 0;">
                                 <span style="
                                     display: inline-block;
                                     background-color: #eff6ff;
                                     color: #3b82f6;
                                     font-size: 32px;
                                     font-weight: 700;
                                     letter-spacing: 6px;
                                     padding: 16px 24px;
                                     border-radius: 8px;
                                     border: 1px solid #dbeafe;
                                 ">
                                     %s
                                 </span>
                             </div>
                \s
                             <p style="
                                 color: #6b7280;
                                 font-size: 14px;
                                 line-height: 20px;
                                 margin-top: 32px;
                                 text-align: center;
                             ">
                                 인증번호는 <strong>5분간</strong> 유효합니다.<br>
                                 본인이 요청하지 않았다면 이 메일을 무시해주세요.
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
                \s""".formatted(subject, code);
    }

}
