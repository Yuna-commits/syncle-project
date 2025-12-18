package com.nullpointer.domain.file.vo.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Set;

@Getter
@RequiredArgsConstructor
public enum FileType {
    PROFILE(Set.of("jpg", "jpeg", "png", "gif", "webp", "svg")),
    ATTACHMENT(Set.of(
            "jpg", "jpeg", "png", "gif", "webp", "svg",
            "pdf", "txt", "md", "csv",
            "doc", "docx", "xls", "xlsx", "ppt", "pptx",
            "zip"
    ));

    private final Set<String> allowedExtensions;
}