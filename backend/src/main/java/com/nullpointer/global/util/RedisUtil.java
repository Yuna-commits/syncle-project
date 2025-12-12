package com.nullpointer.global.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class RedisUtil {

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    /**
     * String - 토큰, 인증코드
     */
    // 데이터 조회
    public String getData(String key) {
        return stringRedisTemplate.opsForValue().get(key);
    }

    // 데이터 저장 (+ 만료 시간 ms)
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

    /**
     * Set - 보드 접속자 관리
     */
    // 데이터 추가 (보드 입장)
    public void addSet(String key, String value) {
        stringRedisTemplate.opsForSet().add(key, value);
    }

    // 데이터 삭제 (보드 퇴장)
    public void removeSet(String key, String value) {
        stringRedisTemplate.opsForSet().remove(key, value);
    }

    // 데이터 조회 (접속자 목록)
    public Set<String> getSetMembers(String key) {
        return stringRedisTemplate.opsForSet().members(key);
    }

    // 키 만료 시간 설정
    public void expire(String key, int minutes) {
        stringRedisTemplate.expire(key, minutes, TimeUnit.MINUTES);
    }

    /**
     * List - 알림 저장용
     */

    // 리스트 앞쪽에 데이터 추가 (최신 알림이 0번)
    public <T> void addList(String key, T data, Long duration) {
        try {
            String value = objectMapper.writeValueAsString(data);
            stringRedisTemplate.opsForList().leftPush(key, value);

            // 만료 시간 갱신 (알림이 쌓일 때마다 수명 연장)
            if (duration != null) {
                stringRedisTemplate.expire(key, duration, TimeUnit.SECONDS);
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Redis 데이터 저장 실패 (JSON 변환 오류)", e);
        }
    }

    // 리스트 길이 제한 (오래된 알림 자동 삭제)
    // trimList(key, 0, 49) -> 최신 50개만 유지
    public void trimList(String key, int count) {
        stringRedisTemplate.opsForList().trim(key, 0, count - 1);
    }

    // 리스트 전체 조회
    public <T> List<T> getList(String key, Class<T> clazz) {
        List<String> jsonList = stringRedisTemplate.opsForList().range(key, 0, -1);
        if (jsonList == null || jsonList.isEmpty()) return List.of();

        return jsonList.stream().map(json -> {
            try {
                return objectMapper.readValue(json, clazz);
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Redis 데이터 조회 실패 (JSON 파싱 오류)", e);
            }
        }).toList();
    }

    // 리스트의 특정 인덱스 데이터 수정 (알림 읽음 처리용)
    public <T> void updateListIndex(String key, int index, T data) {
        try {
            String value = objectMapper.writeValueAsString(data);
            stringRedisTemplate.opsForList().set(key, index, value);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Redis 데이터 수정 실패 (JSON 변환 오류)", e);
        }
    }

}
