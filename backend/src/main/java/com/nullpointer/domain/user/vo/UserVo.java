package com.nullpointer.domain.user.vo;

import com.nullpointer.domain.user.vo.enums.Provider;
import com.nullpointer.domain.user.vo.enums.UserStatus;
import com.nullpointer.domain.user.vo.enums.VerifyStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor // 기본 생성자
@AllArgsConstructor
@ToString
@Builder
public class UserVo {

    private Long id;
    private String email;
    private String password;
    private String nickname;

    private String description;
    private String position;
    private String profileImg;

    @Builder.Default
    private Provider provider = Provider.LOCAL;

    private String providerId; // 구글 로그인 식별자

    @Builder.Default
    private VerifyStatus verifyStatus = VerifyStatus.PENDING;

    @Builder.Default
    private UserStatus userStatus = UserStatus.ACTIVATED;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

}
