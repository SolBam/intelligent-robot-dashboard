package com.ssafy.robot_server.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.sql.Timestamp;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "robot_status")
public class RobotStatus {
    
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 데이터 고유 번호

    private int batteryLevel;   // 배터리 잔량 (0~100)
    
    private double temperature; // 로봇 온도
    
    private boolean isCharging; // 충전 중인지 여부

    @CreationTimestamp
    private Timestamp timestamp; // 데이터가 들어온 시간 (자동 생성)
}