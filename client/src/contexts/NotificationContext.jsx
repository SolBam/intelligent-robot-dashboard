import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { toast } from 'sonner';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  // 1. 알림 목록 불러오기
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`/api/notifications?userId=${user.id}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("알림 로드 실패:", err);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
    else setNotifications([]);
  }, [user]);

  // 2. 알림 추가 (DB 저장 - 로봇/AI가 호출한다고 가정)
  const addNotification = async (notiData) => {
    if (!user) return;
    try {
      await axios.post('/api/notifications', { ...notiData, userId: user.id });
      fetchNotifications(); // 목록 갱신

      // 중요 알림은 토스트 띄우기
      if (notiData.priority === 'high') toast.error(notiData.title, { description: notiData.message });
      else toast.info(notiData.title, { description: notiData.message });
    } catch (err) {
      console.error("알림 생성 실패:", err);
    }
  };

  // 3. 읽음 처리
  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error(err); }
  };

  // 4. 모두 읽음 처리
  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await axios.put(`/api/notifications/read-all?userId=${user.id}`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('모든 알림을 읽음 처리했습니다.');
    } catch (err) { console.error(err); }
  };

  // 5. 삭제 (단건)
  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.info('알림이 삭제되었습니다.');
    } catch (err) { console.error(err); }
  };

  // 6. 전체 삭제 (New!)
  const clearAllNotifications = async () => {
    if (!user || !confirm("모든 알림을 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/notifications/all?userId=${user.id}`);
      setNotifications([]);
      toast.success('모든 알림이 삭제되었습니다.');
    } catch (err) { console.error(err); }
  };

  // 🧪 7. [테스트용] 다양한 알림 생성 함수
  const addTestNotification = async () => {
    if (!user) return toast.error("로그인이 필요합니다.");

    const scenarios = [
      { type: 'robot_error', title: '배터리 부족', message: '배터리가 15% 이하입니다. 충전소로 복귀합니다.', priority: 'high' },
      { type: 'robot_error', title: '이동 중 에러', message: '장애물로 인해 경로가 막혔습니다. 우회 경로 탐색 중...', priority: 'high' },
      { type: 'cat_alert', title: '새로운 영상 감지', message: '거실에서 고양이(나비)가 감지되었습니다.', priority: 'medium' },
      { type: 'system', title: '소프트웨어 업데이트', message: '새로운 펌웨어 버전(v2.1.0)이 설치되었습니다.', priority: 'low' },
      { type: 'robot_status', title: '충전 완료', message: '로봇 배터리 충전이 100% 완료되었습니다.', priority: 'low' }
    ];

    const randomData = scenarios[Math.floor(Math.random() * scenarios.length)];
    await addNotification(randomData);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ 
      notifications, unreadCount,
      addNotification, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications,
      addTestNotification // 테스트용 함수 노출
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);