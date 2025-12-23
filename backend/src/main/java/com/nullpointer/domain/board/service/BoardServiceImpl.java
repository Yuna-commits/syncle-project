package com.nullpointer.domain.board.service;

import com.nullpointer.domain.activity.dto.request.ActivitySaveRequest;
import com.nullpointer.domain.activity.service.ActivityService;
import com.nullpointer.domain.activity.vo.enums.ActivityType;
import com.nullpointer.domain.board.dto.request.CreateBoardRequest;
import com.nullpointer.domain.board.dto.request.UpdateBoardRequest;
import com.nullpointer.domain.board.dto.response.*;
import com.nullpointer.domain.board.mapper.BoardMapper;
import com.nullpointer.domain.board.mapper.BoardSettingMapper;
import com.nullpointer.domain.board.vo.BoardSettingVo;
import com.nullpointer.domain.board.vo.BoardVo;
import com.nullpointer.domain.board.vo.enums.PermissionLevel;
import com.nullpointer.domain.board.vo.enums.Visibility;
import com.nullpointer.domain.file.service.S3FileStorageService;
import com.nullpointer.domain.invitation.event.InvitationEvent;
import com.nullpointer.domain.list.mapper.ListMapper;
import com.nullpointer.domain.list.vo.ListVo;
import com.nullpointer.domain.member.dto.board.BoardMemberResponse;
import com.nullpointer.domain.member.dto.team.TeamMemberResponse;
import com.nullpointer.domain.member.mapper.BoardMemberMapper;
import com.nullpointer.domain.member.mapper.TeamMemberMapper;
import com.nullpointer.domain.member.vo.BoardMemberVo;
import com.nullpointer.domain.member.vo.TeamMemberVo;
import com.nullpointer.domain.member.vo.enums.Role;
import com.nullpointer.domain.notification.vo.enums.NotificationType;
import com.nullpointer.domain.team.vo.TeamVo;
import com.nullpointer.domain.user.mapper.UserMapper;
import com.nullpointer.domain.user.vo.UserVo;
import com.nullpointer.global.common.SocketSender;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.util.RedisUtil;
import com.nullpointer.global.validator.BoardValidator;
import com.nullpointer.global.validator.MemberValidator;
import com.nullpointer.global.validator.TeamValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {

    private static final int MAX_BOARDS_PER_TEAM = 10;

    private final BoardMapper boardMapper;
    private final BoardSettingMapper boardSettingMapper;
    private final BoardMemberMapper boardMemberMapper;
    private final TeamValidator teamVal;
    private final MemberValidator memberVal;
    private final BoardValidator boardVal;
    private final ListMapper listMapper;
    private final ActivityService activityService;
    private final TeamMemberMapper teamMemberMapper;
    private final ApplicationEventPublisher publisher;
    private final SocketSender socketSender;
    private final S3FileStorageService s3FileStorageService;
    private final UserMapper userMapper;
    private final RedisUtil redisUtil;

    /**
     * 보드 권한
     * - 보드 수정/삭제 -> OWNER (Manager)
     * - 보드 조회 -> VIEWER 이상
     */

    @Override
    @Transactional
    public void createBoard(Long teamId, CreateBoardRequest req, Long userId) {

        // 팀 유효성 확인
        TeamVo team = teamVal.getValidTeam(teamId);

        // 팀 소속 여부 확인
        TeamMemberVo member = teamMemberMapper.findMember(teamId, userId);

        if (member == null) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        if (team.getBoardCreateRole() == Role.OWNER && member.getRole() != Role.OWNER) {
            throw new BusinessException(ErrorCode.BOARD_CREATE_FORBIDDEN);
        }

        // 보드 개수 제한 체크 (팀당 최대 10개)
        int currentBoardCount = boardMapper.countBoardByTeamId(teamId);

        if (currentBoardCount >= MAX_BOARDS_PER_TEAM) {
            throw new BusinessException(ErrorCode.BOARD_LIMIT_EXCEEDED);
        }

        // 보드 VO 생성 (DTO -> VO)
        BoardVo boardVo = req.toVo(teamId);

        boardMapper.insertBoard(boardVo);

        // 보드 설정 생성
        BoardSettingVo defaultSettings = BoardSettingVo.builder()
                .boardId(boardVo.getId())
                .invitationPermission(PermissionLevel.OWNER)
                .boardSharingPermission(PermissionLevel.OWNER)
                .listEditPermission(PermissionLevel.OWNER)
                .cardDeletePermission(PermissionLevel.OWNER)
                .build();
        boardSettingMapper.insertBoardSettings(defaultSettings);

        // 보드 생성 로그 저장
        createBoardLog(userId, teamId, boardVo);

        // 방금 만든 보드 ID 가져오기
        Long createBoardId = boardVo.getId();

        // 보드 OWNER 등록
        BoardMemberVo boardMemberVo = BoardMemberVo.builder().boardId(createBoardId).userId(userId).role(Role.OWNER).build();

        boardMemberMapper.insertBoardMember(boardMemberVo);
    }

    @Override
    @Transactional
    public void createDefaultBoard(Long teamId, Long userId) {
        // 1. 기본 보드 생성
        BoardVo board = BoardVo.builder().teamId(teamId).title("기본 보드").description("자유롭게 일정을 관리해보세요.").visibility(Visibility.PRIVATE).build();

        boardMapper.insertBoard(board);

        // 보드 생성 로그 저장
        createBoardLog(userId, teamId, board);

        // 방금 만든 보드 ID 가져오기
        Long boardId = board.getId();

        // 보드 설정 생성
        BoardSettingVo defaultSettings = BoardSettingVo.builder()
                .boardId(boardId)
                .invitationPermission(PermissionLevel.OWNER)
                .boardSharingPermission(PermissionLevel.OWNER)
                .listEditPermission(PermissionLevel.OWNER)
                .cardDeletePermission(PermissionLevel.OWNER)
                .build();
        boardSettingMapper.insertBoardSettings(defaultSettings);

        // 2. 보드 멤버 연결
        BoardMemberVo boardMember = BoardMemberVo.builder().boardId(boardId).userId(userId).role(Role.OWNER).build();

        boardMemberMapper.insertBoardMember(boardMember);

        // 3. 기본 리스트 3개 생성
        listMapper.insertList(createDefaultList(boardId, "To Do", 1));
        listMapper.insertList(createDefaultList(boardId, "In Progress", 2));
        listMapper.insertList(createDefaultList(boardId, "Done", 3));
    }

    // 내 보드 조회
    @Override
    public List<BoardResponse> getMyBoards(Long userId) {
        List<BoardVo> boards = boardMapper.findBoardByUserId(userId);
        return boards.stream().map(BoardResponse::from).toList();
    }

    // 특정 팀 보드 조회 - 보드 목록 반환
    @Override
    public List<BoardResponse> getTeamBoards(Long teamId, Long userId) {
        // 1. 권한 체크 (팀의 멤버면 팀 소속 보드 조회 가능)
        memberVal.validateTeamMember(teamId, userId);
        // 즐겨찾기 반영된 보드 반환
        return boardMapper.findBoardWithFavoriteStatus(teamId, userId);
    }

    // 보드 상세 조회 - 보드 설정
    @Override
    @Transactional(readOnly = true)
    public BoardDetailResponse getBoardDetail(Long boardId, Long userId) {
        // 보드 멤버이고 VIEWER 이상이면 조회 가능
        memberVal.validateBoardViewer(boardId, userId);

        // 보드 유효성 검증
        BoardVo boardVo = boardVal.getValidBoard(boardId);
        BoardSettingVo settingVo = boardSettingMapper.findBoardSettingsByBoardId(boardId);
        return BoardDetailResponse.from(boardVo, settingVo);
    }

    @Override
    @Transactional
    public void updateBoard(Long boardId, UpdateBoardRequest req, Long userId) {
        // 1. 보드 설정 변경 - 관리자(OWNER)만 가능
        memberVal.validateBoardManager(boardId, userId);

        // 2. 공통 검증 메서드로 보드 조회
        BoardVo boardVo = boardVal.getValidBoard(boardId);

        // 3. 업데이트 진행
        if (req.getTitle() != null) {
            boardVo.setTitle(req.getTitle());
        }

        if (req.getDescription() != null) {
            boardVo.setDescription(req.getDescription());
        }

        if (boardVo.getVisibility() != req.getVisibility()) {
            boardVo.setVisibility(req.getVisibility());
        }

        boardMapper.updateBoard(boardVo);

        // 보드 수정 로그 저장
        updateBoardLog(userId, boardVo.getTeamId(), boardVo);

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "BOARD_UPDATED", userId, null);
    }

    // 보드 설정 변경
    @Override
    @Transactional
    public void updateBoardSettings(Long boardId, UpdateBoardSettingRequest req, Long userId) {
        // 관리자만 설정 변경 가능
        memberVal.validateBoardManager(boardId, userId);

        // 공통 검증 메서드로 보드 조회
        boardVal.getValidBoard(boardId);

        BoardSettingVo settingVo = BoardSettingVo.builder()
                .boardId(boardId)
                .invitationPermission(req.getInvitation())
                .boardSharingPermission(req.getBoardSharing())
                .listEditPermission(req.getListEdit())
                .cardDeletePermission(req.getCardDelete())
                .build();

        boardSettingMapper.updateBoardSettings(settingVo);

        // (선택 사항) 로그 저장, 소켓 전송 등 추가 가능

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "BOARD_SETTINGS_UPDATED", userId, null);
    }

    @Override
    @Transactional
    public void deleteBoard(Long boardId, Long userId) {
        // 1. 보드 삭제 - 보드 관리자(OWNER)만 가능
        memberVal.validateBoardManager(boardId, userId);

        // 2. 공통 검증 메서드로 보드 조회
        BoardVo boardVo = boardVal.getValidBoard(boardId);

        // 관리자 정보 조회
        UserVo actor = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 삭제 전에 알림을 받을 멤버 조회
        List<Long> memberIds = boardMemberMapper.findAllMemberIdsByBoardId(boardId);

        // 3. 삭제 진행
        boardMapper.deleteBoard(boardId);

        // 보드 삭제 로그 저장
        // deleteBoardLog(userId, teamId, boardId, boardTitle);

        // [알림] 보드 삭제 알림 발송
        for (Long memberId : memberIds) {
            if (memberId.equals(actor.getId())) continue; // 본인은 알림 발송 x
            publishDeleteEvent(actor, memberId, boardVo);
        }

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "BOARD_DELETED", userId, null);
    }

    private ListVo createDefaultList(Long boardId, String title, int orderIndex) {
        return ListVo.builder()
                .boardId(boardId)
                .title(title)
                .orderIndex(orderIndex)
                .build();
    }

    // 멤버 보드 조회
    @Override
    public List<MemberBoardResponse> getMemberBoards(Long teamId, Long memberId, Long userId) {
        // owner 만 볼수 있게
        List<BoardVo> boards = boardMapper.findMemberBoard(teamId, memberId);
        return boards.stream().map(MemberBoardResponse::from).toList();
    }

    /**
     * 보드 관리 로그
     */

    // 보드 생성 로그
    private void createBoardLog(Long userId, Long teamId, BoardVo board) {
        activityService.saveLog(ActivitySaveRequest.builder().userId(userId).teamId(teamId).boardId(board.getId()).type(ActivityType.CREATE_BOARD).targetId(board.getId()).targetName(board.getTitle()).description("보드가 생성되었습니다.").build());
    }

    // 보드 수정 로그
    private void updateBoardLog(Long userId, Long teamId, BoardVo board) {
        activityService.saveLog(ActivitySaveRequest.builder().userId(userId).teamId(teamId).boardId(board.getId()).type(ActivityType.UPDATE_BOARD).targetId(board.getId()).targetName(board.getTitle()).description("보드 설정을 변경했습니다.").build());
    }

    // 보드 삭제 로그
    private void deleteBoardLog(Long userId, Long teamId, Long boardId, String boardTitle) {
        activityService.saveLog(ActivitySaveRequest.builder().userId(userId).teamId(teamId).boardId(boardId).type(ActivityType.DELETE_BOARD).targetId(boardId).targetName(boardTitle).description("보드를 삭제했습니다.").build());
    }

    // 즐겨찾기 토글
    @Override
    @Transactional
    public void toggleFavorite(Long boardId, Long userId) {
        // 보드 조회 권한이 있어야 즐겨찾기 가능
        memberVal.validateBoardViewer(boardId, userId);

        // 보드 존재 확인
        boardVal.getValidBoard(boardId);

        // 이미 즐겨찾기 되어있는지 확인
        boolean exists = boardMapper.existsFavorite(boardId, userId);

        // 즐겨찾기 갯수 확인
        int count = boardMapper.countFavorite(userId);

        // 상태에 따라 추가 삭제
        if (exists) {
            boardMapper.deleteFavorite(boardId, userId);
            // 즐겨찾기 4개 이상일 경우 에러발생
        } else if (count >= 4) {
            throw new BusinessException(ErrorCode.FAVORITE_LIMIT_EXCEEDED);
        } else {
            boardMapper.insertFavorite(boardId, userId);
        }
    }

    // 보드 관련 정보 조회 - 보드 페이지
    @Override
    @Transactional(readOnly = true)
    public BoardViewResponse getBoardView(Long boardId, Long userId) {
        // 조회 권한 확인
        // - validateBoardViewer 내부 resolveEffectiveBoardRole에서 TEAM/PRIVATE 보드 여부, 권한 모두 체크
        memberVal.validateBoardViewer(boardId, userId);

        // refactor) 보드 조회(1회) + 리스트 조회(1회) + 카드 조회(리스트 개수 N회) -> JOIN을 사용해서 데이터 일괄 조회
        BoardViewResponse response = boardMapper.findBoardWithListsAndCards(boardId);

        if (response == null) {
            throw new BusinessException(ErrorCode.BOARD_NOT_FOUND);
        }

        // 부가 정보 채우기 (멤버, 즐겨찾기는 별도로 조회)
        // 보드 멤버 조회
        List<BoardMemberResponse> boardMembers = boardMemberMapper.findMembersByBoardId(boardId);

        // 팀 멤버 조회
        List<TeamMemberResponse> teamMembers = teamMemberMapper.findMembersByTeamId(response.getTeamId());

        // 설정 정보 조회
        BoardSettingVo settingVo = boardSettingMapper.findBoardSettingsByBoardId(boardId);
        PermissionLevel invitation = settingVo != null ? settingVo.getInvitationPermission() : PermissionLevel.OWNER;
        PermissionLevel sharing = settingVo != null ? settingVo.getBoardSharingPermission() : PermissionLevel.OWNER;
        PermissionLevel listEdit = settingVo != null ? settingVo.getListEditPermission() : PermissionLevel.OWNER;
        PermissionLevel cardDelete = settingVo != null ? settingVo.getCardDeletePermission() : PermissionLevel.OWNER;

        // 현재 유저가 이 보드를 즐겨찾기 했는지 확인
        boolean isFavorite = boardMapper.existsFavorite(boardId, userId);

        // 첨부파일이 있을 경우 key값을 URL로 변환
        // 1. 리스트 목록이 비어있지 않은지 확인
        if (response.getLists() != null) {
            // 2. 각 리스트를 순회 (ListVo)
            response.getLists().forEach(list -> {

                // 3. 해당 리스트에 카드가 있는지 확인
                if (list.getCards() != null) {
                    // 4. 각 카드를 순회 (CardVo)
                    list.getCards().forEach(card -> {

                        // 5. 해당 카드에 파일이 있는지 확인
                        if (card.getFiles() != null) {
                            // 6. 각 파일을 순회하며 URL 변환 (FileVo)
                            card.getFiles().forEach(file -> {
                                // s3FileStorageService URL 변환 메서드
                                String downloadPath = s3FileStorageService.getDownLoadUrl(file.getFilePath(), file.getFileName());
                                file.setFilePath(downloadPath);
                            });
                        }
                    });
                }
            });
        }

        // Owner ID 추출
        Long ownerId = boardMembers.stream()
                .filter(m -> m.getRole() == Role.OWNER)
                .map(BoardMemberResponse::getUserId)
                .findFirst().orElse(null);

        return response.toBuilder()
                .ownerId(ownerId)
                .boardMembers(boardMembers)
                .teamMembers(teamMembers)
                .isFavorite(isFavorite)
                .invitationPermission(invitation)
                .boardSharingPermission(sharing)
                .listEditPermission(listEdit)
                .cardDeletePermission(cardDelete)
                .build();
    }

    @Override
    public String createShareToken(Long boardId, Long userId) {
        // 1. 권한 체크: 보드 관리자(OWNER) 혹은 멤버인지 확인
        // 보드를 볼 수 있는 권한이 있는 사람만 공유 링크를 생성할 수 있도록 제한합니다.
        memberVal.validateBoardSetting(boardId, userId, BoardSettingVo::getBoardSharingPermission);

        // 2. 고유 토큰 생성
        String token = UUID.randomUUID().toString();

        // 3. Redis에 토큰 저장
        // 키 형식: "board_invite:{token}"
        // 값: boardId
        String redisKey = "board_invite:" + token;
        redisUtil.setDataExpire(redisKey, boardId.toString(), 86400L); // 86400초 = 24시간

        return token;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BoardResponse> searchBoards(String keyword) {
        // 검색어가 없으면 빈 리스트 반환
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }
        return boardMapper.searchPublicBoards(keyword);
    }

    /**
     * Helper Methods
     */

    // [이벤트] 보드 삭제 이벤트 발행
    private void publishDeleteEvent(UserVo sender, Long receiverId, BoardVo board) {
        InvitationEvent event = InvitationEvent.builder()
                .senderId(sender.getId())
                .senderNickname(sender.getNickname())
                .senderProfileImg(sender.getProfileImg())
                .receiverId(receiverId)
                .targetName(board.getTitle())
                .type(NotificationType.BOARD_DELETED)
                .build();

        publisher.publishEvent(event);
    }
}
