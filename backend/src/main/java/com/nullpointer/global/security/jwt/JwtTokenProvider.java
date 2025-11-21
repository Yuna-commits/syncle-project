package com.nullpointer.global.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

// JWT 생성, 정보 추출, 검증
@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String secretKey;

    @Value("${app.jwt.access-expiration}")
    private Long accessTokenExpiration;

    @Value("${app.jwt.refresh-expiration}")
    private Long refreshTokenExpiration; // 5분 -> 나중에 수정 필요!!!!!

    private Key key;

    @PostConstruct // 빈 초기화 시점에 한 번만 실행
    public void init() {
        // secretKey -> Key 객체로 변환
        key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    // AccessToken 생성
    public String createAccessToken(Long userId, String email) {
        // payload(claims)에 사용자 정보를 담아 API 인증에 사용
        return Jwts
                .builder()
                .setSubject("ACCESS")
                .claim("userId", userId)
                .claim("email", email)
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // RefreshToken 생성 -> Redis에 저장
    public String createRefreshToken(Long userId) {
        // AccessToken 갱신을 위해 사용
        return Jwts
                .builder()
                .setSubject("REFRESH")
                .claim("userId", userId)
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 토큰에서 Claims 추출 -> 유효하지 않은 토큰이면 예외 발생
    public Claims parseToken(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(key) // 서명 검증 키 지정
                .build()
                .parseClaimsJws(token) // 토큰 파싱 + 서명 검증
                .getBody();
    }

    // JWT 유효성 검증
    public boolean validateToken(String token) { // token : 클라이언트가 보낸 JWT
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            return false; // 검증 실패 -> {서명 불일치 / 만료된 토큰 / 변조된 토큰 / ...}
        }
    }

    // JWT에서 userId 추출
    public Long getUserId(String token) {
        // API 인증 시 SecurityContextHolder에 담을 사용자 정보로 사용
        return parseToken(token).get("userId", Long.class);
    }

    // JWT에서 email 추출
    public String getEmail(String token) {
        return parseToken(token).get("email", String.class);
    }

}
