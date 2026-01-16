package com.ssafy.robot_server.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "cats")
public class Cat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ 객체(User) 대신 숫자(userId)로 저장 (Log와 통일)
    private Long userId;

    @Column(nullable = false)
    private String name;

    private String breed;
    private int age;
    private double weight;
    private String notes;

    // 상태값 (기본값 설정)
    private String healthStatus = "normal"; // normal, warning
    private String behaviorStatus = "대기 중"; // sleeping, active 등
    private LocalDateTime lastDetected;
}