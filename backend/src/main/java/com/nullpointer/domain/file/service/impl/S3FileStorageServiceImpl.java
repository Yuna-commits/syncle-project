package com.nullpointer.domain.file.service.impl;

import com.nullpointer.domain.file.service.S3FileStorageService;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@Primary
@RequiredArgsConstructor
public class S3FileStorageServiceImpl implements S3FileStorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    @Value("${cloud.aws.cloudfront.domain}")
    private String domain;

    // 허용할 확장자 리스트 정의 (Whitelist 방식)
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            // 이미지
            "jpg", "jpeg", "png", "gif", "webp", "svg",
            // 문서
            "pdf", "txt", "md", "csv",
            "doc", "docx", "xls", "xlsx", "ppt", "pptx",
            // 압축 파일
            "zip"
    );

    // 파일 저장
    @Override
    public String storeFile(MultipartFile file, Long userId, String fileType) {
        if (file.isEmpty()) throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);

        // 파일명 및 확장자 검증 로직 호출
        validateFileExtension(file.getOriginalFilename());

        String uuid = UUID.randomUUID().toString();
        String extension = getExtension(file.getOriginalFilename());
        String savedFileName = uuid + "." + extension;

        // 경로: "user-{userId}/{directory}/{uuid}.{ext}"
        // 예: user-1/profiles/abc-123.jpg
        String key = "user-" + userId + "/" + fileType + "/" + savedFileName;

        try {
            PutObjectRequest putOb = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putOb, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            return key;
        } catch (IOException e) {
            log.error("S3 Upload Fail", e);
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    // Full URL 생성을 위한 메서드
    public String getFileUrl(String key) {
        return domain + "/" + key;
    }

    // 파일 삭제
    @Override
    public void deleteFile(String fileUrl) {
        if (!StringUtils.hasText(fileUrl)) return;

        try {
            // CloudFront URL에서 Key 추출
            String key = fileUrl.replace(domain + "/", "");

            // URL 디코딩
            key = URLDecoder.decode(key, StandardCharsets.UTF_8);
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build());
        } catch (Exception e) {
            log.error("S3 Delete Fail: {}", e.getMessage());
        }
    }

    // 다운로드 URL 생성
    @Override
    public String getDownLoadUrl(String filePath, String fileName) {
        try {
            // 1. 인코딩
            String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8)
                    .replaceAll("\\+", "%20");

            // 2. GetObjectRequest 생성
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(filePath)
                    .responseContentDisposition("attachment; filename=\"" + encodedFileName + "\"") // 👈 핵심
                    .build();

            // 3. Presign 요청 생성 (유효기간 설정)
            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofHours(1)) // 1시간
                    .getObjectRequest(getObjectRequest)
                    .build();

            // 4. URL 발급
            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
            return presignedRequest.url().toString();

        } catch (Exception e) {
            log.error("파일 다운로드 URL 생성 실패", e);
            throw new BusinessException(ErrorCode.FILE_DOWNLOAD_FAILED);
        }
    }


    /**
     * Helper 메소드
     */

    // 확장자 검증 메서드
    private void validateFileExtension(String filename) {
        String extension = getExtension(filename).toLowerCase();

        // 확장자가 없거나, 허용 목록에 없으면 예외 발생
        if (!StringUtils.hasText(extension) || !ALLOWED_EXTENSIONS.contains(extension)) {
            log.warn("허용되지 않는 파일 확장자 업로드 시도: {}", filename);
            throw new BusinessException(ErrorCode.INVALID_FILE_EXTENSION);
        }
    }

    // 확장자 추출
    private String getExtension(String filename) {
        if (StringUtils.hasText(filename) && filename.contains(".")) {
            return filename.substring(filename.lastIndexOf('.') + 1);
        }
        return "";
    }


}
