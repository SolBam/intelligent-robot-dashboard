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
import org.springframework.messaging.simp.SimpMessagingTemplate; // ✅ 웹소켓 통신용
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MqttService {

    private final MqttGateway mqttGateway;
    private final RobotStatusRepository statusRepository;
    private final RobotPoseRepository poseRepository;
    private final SimpMessagingTemplate messagingTemplate; // ✅ [추가] 웹으로 쏘는 확성기
    
    private final ObjectMapper objectMapper = new ObjectMapper(); 

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handleMessage(String payload, @Header(MqttHeaders.RECEIVED_TOPIC) String topic) {
        try {
            // log.info("📩 MQTT 수신 [{}]: {}", topic, payload); (로그 너무 많으면 주석 처리)

            JsonNode json = objectMapper.readTree(payload);

            if ("/robot/status".equals(topic)) {
                // 1. 상태 데이터 저장
                RobotStatus s = RobotStatus.builder()
                        .batteryLevel(json.get("batteryLevel").asInt())
                        .temperature(json.get("temperature").asDouble())
                        .isCharging(json.get("isCharging").asBoolean())
                        // 시뮬레이터가 보낸 좌표도 같이 저장 (엔티티에 필드가 있다면)
                        .x(json.has("x") ? json.get("x").asDouble() : 0.0)
                        .y(json.has("y") ? json.get("y").asDouble() : 0.0)
                        .mode(json.has("mode") ? json.get("mode").asText() : "unknown")
                        .build();
                
                statusRepository.save(s); // DB 저장

                // 2. ✅ [추가] 웹 클라이언트들에게 실시간 전송!
                // (Entity를 그대로 보내거나, Map으로 가공해서 보냄)
                messagingTemplate.convertAndSend("/sub/robot/status", s);

            } else if ("/robot/pose".equals(topic)) {
                RobotPose p = RobotPose.builder()
                        .x(json.get("x").asDouble())
                        .y(json.get("y").asDouble())
                        .build();
                poseRepository.save(p);
            } else if ("/robot/peer/offer".equals(topic)){
                log.info("📹 WebRTC Offer 수신 (로봇 -> 웹)");
                messagingTemplate.convertAndSend("/sub/peer/offer", json);
            }

        } catch (Exception e) {
            log.error("❌ 처리 실패: {}", e.getMessage());
        }
    }

    public void sendCommand(String topic, String message) {
        mqttGateway.sendToMqtt(message, topic);
    }
}