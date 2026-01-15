package com.ssafy.robot_server.controller;

import com.ssafy.robot_server.domain.Notification;
import com.ssafy.robot_server.domain.User;
import com.ssafy.robot_server.repository.NotificationRepository;
import com.ssafy.robot_server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. 목록 조회
    @GetMapping
    public ResponseEntity<?> getNotifications(@RequestParam Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("유저 없음");
        return ResponseEntity.ok(notificationRepository.findByUserOrderByTimestampDesc(user));
    }

    // 2. 알림 생성 (로봇/AI 전송용)
    @PostMapping
    public ResponseEntity<?> createNotification(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("유저 없음");

        Notification noti = new Notification();
        noti.setType((String) payload.get("type"));
        noti.setTitle((String) payload.get("title"));
        noti.setMessage((String) payload.get("message"));
        noti.setPriority((String) payload.get("priority"));
        noti.setRead(false);
        noti.setUser(user);

        notificationRepository.save(noti);
        return ResponseEntity.ok("알림 저장 완료");
    }

    // 3. 읽음 처리
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification noti = notificationRepository.findById(id).orElse(null);
        if (noti != null) {
            noti.setRead(true);
            notificationRepository.save(noti);
        }
        return ResponseEntity.ok("읽음 처리 완료");
    }

    // 4. 모두 읽음 처리
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestParam Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("유저 없음");
        
        List<Notification> list = notificationRepository.findByUserOrderByTimestampDesc(user);
        for (Notification n : list) {
            n.setRead(true);
        }
        notificationRepository.saveAll(list);
        return ResponseEntity.ok("모두 읽음 처리 완료");
    }

    // 5. 삭제 (단건)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        notificationRepository.deleteById(id);
        return ResponseEntity.ok("삭제 완료");
    }

    // 6. 전체 삭제
    @DeleteMapping("/all")
    public ResponseEntity<?> deleteAllNotifications(@RequestParam Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("유저 없음");
        
        notificationRepository.deleteByUser(user);
        return ResponseEntity.ok("전체 삭제 완료");
    }
}