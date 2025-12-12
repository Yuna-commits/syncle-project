package com.nullpointer.domain.socket.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SocketBoardMessage {
    private String type;    // 이벤트 타입 (예: "LIST_CREATE", "CARD_MOVE")
    private Long boardId;   // 변경된 보드 ID
    private Long senderId;  // 이벤트를 발생시킨 유저 ID (본인 화면 갱신 스킵용)
    private Object data;    // 변경된 데이터 (선택 사항, 프론트에서 낙관적 업데이트나 갱신에 사용)
}
