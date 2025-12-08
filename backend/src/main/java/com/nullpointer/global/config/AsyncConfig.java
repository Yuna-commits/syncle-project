package com.nullpointer.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync // 비동기 기능 활성화
public class AsyncConfig {
    /**
     * 스레드 개수 제한, 그 이상의 요청은 Queue에서 관리
     */
    @Bean(name = "mailExecutor")
    public Executor mailExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5); // 평소에 대기하는 스레드 수
        executor.setMaxPoolSize(10); // 바쁠 때 늘릴 최대 스레드 수
        executor.setQueueCapacity(50); // 대기열 크기
        executor.setThreadNamePrefix("MailAsync-");
        executor.initialize();
        return executor;
    }
}
