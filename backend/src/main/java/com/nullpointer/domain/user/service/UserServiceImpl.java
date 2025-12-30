package com.nullpointer.domain.user.service;

import com.nullpointer.domain.auth.dto.request.AuthRequest;
import com.nullpointer.domain.auth.dto.request.PasswordRequest;
import com.nullpointer.domain.board.mapper.BoardMapper;
import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.domain.file.service.S3FileStorageService;
import com.nullpointer.domain.invitation.event.InvitationEvent;
import com.nullpointer.domain.member.mapper.BoardMemberMapper;
import com.nullpointer.domain.member.mapper.TeamMemberMapper;
import com.nullpointer.domain.notification.vo.enums.NotificationType;
import com.nullpointer.domain.team.mapper.TeamMapper;
import com.nullpointer.domain.team.vo.TeamVo;
import com.nullpointer.domain.user.dto.request.UpdateProfileRequest;
import com.nullpointer.domain.user.dto.response.UserProfileResponse;
import com.nullpointer.domain.user.dto.response.UserSummaryResponse;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.domain.user.vo.enums.UserStatus;
import com.nullpointer.domain.user.vo.enums.VerifyStatus;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.common.enums.RedisKeyType;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.security.jwt.JwtTokenProvider;
import com.nullpointer.global.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final TeamMemberMapper teamMemberMapper;
    private final BoardMemberMapper boardMemberMapper;
    private final BoardMapper boardMapper;
    private final TeamMapper teamMapper;
    private final S3FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;
    private final RedisUtil redisUtil;
    private final JwtTokenProvider jwtTokenProvider;
    private final ApplicationEventPublisher publisher;

    /**
     * 이메일 중복 확인
     */
    @Override
    public boolean existsByEmail(String email) {
        return userMapper.existsByEmail(email);
    }

    /**
     * 닉네임 중복 확인
     */
    @Override
    public boolean existsByNickname(String nickname) {
        return userMapper.existsByNickname(nickname);
    }

    /**
     * 프로필 조회
     */
    @Override
    public UserProfileResponse getUserProfile(Long id) {
        return userMapper.getUserProfile(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    /**
     * 프로필 수정
     */
    @Override
    @Transactional
    public void updateProfile(Long id, UpdateProfileRequest req) {
        // 1) 사용자 조회
        UserVo user = findActiveUser(id);

        // 2) 닉네임 변경 시 중복 검사 (기존 닉네임과 다를 때만)
        // hasText : null, 문자열 길이, 공백 체크
        if (StringUtils.hasText(req.getNickname()) && !user.getNickname().equals(req.getNickname())) {
            userMapper.findByNickname(req.getNickname()).ifPresent(owner -> {
                // VERIFIED든 PENDING이든 남이 쓰고 있으면 무조건 중복 처리
                // (프로필 수정은 이미 가입된 사람이 하는 것이므로 PENDING 닉네임도 뺏으면 안됨)
                throw new BusinessException(ErrorCode.USER_NICKNAME_DUPLICATE);
            });
            user.setNickname(req.getNickname());
        }

        // 3) 나머지 필드 업데이트 (값이 있는 경우에만)
        if (req.getDescription() != null) {
            user.setDescription(req.getDescription());
        }
        if (req.getPosition() != null) {
            user.setPosition(req.getPosition());
        }

        /**
         * 프로필 이미지 변경
         * 기존 이미지 삭제 -> 새 이미지 저장
         */
        if (req.getProfileImg() != null) {
            String oldProfileImg = user.getProfileImg();
            if (StringUtils.hasText(oldProfileImg)) {
                // 파일 서비스로 기존 이미지 삭제 요청
                fileStorageService.deleteFile(oldProfileImg);
            }
            // 새 이미지 경로로 교체
            user.setProfileImg(req.getProfileImg());
        }

        // 4) DB 저장
        userMapper.updateUser(user);
    }

    /**
     * 비밀번호 변경
     */
    @Override
    @Transactional
    public void changePassword(Long id, PasswordRequest.Change req) {
        // 1) 사용자 조회
        UserVo user = findActiveUser(id);

        // 2) 현재 비밀번호 검증
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }

        // 3) 새 비밀번호와 기존 비밀번호가 같은지 확인
        if (passwordEncoder.matches(req.getNewPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.SAME_AS_OLD_PASSWORD);
        }

        // 4) 비밀번호 암호화, DB 업데이트
        String newEncodedPassword = passwordEncoder.encode(req.getNewPassword());
        userMapper.updatePassword(id, newEncodedPassword);

        // 5) 로그아웃 처리 -> Reids에 저장된 Refresh Token 삭제
        String redisKey = RedisKeyType.REFRESH_TOKEN.getKey(id);
        redisUtil.deleteData(redisKey);
    }

    /**
     * 사용자 요약 정보 조회
     */
    @Override
    public UserSummaryResponse getUserSummary(Long userId) {
        return userMapper.getUserSummary(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    /**
     * 사용자 검색
     */
    @Override
    public List<UserSummaryResponse> searchUsers(String keyword) {
        // 간단한 유효성 검사 (빈 문자열 검색 방지 등)
        if (!StringUtils.hasText(keyword)) {
            return List.of();
        }
        return userMapper.searchUsers(keyword.trim());
    }

    /**
     * 계정 비활성화 (로그인 상태)
     */
    @Override
    @Transactional
    public void deactivateUser(Long userId, String accessToken) {
        // 1) 사용자 조회
        UserVo user = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 2) [팀/보드 검증] 소유권 확인
        checkOwnershipBeforeLeave(userId);

        // 삭제 전에 소속된 팀/보드 ID 목록을 미리 조회
        List<Long> joinedBoardIds = boardMemberMapper.findBoardIdsByUserId(userId);
        List<Long> joinedTeamIds = teamMemberMapper.findTeamIdsByUserId(userId);

        // a. [멤버십 정리] 모든 팀/보드에서 탈퇴 처리 (Soft Delete)
        teamMemberMapper.deleteAllByUserId(userId);
        boardMemberMapper.deleteAllByUserId(userId);

        // 2) 상태 변경 (ACTIVATED -> DEACTIVATED)
        int updated = userMapper.deactivateUser(userId);

        if (updated != 1) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        // 3) [알림 발송] 내가 관리자가 아니라면,DB 처리가 끝난 후, 미리 조회해둔 목록으로 알림 전송
        sendLeaveAlertsToOwner(user, joinedTeamIds, joinedBoardIds);

        // 3) 강제 로그아웃
        redisUtil.deleteData(RedisKeyType.REFRESH_TOKEN.getKey(userId));

        long remainingTime = jwtTokenProvider.getExpiration(accessToken) - System.currentTimeMillis();

        if (remainingTime > 0) {
            redisUtil.setDataExpire(RedisKeyType.BLACKLIST.getKey(accessToken), "logout", remainingTime);
        }
    }

    /**
     * 계정 재활성화 (로그아웃 상태)
     * - 비활성화된 계정으로 로그인 시도
     */
    @Override
    @Transactional
    public void reactivateUser(AuthRequest.Login req) {
        // 1) 사용자 조회
        // 계정이 삭제된 사용자는 조회 x
        UserVo user = userMapper.findByEmail(req.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 2) 비밀번호 검증
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }

        // 3) 상태 변경 (DEACTIVATED -> ACTIVATED)
        int updated = userMapper.reactivateUser(user.getId());

        if (updated != 1) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 계정 영구삭제
     */
    @Override
    @Transactional
    public void deleteUser(Long userId) {
        // 1) 사용자 조회
        UserVo user = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 2) [팀/보드 검증] 소유권 확인
        checkOwnershipBeforeLeave(userId);

        // 삭제 전에 소속된 팀/보드 ID 목록을 미리 조회
        List<Long> joinedBoardIds = boardMemberMapper.findBoardIdsByUserId(userId);
        List<Long> joinedTeamIds = teamMemberMapper.findTeamIdsByUserId(userId);

        // 4) Soft Delete
        // a. [멤버십 정리] 모든 팀/보드에서 탈퇴 처리 (Soft Delete)
        teamMemberMapper.deleteAllByUserId(userId);
        boardMemberMapper.deleteAllByUserId(userId);

        // b. 계정 익명화
        userMapper.deleteUser(userId);

        // 3) [알림 발송] 내가 관리자가 아니라면,DB 처리가 끝난 후, 미리 조회해둔 목록으로 알림 전송
        sendLeaveAlertsToOwner(user, joinedTeamIds, joinedBoardIds);

        // 3) 강제 로그아웃
        redisUtil.deleteData(RedisKeyType.REFRESH_TOKEN.getKey(userId));
    }

    /**
     * 활성화 계정 조회
     */
    private UserVo findActiveUser(Long id) {
        UserVo user = userMapper.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (user.getVerifyStatus() != VerifyStatus.VERIFIED) {
            throw new BusinessException(ErrorCode.EMAIL_NOT_VERIFIED);
        }

        if (user.getUserStatus() != UserStatus.ACTIVATED) {
            throw new BusinessException(ErrorCode.USER_STATUS_NOT_ACTIVE);
        }

        return user;
    }

    /**
     * 탈퇴/비활성화 전 소유권 검증
     */
    private void checkOwnershipBeforeLeave(Long userId) {
        // 2. [팀 검증] 내가 오너인 팀들 중, '나 외에 다른 멤버'가 있는 팀이 있는지 확인
        List<Long> ownedTeamIds = teamMemberMapper.findTeamIdsByOwnerId(userId);
        for (Long teamId : ownedTeamIds) {
            int memberCount = teamMemberMapper.countMembersByTeamId(teamId);
            if (memberCount > 1) {
                // 나 말고 다른 사람이 있으면 권한 이임 필수
                throw new BusinessException(ErrorCode.OWNER_MUST_TRANSFER_BEFORE_LEAVE);
            }
        }

        // 2-2 [보드 검증] 내가 오너인 보드들 중, '나 외에 다른 멤버'가 있는 보드가 있는지 확인
        List<Long> ownedBoardIds = boardMemberMapper.findBoardIdsByOwnerId(userId);
        for (Long boardId : ownedBoardIds) {
            int memberCount = boardMemberMapper.countMembersByBoardId(boardId);
            if (memberCount > 1) {
                throw new BusinessException(ErrorCode.OWNER_MUST_TRANSFER_BEFORE_LEAVE);
            }
        }
    }

    /**
     * 탈퇴/비활성화 시 소속된 팀/보드의 관리자에게 알림 발송
     */
    private void sendLeaveAlertsToOwner(UserVo user, List<Long> teamIds, List<Long> boardIds) {
        Long userId = user.getId();

        // 1. [보드] 탈퇴 알림
        for (Long boardId : boardIds) {
            // 보드 정보 조회
            BoardVo board = boardMapper.findBoardByBoardId(boardId).orElse(null);
            if (board == null) continue;

            // ★ 단건 조회: 해당 보드의 유일한 관리자 ID 조회
            Long ownerId = boardMemberMapper.findOwnerIdByBoardId(boardId);

            // 관리자가 존재하고, 탈퇴하는 사람이 관리자가 아닐 때만 알림 전송
            if (ownerId != null && !ownerId.equals(userId)) {
                try {
                    publisher.publishEvent(InvitationEvent.builder()
                            .type(NotificationType.BOARD_MEMBER_LEFT)
                            .senderId(userId)
                            .senderNickname(user.getNickname())
                            .senderProfileImg(user.getProfileImg())
                            .receiverId(ownerId) // 유일한 관리자에게 전송
                            .targetId(boardId)
                            .targetName(board.getTitle())
                            .build());
                } catch (Exception e) {
                    log.warn("보드 탈퇴 알림 발송 실패 (boardId: {}): {}", boardId, e.getMessage());
                }
            }
        }

        // 2. [팀] 탈퇴 알림
        for (Long teamId : teamIds) {
            TeamVo team = teamMapper.findTeamByTeamId(teamId).orElse(null);
            if (team == null) continue;

            // ★ 단건 조회: 해당 팀의 유일한 관리자 ID 조회
            Long ownerId = teamMemberMapper.findOwenrIdByTeamId(teamId);

            if (ownerId != null && !ownerId.equals(userId)) {
                try {
                    publisher.publishEvent(InvitationEvent.builder()
                            .type(NotificationType.TEAM_MEMBER_LEFT)
                            .senderId(userId)
                            .senderNickname(user.getNickname())
                            .senderProfileImg(user.getProfileImg())
                            .receiverId(ownerId) // 유일한 관리자에게 전송
                            .targetId(teamId)
                            .targetName(team.getName())
                            .build());
                } catch (Exception e) {
                    log.warn("팀 탈퇴 알림 발송 실패 (teamId: {}): {}", teamId, e.getMessage());
                }
            }
        }
    }


}
