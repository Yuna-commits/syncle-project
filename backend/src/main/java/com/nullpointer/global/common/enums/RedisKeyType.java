package com.nullpointer.global.common.enums;

import lombok.Getter;

@Getter
public enum RedisKeyType {

    // Auth
    ACCESS_TOKEN("np:auth:access:%s", 3_600_000L), // 1시간
    REFRESH_TOKEN("np:auth:refresh:%s", 1_209_600_000L), // 2주
    BLACKLIST("np:auth:blacklist:%s", 0L),

    // Verification - 5분
    VERIFICATION_CODE("np:auth:code:%s:%s", 300_000L),

    // Password Reset - 10분
    PASSWORD_RESET_TOKEN("np:auth:pw-token:%s", 600_000L);

    private final String pattern;
    private final long defaultTtl;

    RedisKeyType(String pattern, long defaultTtl) {
        this.pattern = pattern;
        this.defaultTtl = defaultTtl;
    }

    /**
     * Redis Key 생성
     * ex) RedisKeyType.REFRESH_TOKEN.getKey(1L) -> "np:auth:refresh:1"
     */
    public String getKey(Object... args) {
        return String.format(pattern, args);
    }

}
