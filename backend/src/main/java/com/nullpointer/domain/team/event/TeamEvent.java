package com.nullpointer.domain.team.event;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class TeamEvent {

    public enum EventType {
        CREATE_TEAM, UPDATE_TEAM, DELETE_TEAM
    }

    private EventType eventType;

    private Long teamId;
    private List<Long> targetMemberIds; // 알림 대상 멤버 ID 목록

    private Long actorId;
    private String actorNickname;
    private String actorProfileImg;

    private String teamName;

    // 보드 생성 권한 변경 정보
    private String oldBoardCreateRole;
    private String newBoardCreateRole;

}
