package com.nullpointer.domain.user.service;

import java.time.LocalDateTime;

public interface EmailVerificationService {

    // Redis에 토큰 저장
    void saveToken(String token, Long userId);

    // userId 조회
    Long getUserIdByToken(String token);

    // 만료 시간 조회
    LocalDateTime getExpireTimeByToken(String token);

    // 인증 완료 후 Redis에서 토큰 삭제
    void deleteToken(String token);

}
