package com.nullpointer.global.validator.board;

import com.nullpointer.domain.board.mapper.BoardMapper;
import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BoardValidator {
    private final BoardMapper boardMapper;

    // ========================================================
    //  1. 리소스 존재 및 유효성 확인
    // ========================================================

    /**
     * 유효한 보드 가져오기
     */
    public BoardVo getValidBoard(Long boardId) {
        BoardVo board = boardMapper.findBoardByBoardId(boardId);
        if (board == null) {
            throw new BusinessException(ErrorCode.BOARD_NOT_FOUND);
        }
        if (board.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.BOARD_DELETED);
        }
        return board;
    }
}
