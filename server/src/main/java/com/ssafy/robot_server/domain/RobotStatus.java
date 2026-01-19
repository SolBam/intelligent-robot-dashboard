package com.ssafy.robot_server.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@Builder              // ✅ MqttService 에러 해결 (Builder 패턴 추가)
@NoArgsConstructor    // ✅ JPA 필수
@AllArgsConstructor   // ✅ Builder 사용 시 필수
public class RobotStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ MqttService에서 사용하는 필드명으로 통일
    private Integer batteryLevel; // (기존 battery -> batteryLevel 변경)
    private Double temperature;
    private Boolean isCharging;

    // ✅ RobotController (시뮬레이터)에서 사용하는 필드
    private Double x;
    private Double y;
    private String mode;
    
    private LocalDateTime timestamp;

    // ✅ RobotController와의 호환성을 위한 생성자
    // (시뮬레이터는 temperature, isCharging 정보가 없으므로 null 처리)
    public RobotStatus(Double battery, Double x, Double y, String mode) {
        this.batteryLevel = (battery != null) ? battery.intValue() : 0; // Double -> Integer 변환
        this.x = x;
        this.y = y;
        this.mode = mode;
        this.temperature = 0.0; // 기본값
        this.isCharging = false; // 기본값
        this.timestamp = LocalDateTime.now();
    }
}