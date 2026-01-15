import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // 로그인 정보 가져오기 위해 필요
import axios from 'axios';
import { toast } from 'sonner';

const CatContext = createContext();

export const CatProvider = ({ children }) => {
  const { user } = useAuth(); // 현재 로그인한 유저 정보
  const [cats, setCats] = useState([]); // 초기값은 빈 배열 (조건 1)

  // ✅ 1. 로그인한 유저가 바뀌면 그 사람의 고양이 목록 불러오기 (조건 3)
  useEffect(() => {
    if (user && user.id) {
      fetchCats(user.id);
    } else {
      setCats([]); // 로그아웃하면 리스트 비우기
    }
  }, [user]);

  const fetchCats = async (userId) => {
    try {
      const res = await axios.get(`/api/cats?userId=${userId}`);
      setCats(res.data);
    } catch (err) {
      console.error("고양이 목록 불러오기 실패:", err);
    }
  };

  // ✅ 2. 고양이 등록 (DB 저장) (조건 2)
  const addCat = async (catData) => {
    if (!user) return;

    try {
      // 서버로 데이터 전송 (userId 포함)
      await axios.post('/api/cats', {
        ...catData,
        userId: user.id
      });
      
      // 저장 후 목록 다시 불러오기
      fetchCats(user.id);
      toast.success('새 고양이가 DB에 저장되었습니다!');
    } catch (err) {
      console.error("고양이 등록 실패:", err);
      toast.error('등록에 실패했습니다.');
    }
  };

  // ✅ 3. 고양이 삭제
  const deleteCat = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`/api/cats/${id}`);
      // 삭제 후 목록 갱신
      setCats(prev => prev.filter(cat => cat.id !== id));
      toast.info('삭제되었습니다.');
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  // (추가) 나중에 AI 팀이 업데이트해줄 상태 변경 함수
  const updateCatStatus = (id, status) => {
    setCats(prev => prev.map(cat => 
      cat.id === id ? { ...cat, ...status } : cat
    ));
  };

  return (
    <CatContext.Provider value={{ cats, addCat, deleteCat, updateCatStatus }}>
      {children}
    </CatContext.Provider>
  );
};

export const useCats = () => useContext(CatContext);