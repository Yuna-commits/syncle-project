package com.nullpointer.global.config;

import com.nullpointer.global.common.annotation.LoginUserArgumentResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final LoginUserArgumentResolver loginUserArgumentResolver;

    @Value("${app.file.upload-dir}")
    private String uploadDir;

    /**
     * upload-dir 로컬 폴더에 저장된 파일을
     * 브라우저가 http://localhost:8080/uploads/abc.jpg로 접근할 수 있게 매핑 필요
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 브라우저 접근 : /uploads/**
        // 실제 로컬 파일 경로 : file:./uploads/
        String path = Paths.get(uploadDir).toAbsolutePath().toUri().toString();

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(path);
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(loginUserArgumentResolver);
    }
}
