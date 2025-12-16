package com.nullpointer.global.common.enums;

import lombok.Getter;

@Getter
public enum RedisKeyType {

    // 인증 토큰
    REFRESH_TOKEN("np:auth:refresh:%s", 60 * 60 * 24 * 14L), // 2주
    BLACKLIST("np:auth:blacklist:%s", 0L),

    // 이메일 인증 코드/링크
    VERIFICATION_CODE("np:auth:code:%s:%s", 60 * 5L), // 5분
    EMAIL_LINK_TOKEN("np:auth:link:%s", 60 * 30L), // 30분

    // 비밀번호 재설정 - 5분
    PASSWORD_RESET_TOKEN("np:auth:pw-token:%s", 60 * 5L),

    // 팀 초대 - 7일
    INVITATION("np:team:invitation:%s", 60 * 60 * 24 * 7L),

    // 알림 - 30일
    NOTIFICATION("np:notification:%s", 60 * 60 * 24 * 30L),

    // 마감 임박 알림 발송 여부 확인 - 2일
    // 중복 알림 발송하지 않기 위해 사용
    DEADLINE_ALERT("np:notification:deadline:%s", 60 * 60 * 48L);

    private final String prefix;
    private final long defaultTtl;

    RedisKeyType(String prefix, long defaultTtl) {
        this.prefix = prefix;
        this.defaultTtl = defaultTtl;
    }

    /**
     * Redis Key 생성
     * ex) RedisKeyType.REFRESH_TOKEN.getKey(1L) -> "np:auth:refresh:1"
     */
    public String getKey(Object... args) {
        return String.format(prefix, args);
    }

}
