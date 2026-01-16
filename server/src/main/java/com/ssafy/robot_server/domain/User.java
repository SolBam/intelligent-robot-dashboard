package com.ssafy.robot_server.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;     // 👈 추가됨
import jakarta.validation.constraints.NotBlank;  // 👈 추가됨
import jakarta.validation.constraints.Size;      // 👈 추가됨
import lombok.Data;

@Entity
@Data
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank(message = "이름은 필수 입력 값입니다.") // 빈칸 금지
    private String name;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "이메일은 필수 입력 값입니다.")
    @Email(message = "이메일 형식이 올바르지 않습니다.") // @포함 여부 등 체크
    private String email;

    @Column(nullable = false)
    @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
    @Size(min = 6, message = "비밀번호는 최소 6자 이상이어야 합니다.") // 길이 제한
    private String password;
}