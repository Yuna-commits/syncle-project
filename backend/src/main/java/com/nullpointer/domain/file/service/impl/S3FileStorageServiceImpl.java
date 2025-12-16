package com.nullpointer.domain.file.service.impl;

import com.nullpointer.domain.file.service.FileStorageService;
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
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Slf4j
@Service
@Primary
@RequiredArgsConstructor
public class S3FileStorageServiceImpl implements FileStorageService {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    @Value("${cloud.aws.cloudfront.domain}")
    private String domain;

    // 파일 저장
    @Override
    public String storeFile(MultipartFile file, Long userId, String fileType) {
        if (file.isEmpty()) throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);

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

            // CloudFront URL 반환
            return domain + "/" + key;
        } catch (IOException e) {
            log.error("S3 Upload Fail", e);
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
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

    // 확장자 추출
    private String getExtension(String filename) {
        if (StringUtils.hasText(filename) && filename.contains(".")) {
            return filename.substring(filename.lastIndexOf('.'));
        }
        return "";
    }


}
