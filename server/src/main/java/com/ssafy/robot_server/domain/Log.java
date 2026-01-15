package com.ssafy.robot_server.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "logs")
public class Log {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String mode;        // "자동 모드" or "수동 제어"
    private String status;      // "completed" or "interrupted"
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String duration;    // "10분", "35초" 등

    // 통계 정보
    private int detectionCount; // 감지된 횟수
    private double distance;    // 이동 거리 (m)

    // 상세 내용 (String으로 간단히 저장, 필요시 JSON 변환 가능)
    // 예: "나비(수면) 감지됨, 주방 정찰 완료"
    @Column(length = 1000)
    private String details;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @PrePersist
    public void onCreate() {
        if (this.startTime == null) this.startTime = LocalDateTime.now();
    }
}