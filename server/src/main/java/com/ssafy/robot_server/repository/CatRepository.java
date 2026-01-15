package com.ssafy.robot_server.repository;

import com.ssafy.robot_server.domain.Cat;
import com.ssafy.robot_server.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CatRepository extends JpaRepository<Cat, Long> {
    // 특정 유저의 고양이 목록만 가져오기
    List<Cat> findByUser(User user);
}