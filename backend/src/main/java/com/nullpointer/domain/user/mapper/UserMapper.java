package com.nullpointer.domain.user.mapper;

import com.nullpointer.domain.user.dto.response.UserProfileResponse;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.domain.user.vo.enums.VerifyStatus;

import java.util.Optional;

public interface UserMapper {

    // 회원가입
    void insertUser(UserVo user);

    // 이메일 중복 확인
    boolean existsByEmail(String email);

    // 닉네임 중복 확인
    boolean existsByNickname(String nickname);

    // Id로 사용자 조회 (이메일 인증)
    Optional<UserVo> findById(Long id);

    // email로 사용자 조회 (로그인)
    Optional<UserVo> findByEmail(String email);

    // 사용자 인증 상태 조건부 업데이트
    int updateVerifyStatusIfCurrent(Long id, VerifyStatus currentStatus, VerifyStatus newStatus);

    // 사용자 정보 조회
    // count 쿼리 여러번 사용 x -> 스칼라 서브쿼리를 사용해 한 번의 쿼리로 모든 카운트 조회
    Optional<UserProfileResponse> getUserProfile(Long id);

    // 사용자 정보 수정
    void updateUser(UserVo user);

    // 사용자 비밀번호 변경 (성공: 1, 실패: 0)
    int updatePassword(Long id, String newPassword);

}
