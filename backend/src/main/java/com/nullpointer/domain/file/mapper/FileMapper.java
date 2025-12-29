package com.nullpointer.domain.file.mapper;

import com.nullpointer.domain.file.vo.FileVo;

public interface FileMapper {

    // 파일 정보 저장
    void insertFile(FileVo fileVo);

    // 파일 조회
    FileVo findById(Long fileId);

    // 파일 삭제
    void deleteById(Long fileId);

    // 카드 삭제 시 하위 데이터 일괄 삭제
    void deleteAllFilesByCardId(Long cardId);

    // 리스트 삭제 시 하위 데이터 일괄 삭제
    void deleteAllFilesByListId(Long listId);

    // 보드 삭제 시 하위 데이터 일괄 삭제
    void deleteAllFilesByBoardId(Long boardId);

    // 팀 삭제 시 하위 데이터 일괄 삭제
    void deleteAllFilesByTeamId(Long teamId);

}
