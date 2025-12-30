package com.nullpointer.global.config;

import com.nullpointer.global.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * 토픽 설계 예시 -> 토픽을 구독하는 모든 클라이언트에 브로드 캐스트 전송
     * 1. /user/queue/notifications 개인 알림
     * 2. /topic/board/{boardId} 보드 협업
     * 3. /topic/chat/{teamId} 팀 채팅
     * 4. /topic/presence/{boardId} 접속 상태
     * ...
     */

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                // CONNECT 명령어일 때 토큰 검사
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    // 헤더에서 토큰 추출
                    String authHeader = accessor.getFirstNativeHeader("Authorization");

                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);

                        // 토큰 검증, Authentication 객체 생성
                        if (jwtTokenProvider.validateToken(token)) {
                            Authentication auth = jwtTokenProvider.getAuthentication(token);
                            // 소켓 세션에 principal 등록
                            accessor.setUser(auth);
                        }
                    }
                }
                return message;
            }
        });
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 구독 경로: 클라이언트가 듣는 곳
        // /topic: 1:N 방송 (구독한 모든 사용자에게)
        // /queue: 1:1 메시지 (특정 사용자에게)
        registry.enableSimpleBroker("/topic", "/queue");

        // 발행 경로: 클라이언트가 서버로 보낼 때 (/app/...)
        registry.setApplicationDestinationPrefixes("/app");

        // 개인화 메시지(멘션) 경로
        registry.setUserDestinationPrefix("/user");
    }

    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 클라이언트가 웹소켓 연결을 시작할 엔드포인트
        registry.addEndpoint("/ws") // ws://localhost:8080/ws
                .setAllowedOrigins("*"); // 프론트엔드 origin 허용
//                .withSockJS();
    }
}
