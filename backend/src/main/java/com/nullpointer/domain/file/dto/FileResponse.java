package com.nullpointer.domain.file.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FileResponse {
    private Long id;
    private String fileName;
    private String filePath;
    private Long cardId;
}
