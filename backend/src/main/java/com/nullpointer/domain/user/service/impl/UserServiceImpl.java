package com.nullpointer.domain.user.service.impl;

import com.nullpointer.domain.file.service.FileStorageService;
import com.nullpointer.domain.user.dto.request.UpdateProfileRequest;
import com.nullpointer.domain.user.dto.response.UserProfileResponse;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.service.UserService;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final FileStorageService fileStorageService;

    @Override
    public boolean existsByEmail(String email) {
        return userMapper.existsByEmail(email);
    }

    @Override
    public boolean existsByNickname(String nickname) {
        return userMapper.existsByNickname(nickname);
    }

    @Override
    public UserProfileResponse getUserProfile(Long id) {
        return userMapper.getUserProfile(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    @Override
    @Transactional
    public void updateProfile(Long id, UpdateProfileRequest req) {
        // 1) 사용자 조회
        UserVo user = userMapper.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 2) 닉네임 변경 시 중복 검사 (기존 닉네임과 다를 때만)
        // hasText : null, 문자열 길이, 공백 체크
        if (StringUtils.hasText(req.getNickname()) && !user.getNickname().equals(req.getNickname())) {
            if (userMapper.existsByNickname(req.getNickname())) {
                throw new BusinessException(ErrorCode.USER_NICKNAME_DUPLICATE);
            }
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

}
