package com.ssafy.robot_server.controller;

import com.ssafy.robot_server.domain.Cat;
import com.ssafy.robot_server.repository.CatRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/cats")
@Tag(name = "3. 고양이 관리", description = "반려묘 등록/조회/삭제 API")
public class CatController {

    @Autowired
    private CatRepository catRepository;

    // 1. 내 고양이 목록 조회
    @GetMapping
    @Operation(summary = "고양이 목록 조회")
    public ResponseEntity<List<Cat>> getCats(@RequestParam Long userId) {
        return ResponseEntity.ok(catRepository.findByUserId(userId));
    }

    // 2. 고양이 등록
    @PostMapping
    @Operation(summary = "고양이 등록")
    public ResponseEntity<Cat> addCat(@RequestBody Cat cat) {
        // 기본값 방어 로직
        if (cat.getHealthStatus() == null) cat.setHealthStatus("normal");
        if (cat.getBehaviorStatus() == null) cat.setBehaviorStatus("대기 중");
        cat.setLastDetected(LocalDateTime.now());

        return ResponseEntity.ok(catRepository.save(cat));
    }

    // 3. 고양이 삭제
    @DeleteMapping("/{id}")
    @Operation(summary = "고양이 삭제")
    public ResponseEntity<?> deleteCat(@PathVariable Long id) {
        catRepository.deleteById(id);
        return ResponseEntity.ok("삭제되었습니다.");
    }
}