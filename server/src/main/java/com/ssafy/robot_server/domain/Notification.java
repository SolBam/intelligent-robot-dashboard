package com.ssafy.robot_server.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;     // robot_status, robot_error, cat_alert, system
    private String title;
    private String message;
    private String priority; // high, medium, low
    
    private boolean isRead;  // 읽음 여부

    private LocalDateTime timestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @PrePersist
    public void onCreate() {
        if (this.timestamp == null) this.timestamp = LocalDateTime.now();
    }
}