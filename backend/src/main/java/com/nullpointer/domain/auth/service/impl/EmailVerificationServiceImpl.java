package com.nullpointer.domain.auth.service.impl;

import com.nullpointer.domain.auth.service.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class EmailVerificationServiceImpl implements EmailVerificationService {

    // String {key(token) : value(userId)}
    private final StringRedisTemplate stringRedisTemplate;

    @Value("${app.email.verification-expiration-millis}")
    private long verificationExpirationMillis; // 유효 시간

    private static final String PREFIX = "email:verify:";

    /**
     * 이메일 인증 토큰 저장
     * ex) email:verify:<token>:uid → "1" (userId)
     * ex) email:verify:<token>:exp → expireTimestamp(ms)
     */
    @Override
    public void saveToken(String token, Long userId) {
        LocalDateTime expiresAt = LocalDateTime.now().plus(Duration.ofMillis(verificationExpirationMillis)); //토큰의 만료 시간 저장

        String keyUser = PREFIX + token + ":uid";
        String keyExp = PREFIX + token + ":exp";

        // userId 저장
        stringRedisTemplate.opsForValue().set(
                keyUser,
                String.valueOf(userId),
                verificationExpirationMillis,
                TimeUnit.MILLISECONDS
        );

        // expiresAt 저장
        stringRedisTemplate.opsForValue().set(
                keyExp,
                expiresAt.toString(), // "2025-11-21T09:31:15.123"
                verificationExpirationMillis,
                TimeUnit.MILLISECONDS
        );
    }

    // 토큰으로 userId 조회
    @Override
    public Long getUserIdByToken(String token) {
        String key = PREFIX + token + ":uid";
        String value = stringRedisTemplate.opsForValue().get(key);

        return value != null ? Long.valueOf(value) : null;
    }

    // 토큰 만료 시간 조회
    @Override
    public LocalDateTime getExpireTimeByToken(String token) {
        String key = PREFIX + token + ":exp";
        String value = stringRedisTemplate.opsForValue().get(key);

        return value != null ? LocalDateTime.parse(value) : null;
    }

    // 인증 완료 후 Redis에서 데이터 삭제
    @Override
    public void deleteToken(String token) {
        String keyUser = PREFIX + token + ":uid";
        String keyExp = PREFIX + token + ":exp";

        stringRedisTemplate.delete(keyUser);
        stringRedisTemplate.delete(keyExp);
    }

}
