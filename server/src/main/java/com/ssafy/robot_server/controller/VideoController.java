package com.ssafy.robot_server.controller;

import com.ssafy.robot_server.domain.Video;
import com.ssafy.robot_server.domain.User;
import com.ssafy.robot_server.repository.VideoRepository;
import com.ssafy.robot_server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. 내 영상 목록 조회
    @GetMapping
    public ResponseEntity<?> getMyVideos(@RequestParam Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("유저 없음");

        List<Video> videos = videoRepository.findByUserOrderByTimestampDesc(user);
        return ResponseEntity.ok(videos);
    }

    // 2. 영상 저장 (AI 팀 또는 테스트용)
    @PostMapping
    public ResponseEntity<?> saveVideo(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("유저 없음");

        Video video = new Video();
        video.setCatName((String) payload.get("catName"));
        video.setBehavior((String) payload.get("behavior"));
        video.setDuration((String) payload.get("duration"));
        video.setThumbnailUrl((String) payload.get("thumbnailUrl")); // 실제론 S3 URL 등
        video.setUser(user);

        videoRepository.save(video);
        return ResponseEntity.ok("영상 저장 완료");
    }

    // 3. 영상 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVideo(@PathVariable Long id) {
        videoRepository.deleteById(id);
        return ResponseEntity.ok("삭제 완료");
    }
}