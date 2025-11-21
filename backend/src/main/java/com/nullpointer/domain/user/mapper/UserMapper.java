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

    // Id로 사용자 조회 (이메일 인증)
    UserVo findById(Long id);

    // email로 사용자 조회 (로그인)
    UserVo findByEmail(String email);

    // 사용자 이메일 인증 상태 업데이트
    void updateVerifyStatus(@Param("id") Long id, @Param("verifyStatus") VerifyStatus verifyStatus);

}
