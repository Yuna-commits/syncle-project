package com.nullpointer.domain.file.mapper;

import com.nullpointer.domain.file.vo.FileVo;

import java.util.List;

public interface FileMapper {

    // 파일 정보 저장
    void insertFile(FileVo fileVo);

    // 카드 별 첨부파일 목록 조회
    List<FileVo> findAllByBoardId(Long boardId);

    // 파일 삭제
    void deleteById(Long fileId);

    // 보드 삭제 시 해당 보드의 모든 파일 삭제
    void deleteByBoardId(Long boardId);

    // 카드 삭제 시 해당 카드의 모든 파일 삭제
    void deleteByCardId(Long cardId);
}
