package com.ssafy.robot_server.controller;

import com.ssafy.robot_server.domain.Log;
import com.ssafy.robot_server.repository.LogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
@Tag(name = "2. 로그 관리", description = "로봇 순찰 로그 API")
public class LogController {

    @Autowired
    private LogRepository logRepository;

    // 목록 조회
    @GetMapping
    public ResponseEntity<List<Log>> getLogs(@RequestParam Long userId) {
        return ResponseEntity.ok(logRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    // 생성
    @PostMapping
    public ResponseEntity<Log> createLog(@RequestBody Log log) {
        return ResponseEntity.ok(logRepository.save(log));
    }

    // 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLog(@PathVariable Long id) {
        logRepository.deleteById(id);
        return ResponseEntity.ok("삭제 완료");
    }
}