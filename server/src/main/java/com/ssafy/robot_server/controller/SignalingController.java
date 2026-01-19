package com.ssafy.robot_server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Map; // ✅ Map 임포트 필수!

@Controller
@CrossOrigin(origins = "*")
public class SignalingController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // 1. Offer 수신 (Robot -> Web)
    // 🚨 수정: String -> Map<String, Object>
    @MessageMapping("/peer/offer")
    public void processOffer(@Payload Map<String, Object> offer) {
        System.out.println("📹 [WebRTC] Offer 수신 (From Robot)");
        messagingTemplate.convertAndSend("/sub/peer/offer", offer);
    }

    // 2. Answer 수신 (Web -> Robot)
    // 🚨 수정: String -> Map<String, Object>
    // @MessageMapping("/peer/answer")
    // public void processAnswer(@Payload Map<String, Object> answer) {
    //     System.out.println("📹 [WebRTC] Answer 수신 (From Web)");
    //     messagingTemplate.convertAndSend("/sub/peer/answer", answer);
    // }

    // 3. Candidate 교환 (Web <-> Robot)
    // 🚨 수정: String -> Map<String, Object>
    @MessageMapping("/peer/candidate")
    public void processCandidate(@Payload Map<String, Object> candidate) {
        System.out.println("📹 [WebRTC] Candidate 교환");
        messagingTemplate.convertAndSend("/sub/peer/candidate", candidate);
    }
}