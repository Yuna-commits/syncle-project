package com.nullpointer.domain.user.mapper;

import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.domain.user.vo.enums.VerifyStatus;
import org.apache.ibatis.annotations.Param;

public interface UserMapper {

    // 회원가입
    void insertUser(UserVo user);

    // 이메일 중복 확인
    boolean existsByEmail(String email);

    // 닉네임 중복 확인
    boolean existsByNickname(String nickname);

    // 사용자 조회
    UserVo findById(Long id);

    // 사용자 이메일 인증 상태 업데이트
    void updateVerifyStatus(@Param("userId") Long userId, @Param("verifyStatus") VerifyStatus verifyStatus);

}
