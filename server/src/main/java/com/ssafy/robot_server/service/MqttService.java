package com.ssafy.robot_server.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.robot_server.domain.RobotPose;
import com.ssafy.robot_server.domain.RobotStatus;
import com.ssafy.robot_server.mqtt.MqttGateway;
import com.ssafy.robot_server.repository.RobotPoseRepository;
import com.ssafy.robot_server.repository.RobotStatusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MqttService {

    private final MqttGateway mqttGateway;
    private final RobotStatusRepository statusRepository;
    private final RobotPoseRepository poseRepository;
    
    // JSON 변환기 (글자 -> 자바 객체)
    private final ObjectMapper objectMapper = new ObjectMapper(); 

    // 👇 로봇이 메시지를 보내면 여기가 실행됩니다! (구독)
    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handleMessage(String payload, @Header(MqttHeaders.RECEIVED_TOPIC) String topic) {
        try {
            log.info("📩 도착한 메시지 [{}]: {}", topic, payload);

            // JSON 문자열을 읽어서 트리 구조로 변환
            JsonNode json = objectMapper.readTree(payload);

            if ("/robot/status".equals(topic)) {
                // 1. 상태 데이터 처리 (배터리, 온도)
                RobotStatus s = RobotStatus.builder()
                        .batteryLevel(json.get("batteryLevel").asInt())
                        .temperature(json.get("temperature").asDouble())
                        .isCharging(json.get("isCharging").asBoolean())
                        .build();
                statusRepository.save(s); // DB 저장

            } else if ("/robot/pose".equals(topic)) {
                // 2. 위치 데이터 처리 (X, Y)
                RobotPose p = RobotPose.builder()
                        .x(json.get("x").asDouble())
                        .y(json.get("y").asDouble())
                        .build();
                poseRepository.save(p); // DB 저장
            }

        } catch (Exception e) {
            log.error("❌ 메시지 처리 중 에러 발생: {}", e.getMessage());
        }
    }

    // 👇 웹에서 로봇을 조종할 때 쓸 함수
    public void sendCommand(String topic, String message) {
        mqttGateway.sendToMqtt(message, topic);
    }
}