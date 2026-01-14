package com.ssafy.robot_server.repository;

import com.ssafy.robot_server.domain.RobotPose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RobotPoseRepository extends JpaRepository<RobotPose, Long> {
    // 기본 CRUD 기능 자동 제공 (저장, 전체 조회, 삭제 등)
}