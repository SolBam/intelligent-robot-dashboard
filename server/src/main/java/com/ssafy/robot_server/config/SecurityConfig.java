package com.ssafy.robot_server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. CSRF 보안 끄기 (API 서버는 보통 끕니다)
            .csrf(csrf -> csrf.disable())
            
            // 2. CORS 허용 설정 적용
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 3. 모든 요청에 대해 로그인 없이 접근 허용 (모두 다 들어와!)
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            );

        return http.build();
    }

    // CORS 설정 (프론트엔드 5173 포트 허용)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        // 허용할 출처 (프론트엔드 주소)
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        
        // 허용할 헤더와 메서드 (GET, POST 등 모든 것 허용)
        config.setAllowedMethods(List.of("*"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}