package com.nullpointer.domain.socket.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL) // 값이 null인 필드는 제외
public class SocketMessage {
    private String type;    // 이벤트 타입 (예: "LIST_CREATE", "CARD_MOVE")
    private Long boardId;   // 보드 관련 이벤트일 때만 값 존재
    private Long teamId;    // 팀 관련 이벤트일 때만 값 존재

    private Long senderId;  // 이벤트를 발생시킨 유저 ID (본인 화면 갱신 스킵용)

    private Object data;    // 변경된 데이터 (선택 사항, 프론트에서 낙관적 업데이트나 갱신에 사용)

    private String message; // 알림 메시지
}
