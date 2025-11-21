package com.nullpointer.domain.auth.service;

public interface RefreshTokenService {

    // Redis에 RefreshToken 저장
    void saveRefreshToken(Long userId, String refreshToken, Long expiration);

    // userId 조회
    Long getUserIdByRefreshToken(String refreshToken);

    // RefreshToken 삭제
    void deleteRefreshToken(String refreshToken);

}
