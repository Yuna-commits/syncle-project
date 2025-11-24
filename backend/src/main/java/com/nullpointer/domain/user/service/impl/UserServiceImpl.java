package com.nullpointer.domain.user.service.impl;

import com.nullpointer.domain.user.dto.UserProfileResponse;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.service.UserService;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

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

}
