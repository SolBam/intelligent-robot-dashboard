package com.ssafy.robot_server.controller;

import com.ssafy.robot_server.dto.RobotCommand;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;

@Controller
public class RobotController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // 로봇의 현재 상태 (메모리에 저장)
    private double x = 50.0; // 지도 중앙 (0~100)
    private double y = 50.0;
    private double battery = 100.0;
    private String mode = "manual";
    
    // 현재 속도
    private double currentLinear = 0.0;
    private double currentAngular = 0.0;

    // 1. 프론트엔드 명령 수신 (W,A,S,D 누르면 여기로 옴)
    @MessageMapping("/robot/control")
    public void handleControl(RobotCommand command) {
        System.out.println("🕹️ 명령 수신: " + command.getType());

        if ("MOVE".equals(command.getType())) {
            this.currentLinear = command.getLinear();
            this.currentAngular = command.getAngular();
        } else if ("STOP".equals(command.getType())) {
            this.currentLinear = 0;
            this.currentAngular = 0;
        } else if ("MODE".equals(command.getType())) {
            this.mode = command.getValue();
        }
    }

    // 2. 0.1초마다 로봇 상태 업데이트 및 방송 (시뮬레이션)
    @Scheduled(fixedRate = 100) // 100ms 마다 실행
    public void broadcastRobotStatus() {
        // (1) 위치 계산 (단순 시뮬레이션)
        // 속도가 있을 때만 위치 이동
        if (currentLinear != 0 || currentAngular != 0) {
            // 회전은 x, y 좌표 이동 방향에 영향을 줌 (간소화해서 구현)
            x -= currentAngular * 0.5; 
            y -= currentLinear * 0.5;  // 화면상 위쪽이 y 감소

            // 지도 밖으로 나가지 않게 막기 (0~100)
            x = Math.max(0, Math.min(100, x));
            y = Math.max(0, Math.min(100, y));

            // 배터리 소모
            battery -= 0.01;
        }

        // (2) 상태 메시지 생성
        Map<String, Object> status = new HashMap<>();
        status.put("isOnline", true);
        status.put("mode", mode);
        status.put("battery", Math.round(battery * 10) / 10.0);
        
        Map<String, Double> position = new HashMap<>();
        position.put("x", x);
        position.put("y", y);
        status.put("position", position);

        // (3) 구독자 모두에게 발송 (/sub/robot/status)
        messagingTemplate.convertAndSend("/sub/robot/status", status);
    }
}