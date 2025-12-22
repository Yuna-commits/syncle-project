package com.nullpointer.domain.board.event;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BoardEvent {

    private Long actorId;
    private Long teamId;
    private Long boardId;
    private Long targetId;
    private String targetName;

    private String prevValue;
    private String nextValue;

    private EventType eventType;

    public enum EventType {
        CREATE_BOARD, UPDATE_BOARD, DELETE_BOARD,
        CREATE_LIST, DELETE_LIST,
        CREATE_TEAM, UPDATE_TEAM
    }
}
