package com.nullpointer.global.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

// 토큰 정보 검사, SecurityContextHolder에 정보 기록
@Component
@RequiredArgsConstructor
// OncePerRequestFilter : 하나의 요청 당 한 번만 필터링을 할 수 있도록 보장
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // 1) Authorization 헤더에서 JWT 추출
        String authHeader = request.getHeader("Authorization");

        // 2) 토큰이 없거나 "Bearer"로 시작하지 않으면 다음 필터로 넘김
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3) "Bearer" 이후의 토큰만 추출
        String token = authHeader.substring(7);

        // 4) 토큰 유효성 검사
        if (!jwtTokenProvider.validateToken(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        // -- 유효한 토큰 --
        // 5) 토큰에서 userId, email 추출
        Long userId = jwtTokenProvider.getUserId(token);
        String email = jwtTokenProvider.getEmail(token);

        CustomUserDetails userDetails = new CustomUserDetails(userId, email);

        // 6) 인증 객체 생성
        // UserDetails(세션 기반 인증) 사용 x, Authentication 직접 생성
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        Collections.emptyList()
                );

        // 7) SecurityContextHolder에 인증 정보 저장
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 8) 다음 필터로 요청 전달
        filterChain.doFilter(request, response);
    }
}
