package com.nullpointer.global.common;

import com.nullpointer.domain.socket.dto.SocketMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SocketSender {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendGlobalSocketMessage(String receiverEmail, String type, Long senderId, String message, Object data) {
        SocketMessage socketMessage = SocketMessage.builder()
                .type(type)
                .senderId(senderId)
                .message(message)
                .data(data)
                .build();

        // /user/{receiverEmail}/queue/notifications
        // 프론트엔드에서 /user/queue/notifications 구독
        messagingTemplate.convertAndSendToUser(receiverEmail, "/queue/notifications", socketMessage);
    }

    public void sendTeamSocketMessage(Long teamId, String type, Long senderId, Object data) {
        SocketMessage socketMessage = SocketMessage.builder()
                .type(type)
                .teamId(teamId)
                .senderId(senderId)
                .data(data)
                .build();

        messagingTemplate.convertAndSend("/topic/team/" + teamId, socketMessage);
    }

    public void sendSocketMessage(Long boardId, String type, Long senderId, Object data) {
        SocketMessage socketMessage = SocketMessage.builder()
                .type(type)
                .boardId(boardId)
                .senderId(senderId)
                .data(data)
                .build();
        messagingTemplate.convertAndSend("/topic/board/" + boardId, socketMessage);
    }
}
