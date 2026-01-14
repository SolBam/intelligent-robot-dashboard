package com.ssafy.robot_server.controller;

import com.ssafy.robot_server.domain.RobotPose;
import com.ssafy.robot_server.domain.RobotStatus;
import com.ssafy.robot_server.repository.RobotPoseRepository;
import com.ssafy.robot_server.repository.RobotStatusRepository;
import com.ssafy.robot_server.service.MqttService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/robot") // 기본 주소 설정
@RequiredArgsConstructor
public class RobotController {

    private final RobotStatusRepository statusRepository;
    private final RobotPoseRepository poseRepository;
    private final MqttService mqttService;

    // 1. [상태 조회] 배터리, 온도 등 최신 상태 1개 가져오기
    // GET http://localhost:8080/api/robot/latest
    @GetMapping("/latest")
    public RobotStatus getLatestStatus() {
        return statusRepository.findTopByOrderByIdDesc();
    }

    // 2. [위치 조회] 가장 최근 위치 1개 가져오기 (지도 표시용)
    // GET http://localhost:8080/api/robot/pose/recent
    @GetMapping("/pose/recent")
    public RobotPose getRecentPose() {
        // 페이징 기능을 이용해 ID 역순(최신순)으로 정렬 후 1개만 가져옴
        return poseRepository.findAll(PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "id")))
                .stream().findFirst().orElse(null);
    }

    // 3. [로봇 제어] 조이스틱 명령을 받아서 로봇에게 전송
    // POST http://localhost:8080/api/robot/control
    @PostMapping("/control")
    public String controlRobot(@RequestBody Map<String, Double> cmd) {
        // 프론트에서 받은 x, y 값을 로봇이 알아듣는 포맷(JSON)으로 변환
        // 예: {"linear": 0.5, "angular": -0.2}
        String message = String.format("{\"linear\": %.2f, \"angular\": %.2f}", 
                                       cmd.get("linear"), cmd.get("angular"));
        
        // MQTT 주제 '/cmd_vel'로 메시지 발송
        mqttService.sendCommand("/cmd_vel", message);
        
        return "Command Sent: " + message;
    }
}