package com.ssafy.robot_server.repository;

import com.ssafy.robot_server.domain.Video;
import com.ssafy.robot_server.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VideoRepository extends JpaRepository<Video, Long> {
    // 최신순으로 정렬해서 가져오기
    List<Video> findByUserOrderByTimestampDesc(User user);
}