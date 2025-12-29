package com.nullpointer.domain.user.mapper;

import com.nullpointer.domain.user.dto.response.UserProfileResponse;
import com.nullpointer.domain.user.dto.response.UserSummaryResponse;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.domain.user.vo.enums.VerifyStatus;
import org.apache.ibatis.annotations.Param;
import com.nullpointer.domain.user.vo.enums.Provider;

import java.util.List;
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

    // 초대받을 여러 명의 사용자 조회
    List<UserVo> findAllByIds(@Param("ids") List<Long> ids);

    // email로 사용자 조회 (로그인)
    Optional<UserVo> findByEmail(String email);

    // 닉네임으로 사용자 조회
    Optional<UserVo> findByNickname(String nickname);

    // 사용자 인증 상태 조건부 업데이트
    int updateVerifyStatusIfCurrent(Long id, VerifyStatus currentStatus, VerifyStatus newStatus);

    // 사용자 정보 조회
    // count 쿼리 여러번 사용 x -> 스칼라 서브쿼리를 사용해 한 번의 쿼리로 모든 카운트 조회
    Optional<UserProfileResponse> getUserProfile(Long id);

    // 사용자 정보 수정
    void updateUser(UserVo user);

    // 사용자 비밀번호 변경 (성공: 1, 실패: 0)
    void updatePassword(Long id, String newPassword);

    // 사용자 요약 정보 조회
    Optional<UserSummaryResponse> getUserSummary(Long userId);

    // nickname으로 사용자 검색 (팀 멤버 추가)
    List<UserSummaryResponse> searchUsers(String keyword);

    // 계정 비활성화
    int deactivateUser(Long id);

    // 계정 활성화
    int reactivateUser(Long id);

    // 계정 삭제
    void deleteUser(Long id);

    // 미인증 계정 삭제
    int deleteUnverifiedUsers();

    // 기간 만료된 비활성화 계정 아이디 목록 조회
    List<Long> findIdsByDeactivatedAndExpired();

    // 소셜 계정 연동
    void updateProvider(@Param("id") Long id, @Param("provider") Provider provider, @Param("providerId") String providerId);

    // 모든 유저 ID 조회
    List<Long> findAllIds();
}
