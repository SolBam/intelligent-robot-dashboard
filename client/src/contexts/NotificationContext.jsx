import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  // ✅ 1. 초기화 시 LocalStorage에서 불러오기 (새로고침 해결)
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ 2. 알림이 변경될 때마다 LocalStorage에 저장
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    // 안 읽은 개수 업데이트
    const count = notifications.filter(n => !n.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  // 알림 추가 함수
  const addNotification = ({ type, title, message, link = null }) => {
    const newNoti = {
      id: Date.now(),
      timestamp: new Date(),
      isRead: false,
      type, title, message, link // 링크 정보 저장
    };

    setNotifications(prev => [newNoti, ...prev]);
    
    // 토스트 팝업 (화면 상단 알림)
    toast(title, { 
      description: message,
      action: link ? { label: '이동', onClick: () => window.location.href = link } : null
    });
  };

  // 테스트용 알림 생성기
  const addTestNotification = () => {
    addNotification({
      type: 'alert',
      title: '⚠️ 테스트 경고',
      message: '이 알림을 누르면 로그 페이지로 이동합니다.',
      link: '/logs' // ✅ 이동 테스트용 링크
    });
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('notifications'); // 저장소에서도 삭제
    toast.info("모든 알림이 삭제되었습니다.");
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, unreadCount, 
      addNotification, addTestNotification,
      markAsRead, markAllAsRead, removeNotification, clearAllNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);