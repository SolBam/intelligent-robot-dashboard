package com.ssafy.robot_server.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "videos")
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String catName;     // 감지된 고양이 이름
    private String behavior;    // 감지된 행동 (그루밍, 수면 등)
    private String duration;    // 영상 길이 (예: "12초")
    private LocalDateTime timestamp; // 촬영 시간

    // 실제 파일 경로나 URL (지금은 테스트용 더미 URL 저장)
    private String thumbnailUrl;
    private String videoUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @PrePersist
    public void onCreate() {
        if (this.timestamp == null) this.timestamp = LocalDateTime.now();
    }
}