import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 새로고침해도 로그인 유지
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // ✅ 진짜 로그인 (서버 통신)
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/users/login', { email, password });
      if (res.status === 200) {
        const userData = res.data;
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        return true;
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      return false;
    }
    return false;
  };

  // ✅ 진짜 회원가입 (서버 통신)
  const signup = async (email, password, name) => {
    try {
      const res = await axios.post('/api/users/signup', { email, password, name });
      if (res.status === 200) {
        return true; // 성공
      }
    } catch (error) {
      console.error("회원가입 실패:", error);
      return false;
    }
  };

  // ✅ 비밀번호 재확인 함수
  const verifyUserPassword = async (password) => {
    if (!user) return false;
    try {
      const res = await axios.post('/api/users/verify-password', {
        userId: user.id,
        password: password
      });
      return res.status === 200;
    } catch (error) {
      console.error("비밀번호 검증 실패:", error);
      return false;
    }
  };

  // ✅ 1. 프로필(이름) 변경 요청
  const updateProfile = async (newName) => {
    if (!user) return false;
    try {
      const res = await axios.put(`/api/users/${user.id}/profile`, { name: newName });
      
      // 화면과 로컬스토리지의 정보도 즉시 갱신 (새로고침 안 해도 바뀌게)
      const updatedUser = { ...user, name: newName };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      return true;
    } catch (error) {
      console.error("프로필 수정 실패:", error);
      return false;
    }
  };

  // ✅ 2. 비밀번호 변경 요청
  const updatePassword = async (newPassword) => {
    if (!user) return false;
    try {
      await axios.put(`/api/users/${user.id}/password`, { newPassword });
      return true;
    } catch (error) {
      console.error("비밀번호 변경 실패:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{
        user, login, signup, logout, isLoading,
        verifyUserPassword, updateProfile, updatePassword
        }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);