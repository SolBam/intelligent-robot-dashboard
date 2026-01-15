package com.ssafy.robot_server.controller;

import com.ssafy.robot_server.domain.Cat;
import com.ssafy.robot_server.domain.User;
import com.ssafy.robot_server.repository.CatRepository;
import com.ssafy.robot_server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cats")
public class CatController {

    @Autowired
    private CatRepository catRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. 내 고양이 목록 조회
    @GetMapping
    public ResponseEntity<?> getMyCats(@RequestParam Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("유저를 찾을 수 없습니다.");

        List<Cat> cats = catRepository.findByUser(user);
        return ResponseEntity.ok(cats);
    }

    // 2. 고양이 등록
    @PostMapping
    public ResponseEntity<?> registerCat(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("유저를 찾을 수 없습니다.");

        Cat cat = new Cat();
        cat.setName((String) payload.get("name"));
        cat.setBreed((String) payload.get("breed"));
        cat.setAge(Integer.parseInt(payload.get("age").toString()));
        cat.setWeight(Double.parseDouble(payload.get("weight").toString()));
        cat.setNotes((String) payload.get("notes"));
        cat.setUser(user); // 주인 설정
        
        // 초기값 설정
        cat.setHealthStatus("normal");
        cat.setBehaviorStatus("대기 중");
        cat.setLastDetected(LocalDateTime.now());

        catRepository.save(cat);
        return ResponseEntity.ok("고양이 등록 완료");
    }

    // 3. 고양이 삭제
    @DeleteMapping("/{catId}")
    public ResponseEntity<?> deleteCat(@PathVariable Long catId) {
        catRepository.deleteById(catId);
        return ResponseEntity.ok("삭제 완료");
    }
}