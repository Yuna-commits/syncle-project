package com.nullpointer.global.common;

import com.nullpointer.domain.socket.dto.SocketBoardMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SocketSender {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendSocketMessage(Long boardId, String type, Long senderId, Object data) {
        SocketBoardMessage message = SocketBoardMessage.builder()
                .type(type)
                .boardId(boardId)
                .senderId(senderId)
                .data(data)
                .build();
        messagingTemplate.convertAndSend("/topic/board/" + boardId, message);
    }
}
