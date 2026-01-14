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
@Table(name = "robot_pose")
public class RobotPose {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double x; // 가로 위치
    
    private double y; // 세로 위치

    @CreationTimestamp
    private Timestamp timestamp; // 시간 기록
}