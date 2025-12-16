//package com.nullpointer.domain.file.service.impl;
//
//import com.nullpointer.domain.file.service.FileStorageService;
//import com.nullpointer.global.common.enums.ErrorCode;
//import com.nullpointer.global.exception.BusinessException;
//import jakarta.annotation.PostConstruct;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import org.springframework.util.unit.DataSize;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.net.URLDecoder;
//import java.nio.charset.StandardCharsets;
//import java.nio.file.Files;
//import java.nio.file.Path;
//import java.nio.file.Paths;
//import java.nio.file.StandardCopyOption;
//import java.util.UUID;
//
//@Slf4j
//@Service
//public class FileStorageServiceImpl implements FileStorageService {
//
//    @Value("${app.file.upload-dir}")
//    private String uploadDir;
//
//    @Value("${spring.servlet.multipart.max-file-size}")
//    private DataSize maxFileSize;
//
//    private Path fileStorageLocation;
//
//    @PostConstruct
//    public void init() {
//        // 저장소 디렉토리 생성
//        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
//        try {
//            Files.createDirectories(this.fileStorageLocation);
//        } catch (IOException e) {
//            log.error("파일 저장 경로를 생성 불가: {}", e.getMessage());
//            throw new RuntimeException(e);
//        }
//    }
//
//    @Override
//    public String storeFile(MultipartFile file) {
//        if (file.getSize() > maxFileSize.toBytes()) {
//            log.warn("파일 크기 초과: {} > {}", file.getSize(), maxFileSize.toBytes());
//            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
//        }
//
//        // 1) 파일명 검증
//        String originalFilename = file.getOriginalFilename();
//
//        if (originalFilename == null || originalFilename.isBlank()) {
//            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
//        }
//
//        // 2) 고유 파일명 생성 (UUID + 확장자)
//        String savedFileName = createUniqueFileName(originalFilename);
//
//        try {
//            if (savedFileName.contains("..")) {
//                throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
//            }
//
//            // 3) 파일 저장 (중복 파일명이 존재하면 덮어쓰기)
//            Path targetLocation = this.fileStorageLocation.resolve(savedFileName);
//            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
//
//            // 4) 접근 가능한 URL 반환
//            // ex) /uploads/uuid.jpg
//            return "/uploads/" + savedFileName;
//        } catch (IOException e) {
//            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
//        }
//    }
//
//    @Override
//    public void deleteFile(String filePath) {
//        try {
//            // 1) 실제 파일명 추출
//            // ex) http://localhost:8080/uploads/abc.jpg -> abc.jpg
//            // ex) /uploads/abc.jpg -> abc.jpg
//            String fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
//
//            // 2) URL 디코딩 (한글, 특수문자가 섞인 경우)
//            fileName = URLDecoder.decode(fileName, StandardCharsets.UTF_8);
//
//            // 3) 실제 저장소 경로 찾기
//            Path targetPath = this.fileStorageLocation.resolve(fileName).normalize();
//
//            // 4) 파일이 존재하면 삭제
//            if (Files.exists(targetPath)) {
//                Files.delete(targetPath);
//            } else {
//                log.warn("삭제할 파일이 존재하지 않음: {}", targetPath);
//            }
//        } catch (IOException e) {
//            log.error("파일 삭제 실패: {}", e.getMessage());
//        }
//    }
//
//    private String createUniqueFileName(String originalFilename) {
//        String extension = "";
//        int dotIndex = originalFilename.lastIndexOf('.');
//
//        if (dotIndex != -1) {
//            extension = originalFilename.substring(dotIndex);
//        }
//
//        return UUID.randomUUID() + extension;
//    }
//
//}
