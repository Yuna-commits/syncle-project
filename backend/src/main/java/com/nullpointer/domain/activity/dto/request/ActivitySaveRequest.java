package com.nullpointer.domain.activity.dto.request;

import com.nullpointer.domain.activity.vo.ActivityLogVo;
import com.nullpointer.domain.activity.vo.enums.ActivityType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ActivitySaveRequest {

    private Long userId;
    private Long teamId;
    private Long boardId; // nullable

    private ActivityType type;
    private Long targetId;
    private String targetName;
    private String description;

    // DTO -> Vo
    public ActivityLogVo toVo() {
        return ActivityLogVo.builder()
                .userId(userId)
                .teamId(teamId)
                .boardId(boardId)
                .type(type)
                .targetId(targetId)
                .targetName(targetName)
                .description(description)
                .build();
    }

}
