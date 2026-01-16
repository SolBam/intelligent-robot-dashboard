package com.ssafy.robot_server.controller;

import com.ssafy.robot_server.domain.Video;
import com.ssafy.robot_server.repository.VideoRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/videos") // 👈 프론트엔드가 요청하는 주소와 일치해야 함
@Tag(name = "4. 영상 관리", description = "특이행동 영상 API")
public class VideoController {

    @Autowired
    private VideoRepository videoRepository;

    // 1. 목록 조회
    @GetMapping
    public ResponseEntity<List<Video>> getVideos(@RequestParam Long userId) {
        return ResponseEntity.ok(videoRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    // 2. 영상 생성 (이게 없으면 404/403 에러 발생!)
    @PostMapping
    @Operation(summary = "영상 생성")
    public ResponseEntity<Video> createVideo(@RequestBody Video video) {
        return ResponseEntity.ok(videoRepository.save(video));
    }

    // 3. 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVideo(@PathVariable Long id) {
        videoRepository.deleteById(id);
        return ResponseEntity.ok("삭제 완료");
    }
}