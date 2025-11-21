package com.nullpointer.domain.auth.service;

public interface EmailService {

    // 인증 이메일 발송
    void sendVerificationEmail(String toEmail, String token);

}
