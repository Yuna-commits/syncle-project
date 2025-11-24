package com.nullpointer.domain.user.service;

import com.nullpointer.domain.user.dto.UserProfileResponse;

public interface UserService {

    // 이메일 중복 확인
    boolean existsByEmail(String email);

    // 닉네임 중복 확인
    boolean existsByNickname(String nickname);

    // 내 정보 조회
    UserProfileResponse getUserProfile(Long id);

}
