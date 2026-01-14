package com.ssafy.robot_server.mqtt;

import org.springframework.integration.annotation.MessagingGateway;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.messaging.handler.annotation.Header;

@MessagingGateway(defaultRequestChannel = "mqttOutboundChannel")
public interface MqttGateway {
    
    // 이 함수를 호출하면 MQTT로 메시지가 날아갑니다.
    void sendToMqtt(String data, @Header(MqttHeaders.TOPIC) String topic);
}