package com.nullpointer.global.util;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class RedisUtil {

    // 이메일 인증용
    private final StringRedisTemplate stringRedisTemplate;

    // 데이터 조회
    public String getData(String key) {
        return stringRedisTemplate.opsForValue().get(key);
    }

    // 데이터 저장 (+ TTL)
    public void setDataExpire(String key, String value, Long duration) {
        Duration expireDuration = Duration.ofMillis(duration);
        stringRedisTemplate.opsForValue().set(key, value, expireDuration);
    }

    // 데이터 삭제
    public void deleteData(String key) {
        stringRedisTemplate.delete(key);
    }

    public boolean hasKey(String key) {
        return stringRedisTemplate.hasKey(key);
    }

}
