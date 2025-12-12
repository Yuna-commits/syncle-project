package com.nullpointer.domain.socket;

import com.nullpointer.global.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Set;

@Controller
@RequiredArgsConstructor
public class SocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final RedisUtil redisUtil;

    private static final String PREFIX = "board:presence:";

    /**
     * 보드 입장 알림
     * - 클라이언트가 /app/board/{boardId}/enter 로 메시지를 보내면 실행
     */
    @MessageMapping("/board/{boardId}/enter")
    public void enterBoard(@DestinationVariable Long boardId, @Payload Long userId) {
        String key = PREFIX + boardId;

        // 접속 처리
        redisUtil.addSet(key, userId.toString());
        redisUtil.expire(key, 60); // 1시간 동안 활동 없으면 삭제

        // 접속자 목록 전송
        Set<String> users = redisUtil.getSetMembers(key);
        // 구독 토픽 : /topic/board/{boardId}/presence
        messagingTemplate.convertAndSend("/topic/board/" + boardId + "/presence", users);
    }

    /**
     * 보드 퇴장
     */
    @MessageMapping("/board/{boardId}/leave")
    public void leaveBoard(@DestinationVariable Long boardId, @Payload Long userId) {
        String key = PREFIX + boardId;

        // 퇴장 처리
        redisUtil.removeSet(key, userId.toString());

        // 갱신된 목록 전송
        Set<String> users = redisUtil.getSetMembers(key);
        messagingTemplate.convertAndSend("/topic/board/" + boardId + "/presence", users);
    }

}
