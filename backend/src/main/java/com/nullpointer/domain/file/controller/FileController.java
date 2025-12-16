package com.nullpointer.domain.file.controller;

import com.nullpointer.domain.file.service.FileStorageService;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Tag(name = "File", description = "파일 업로드 API")
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    /**
     * 단일 파일 업로드
     */
    @Operation(summary = "파일 업로드", description = "이미지 등의 파일을 업로드하고 URL을 반환받습니다.")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file, @LoginUser Long userId, @RequestParam("fileType") String fileType) {
        String fileUrl = fileStorageService.storeFile(file, userId, fileType);
        return ApiResponse.success(Map.of("url", fileUrl));
    }

}
