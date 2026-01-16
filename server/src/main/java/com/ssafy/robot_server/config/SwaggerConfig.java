package com.ssafy.robot_server.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("🤖 지능형 로봇 관제 시스템 API")
                        .description("로봇 제어, 영상 스트리밍, 로그 관리를 위한 백엔드 API 명세서입니다.")
                        .version("v1.0.0"));
    }
}