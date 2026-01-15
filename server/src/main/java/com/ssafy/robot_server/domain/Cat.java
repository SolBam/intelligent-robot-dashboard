package com.ssafy.robot_server.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

    @Column(nullable = false)
    private String name;

    private String breed;
    private int age;
    private double weight;
    private String notes;

    // AI/로봇이 업데이트해줄 상태값 (기본값 설정)
    private String healthStatus = "normal"; // normal, warning
    private String behaviorStatus = "대기 중"; // sleeping, active 등
    private LocalDateTime lastDetected;

    // ✅ 어떤 주인의 고양이인지 연결 (다대일 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore // 유저 정보까지 무한루프로 조회되지 않게 막음
    private User user;
}