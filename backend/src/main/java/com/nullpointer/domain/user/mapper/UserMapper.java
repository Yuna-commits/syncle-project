package com.nullpointer.domain.user.mapper;

import com.nullpointer.domain.user.vo.UserVo;

public interface UserMapper {

    // 회원가입
    void insertUser(UserVo user);

    // 이메일 중복 확인
    boolean existsByEmail(String email);

    // 닉네임 중복 확인
    boolean existsByNickname(String nickname);

}
