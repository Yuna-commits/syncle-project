package com.nullpointer.domain.board.event;

import com.nullpointer.domain.board.vo.enums.BoardSettingType;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@Builder
public class BoardEvent {

    public enum EventType {
        CREATE_BOARD, UPDATE_BOARD, UPDATE_BOARD_SETTINGS, DELETE_BOARD,
        CREATE_LIST, DELETE_LIST, UPDATE_LIST
    }

    private EventType eventType;

    private Long teamId;
    private Long boardId;

    private List<Long> targetMemberIds; // 알림 대상 멤버 ID 목록

    private Long actorId;
    private String actorNickname;
    private String actorProfileImg;

    private String boardTitle;

    private Long listId;
    private String listTitle;

    private Boolean isArchived;

    // 보드 권한 설정 변경 타입
    private Map<BoardSettingType, String[]> settingChanges;

}
