package com.nullpointer.domain.auth.helper;

import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.common.enums.RedisKeyType;
import com.nullpointer.global.common.enums.VerificationType;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

/**
 * 인증 코드 통합 관리
 */
@Component
@RequiredArgsConstructor
public class VerificationCodeHelper {

    private final RedisUtil redisUtil;
    private static final SecureRandom random = new SecureRandom();

    /**
     * 6자리 인증코드 생성, Redis 저장
     */
    public String generateAndSaveCode(String email, VerificationType type) {
        String code = String.format("%06d", random.nextInt(1000000));
        String redisKey = RedisKeyType.VERIFICATION_CODE.getKey(type, email);

        redisUtil.setDataExpire(redisKey, code, RedisKeyType.VERIFICATION_CODE.getDefaultTtl());

        return code;
    }

    /**
     * 인증코드 검증
     */
    public void verifyCode(String email, String inputCode, VerificationType type) {
        String redisKey = RedisKeyType.VERIFICATION_CODE.getKey(type, email);
        String savedCode = redisUtil.getData(redisKey);

        // 인증코드 검증
        if (savedCode == null) {
            throw new BusinessException(ErrorCode.EXPIRED_VERIFICATION_TOKEN);
        }

        if (!savedCode.equals(inputCode)) {
            throw new BusinessException(ErrorCode.INVALID_VERIFICATION_TOKEN);
        }

        // 재사용 방지를 위해 검증에 성공하면 코드 삭제
        redisUtil.deleteData(redisKey);
    }

}
