package com.nullpointer.domain.file.controller;

import com.nullpointer.domain.file.dto.FileResponse;
import com.nullpointer.domain.file.service.FileService;
import com.nullpointer.domain.file.service.S3FileStorageService;
import com.nullpointer.domain.file.vo.enums.FileType;
import com.nullpointer.global.common.ApiResponse;
import com.nullpointer.global.common.annotation.LoginUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Tag(name = "File", description = "파일 업로드 API")
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;
    private final S3FileStorageService fileStorageService;

    @Operation(summary = "프로필 이미지 업로드", description = "이미지를 업로드하고 URL을 반환받습니다.")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file, @LoginUser Long userId, @RequestParam("fileType") FileType fileType) {
        String key = fileStorageService.storeFile(file, userId, fileType);
        String fileUrl = fileStorageService.getFileUrl(key);
        return ApiResponse.success(Map.of("url", fileUrl));
    }

    @Operation(summary = "첨부파일 업로드", description = "카드에 파일을 첨부합니다.")
    @PostMapping(value = "/card/{cardId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<FileResponse> uploadFile(@PathVariable Long cardId, @RequestParam("file") MultipartFile file, @LoginUser Long userId) {

        FileResponse response = fileService.uploadFile(cardId, file, userId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "첨부파일 삭제", description = "첨부된 파일을 삭제합니다.")
    @DeleteMapping("/{fileId}")
    public ApiResponse<String> deleteFile(@PathVariable Long fileId, @LoginUser Long userId) {
        fileService.deleteFile(fileId, userId);
        return ApiResponse.success("첨부파일 삭제");
    }
}
