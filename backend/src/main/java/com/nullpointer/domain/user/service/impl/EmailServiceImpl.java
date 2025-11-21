package com.nullpointer.domain.user.service.impl;

import com.nullpointer.domain.user.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.verify-base-url}")
    private String verifyBaseUrl;

    @Override
    public void sendVerificationEmail(String toEmail, String token) {
        String subject = "[SYNCLE] 이메일 인증 안내";

        // /api/auth/email-verify?token=xxx
        String verifyLink = verifyBaseUrl + "?token=" + token;

        String text = """
                안녕하세요. SYNCLE 입니다.
                
                아래 링크를 클릭하여 이메일 인증을 완료해 주세요.
                
                감사합니다.
                
                %s
                """.formatted(verifyLink);

        // 순수 텍스트 메일 (Plain Text) 형태
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(text);

        // SMTP 서버와 연결되어 이메일 전송
        mailSender.send(message);
    }

}
