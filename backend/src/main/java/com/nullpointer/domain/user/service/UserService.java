package com.nullpointer.domain.user.service;

import com.nullpointer.domain.user.dto.request.ChangePasswordRequest;
import com.nullpointer.domain.user.dto.request.UpdateProfileRequest;
import com.nullpointer.domain.user.dto.response.UserProfileResponse;

public interface UserService {

    // 이메일 중복 확인
    boolean existsByEmail(String email);

    // 닉네임 중복 확인
    boolean existsByNickname(String nickname);

    // 내 정보 조회
    UserProfileResponse getUserProfile(Long id);

    // 내 정보 수정
    void updateProfile(Long id, UpdateProfileRequest req);

    // 비밀번호 변경
    void changePassword(Long id, ChangePasswordRequest req);

}
