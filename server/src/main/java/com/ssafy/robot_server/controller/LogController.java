package com.ssafy.robot_server.controller;

import com.ssafy.robot_server.domain.Log;
import com.ssafy.robot_server.domain.User;
import com.ssafy.robot_server.repository.LogRepository;
import com.ssafy.robot_server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    @Autowired
    private LogRepository logRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. 내 로그 목록 조회
    @GetMapping
    public ResponseEntity<?> getMyLogs(@RequestParam Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("유저 없음");

        List<Log> logs = logRepository.findByUserOrderByStartTimeDesc(user);
        return ResponseEntity.ok(logs);
    }

    // 2. 로그 저장 (테스트용 및 로봇 전송용)
    @PostMapping
    public ResponseEntity<?> saveLog(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("유저 없음");

        Log log = new Log();
        log.setMode((String) payload.get("mode"));
        log.setStatus((String) payload.get("status"));
        log.setDuration((String) payload.get("duration"));
        log.setDistance(Double.parseDouble(payload.get("distance").toString()));
        log.setDetectionCount(Integer.parseInt(payload.get("detectionCount").toString()));
        log.setDetails((String) payload.get("details"));
        log.setUser(user);
        
        // 시간 설정 (현재 시간 기준)
        log.setStartTime(LocalDateTime.now().minusMinutes(Long.parseLong(payload.get("durationNum").toString())));
        log.setEndTime(LocalDateTime.now());

        logRepository.save(log);
        return ResponseEntity.ok("로그 저장 완료");
    }

    // 3. 로그 삭제 (추가된 부분)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLog(@PathVariable Long id) {
        logRepository.deleteById(id);
        return ResponseEntity.ok("로그 삭제 완료");
    }
}