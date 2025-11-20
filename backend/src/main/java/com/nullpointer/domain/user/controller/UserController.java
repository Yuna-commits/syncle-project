package com.nullpointer.domain.user.controller;

import com.nullpointer.domain.user.dto.SignupRequest;
import com.nullpointer.domain.user.service.AuthService;
import com.nullpointer.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<String> signup(@Valid @RequestBody SignupRequest req) {
        authService.signup(req);

        return ApiResponse.success("회원가입 성공");
    }

}
