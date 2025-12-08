package com.nullpointer.global.security.jwt;

import com.nullpointer.global.common.enums.RedisKeyType;
import com.nullpointer.global.util.RedisUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// 토큰 정보 검사, SecurityContextHolder에 정보 기록
@Slf4j
@Component
@RequiredArgsConstructor
// OncePerRequestFilter : 하나의 요청 당 한 번만 필터링을 할 수 있도록 보장
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final RedisUtil redisUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 1) Authorization 헤더에서 JWT 추출
        String token = resolveToken(request);

        // 2) 토큰 유효성 검사
        if (token != null && jwtTokenProvider.validateToken(token)) {
            // 로그아웃 여부 확인
            String blacklistKey = RedisKeyType.BLACKLIST.getKey(token);

            if (!redisUtil.hasKey(blacklistKey)) {
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
            } else {
                log.warn("로그아웃된 토큰으로 접근 시도: {}", token);
            }
        }

        // 6) 다음 필터로 요청 전달
        filterChain.doFilter(request, response);
    }

    // 요청에서 토큰 추출
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(JwtConstants.AUTHORIZATION_HEADER.getValue());
        String prefix = JwtConstants.HEADER_PREFIX.getValue();

        if (StringUtils.hasText(bearerToken)
                && bearerToken.startsWith(prefix)) {
            // refactor)  매직 넘버 7 대신 prefix.length() 사용
            return bearerToken.substring(prefix.length());
        }

        return null;
    }
}
