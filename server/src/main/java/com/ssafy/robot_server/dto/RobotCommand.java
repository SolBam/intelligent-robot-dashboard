package com.ssafy.robot_server.dto;

public class RobotCommand {
    private String type;   // "MOVE", "STOP", "MODE"
    private double linear; // 전진 속도
    private double angular;// 회전 속도
    private String value;  // 모드 값 ("auto", "manual")

    // Getter & Setter
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public double getLinear() { return linear; }
    public void setLinear(double linear) { this.linear = linear; }
    public double getAngular() { return angular; }
    public void setAngular(double angular) { this.angular = angular; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}