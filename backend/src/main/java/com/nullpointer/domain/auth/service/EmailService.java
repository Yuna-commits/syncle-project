package com.nullpointer.domain.auth.service;

import com.nullpointer.global.common.enums.VerificationType;

public interface EmailService {

    // 인증 이메일 발송
    void sendVerificationEmail(String toEmail, String code, VerificationType type);

}
