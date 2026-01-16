package com.ssafy.robot_server.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "logs")
public class Log {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;        // ✅ 숫자 ID로 변경 (User 객체 X)

    private String mode;
    private String status;
    private String duration;
    private int durationNum;    // ✅ 그래프용 숫자 필드
    private double distance;
    private int detectionCount;
    private String details;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}