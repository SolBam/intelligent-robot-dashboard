package com.ssafy.robot_server.repository;

import com.ssafy.robot_server.domain.RobotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RobotStatusRepository extends JpaRepository<RobotStatus, Long> {
    
    // ID를 기준으로 내림차순 정렬해서 가장 위에 있는 1개(최신 데이터)를 가져옴
    RobotStatus findTopByOrderByIdDesc();
}