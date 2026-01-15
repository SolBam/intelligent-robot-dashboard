package com.ssafy.robot_server.repository;

import com.ssafy.robot_server.domain.Log;
import com.ssafy.robot_server.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LogRepository extends JpaRepository<Log, Long> {
    // 최신순 정렬
    List<Log> findByUserOrderByStartTimeDesc(User user);
}