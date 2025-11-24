package com.nullpointer.global.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// 토큰 정보 검사, SecurityContextHolder에 정보 기록
@Component
@RequiredArgsConstructor
// OncePerRequestFilter : 하나의 요청 당 한 번만 필터링을 할 수 있도록 보장
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 1) Authorization 헤더에서 JWT 추출
        String token = resolveToken(request);

        // 2) 토큰 유효성 검사
        if (token != null && jwtTokenProvider.validateToken(token)) {
            // 3) 토큰에서 userId, email 추출
            Long userId = jwtTokenProvider.getUserId(token);
            String email = jwtTokenProvider.getEmail(token);

            // 4) UserDetails 생성
            UserDetails userDetails = new CustomUserDetails(userId, email);

            // 5) SecurityContext 인증 객체 저장
            Authentication authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 6) 다음 필터로 요청 전달
        filterChain.doFilter(request, response);
    }

    // 요청에서 토큰 추출
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(JwtConstants.AUTHORIZATION_HEADER.getValue());

        if (StringUtils.hasText(bearerToken)
                && bearerToken.startsWith(JwtConstants.HEADER_PREFIX.getValue())) {
            return bearerToken.substring(7);
        }

        return null;
    }
}
