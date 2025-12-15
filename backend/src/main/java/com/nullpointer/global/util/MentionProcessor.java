package com.nullpointer.global.util;

import com.nullpointer.domain.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class MentionProcessor {

    private final UserMapper userMapper;

    // 멘션 파싱: (@닉네임 -> User ID Set
    public Set<Long> parseMentions(String content) {
        Set<Long> userIds = new HashSet<>();
        if (content == null) return userIds;

        // 정규식: @ 뒤에 공백이 아닌 문자가 1개 이상 오는 패턴
        Pattern pattern = Pattern.compile("@(\\S+)");
        Matcher matcher = pattern.matcher(content);

        while (matcher.find()) {
            String nickname = matcher.group(1);
            // 닉네임으로 사용자 찾기
            userMapper.findByNickname(nickname)
                    .ifPresent(user -> userIds.add(user.getId()));
        }

        return userIds;
    }

}
