package com.ssafy.robot_server.controller;

import com.ssafy.robot_server.domain.User;
import com.ssafy.robot_server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("이미 존재하는 이메일입니다.");
        }
        userRepository.save(user);
        return ResponseEntity.ok("회원가입 성공");
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String password = data.get("password");

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user != null && user.getPassword().equals(password)) {
            // 로그인 성공 시 유저 정보 반환 (비밀번호 제외)
            user.setPassword(null);
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(401).body("이메일 또는 비밀번호가 잘못되었습니다.");
    }

    // ✅ 3. 비밀번호 재확인 (설정 페이지 진입용)
    @PostMapping("/verify-password")
    public ResponseEntity<?> verifyPassword(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        String inputPassword = (String) payload.get("password");

        User user = userRepository.findById(userId).orElse(null);

        if (user != null && user.getPassword().equals(inputPassword)) {
            return ResponseEntity.ok("비밀번호 일치");
        }
        return ResponseEntity.status(401).body("비밀번호가 일치하지 않습니다.");
    }

    // ✅ 4. 프로필(이름) 변경
    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("유저 없음");

        user.setName(payload.get("name")); // 이름 변경
        userRepository.save(user); // DB 저장
        
        return ResponseEntity.ok(user); // 변경된 유저 정보 반환
    }

    // ✅ 5. 비밀번호 변경
    @PutMapping("/{id}/password")
    public ResponseEntity<?> updatePassword(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("유저 없음");

        user.setPassword(payload.get("newPassword")); // 비밀번호 변경
        userRepository.save(user); // DB 저장

        return ResponseEntity.ok("비밀번호 변경 완료");
    }
}