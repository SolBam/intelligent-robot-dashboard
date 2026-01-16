import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';      // ✅ 토큰 없는 순수 요청용 (로그인/회원가입)
import api from '../api/axios'; // ✅ 토큰 필요한 요청용 (인터셉터 포함)
import { toast } from 'sonner';

const AuthContext = createContext();

// ✅ 백엔드 주소 (마지막에 /api 가 붙어있는지 확인하세요)
const BASE_URL = 'http://localhost:8080/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. 새로고침 시 로그인 유지 확인
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("저장된 유저 정보 파싱 에러:", e);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  // 2. 회원가입 (순수 axios 사용 + 상세 로그)
  const register = async (userData) => {
    console.log("🚀 [AuthContext] 회원가입 요청 시작!");
    console.log("📤 보낼 데이터:", userData);
    console.log("🔗 요청 주소:", `${BASE_URL}/users`);

    try {
      // ✅ api 대신 axios 사용 (기존 토큰 간섭 방지)
      const response = await axios.post(`${BASE_URL}/users`, userData);
      
      console.log("✅ [AuthContext] 회원가입 성공 응답:", response);
      toast.success("회원가입 성공! 로그인해주세요.");
      return true;

    } catch (error) {
      console.error("❌ [AuthContext] 회원가입 에러 발생:", error);

      if (error.response) {
        // 서버가 응답을 줬는데 에러인 경우 (400, 401, 500 등)
        console.log("❌ 서버 응답 데이터:", error.response.data);
        console.log("❌ 상태 코드:", error.response.status);
        toast.error(`가입 실패: ${error.response.data || "입력 정보를 확인하세요."}`);
      } else if (error.request) {
        // 요청은 보냈는데 응답이 없는 경우 (서버 꺼짐, 네트워크 오류)
        console.log("❌ 응답 없음 (서버 꺼짐?):", error.request);
        toast.error("서버와 연결할 수 없습니다. 백엔드가 켜져 있나요?");
      } else {
        // 요청 설정 중에 에러 발생
        console.log("❌ 요청 설정 에러:", error.message);
        toast.error("요청 중 오류가 발생했습니다.");
      }
      return false;
    }
  };

  // 3. 로그인 (순수 axios 사용)
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/users/login`, { email, password });
      
      const { token, user: userData } = response.data;
      
      // 토큰 및 유저 정보 저장
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success(`${userData.name}님 환영합니다!`);
      return true;
    } catch (error) {
      console.error("로그인 에러:", error);
      const msg = error.response?.data || "이메일 또는 비밀번호를 확인하세요.";
      toast.error(msg);
      return false;
    }
  };

  // 4. 로그아웃
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.info("로그아웃 되었습니다.");
  };

  // 5. 프로필 수정 (토큰 필요 -> api 객체 사용)
  const updateProfile = async (newName) => {
    try {
      await api.put(`/users/${user.id}/profile`, { name: newName });
      const updatedUser = { ...user, name: newName };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success("이름이 변경되었습니다.");
      return true;
    } catch (error) {
      toast.error("수정 실패");
      return false;
    }
  };

  // 6. 비밀번호 변경 (토큰 필요 -> api 객체 사용)
  const changePassword = async (currentPassword, newPassword) => {
    try {
      // 1차: 현재 비번 확인
      await api.post('/users/verify-password', { 
        userId: user.id, 
        password: currentPassword 
      });
      // 2차: 변경
      await api.put(`/users/${user.id}/password`, { newPassword });
      
      toast.success("비밀번호 변경 완료. 다시 로그인해주세요.");
      logout();
      return true;
    } catch (error) {
      toast.error("비밀번호 변경 실패 (기존 비밀번호가 틀렸을 수 있습니다)");
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      updateProfile, 
      changePassword 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);