package com.nullpointer.domain.activity.vo;

import com.nullpointer.domain.activity.vo.enums.ActivityType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor // 기본 생성자
@AllArgsConstructor
@ToString
@Builder
public class ActivityLogVo {

    private Long id;
    private Long userId;
    private Long teamId;
    private Long boardId;

    private ActivityType type;
    private Long targetId;
    private String targetName;
    private String description;

    private LocalDateTime createdAt;

}
