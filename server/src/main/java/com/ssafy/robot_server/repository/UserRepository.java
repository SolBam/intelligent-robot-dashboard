package com.ssafy.robot_server.repository;

import com.ssafy.robot_server.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email); // 이메일로 회원 찾기 기능
    boolean existsByEmail(String email);      // 이메일 중복 검사 기능
}