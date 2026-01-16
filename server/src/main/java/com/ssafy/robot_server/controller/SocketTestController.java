package com.ssafy.robot_server.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class SocketTestController {

    // 1. 프론트엔드가 "/pub/test"로 메시지를 보내면 이 함수가 실행됨
    @MessageMapping("/test")
    // 2. 이 함수가 리턴하는 값은 "/sub/test"를 구독하고 있는 모든 사람에게 방송됨
    @SendTo("/sub/test")
    public String testHandler(String message) {
        System.out.println("📨 [서버] 수신한 메시지: " + message);
        return "서버 응답: " + message + " (연결 성공!)";
    }
}