package com.nullpointer.domain.auth.service;

import com.nullpointer.domain.auth.dto.request.AuthRequest;
import com.nullpointer.domain.user.vo.UserVo;

public interface RegistrationService {

    // 이메일 회원가입
    UserVo registerLocalUser(AuthRequest.Signup req);

}
