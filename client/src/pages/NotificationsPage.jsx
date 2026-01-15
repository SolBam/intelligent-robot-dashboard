import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Trash2, Info, AlertTriangle, Zap, CheckCircle, PlusCircle, XCircle } from 'lucide-react';

const NotificationsPage = () => {
  const { 
    notifications, markAllAsRead, markAsRead, deleteNotification, unreadCount, 
    clearAllNotifications, addTestNotification 
  } = useNotifications();
  
  const navigate = useNavigate();

  // 알림 스타일 헬퍼
  const getNotificationStyle = (type, priority) => {
    if (priority === 'high' || type === 'robot_error') {
      return { icon: <AlertTriangle size={20} />, bg: 'bg-red-50', text: 'text-red-600', border: 'border-l-red-500' };
    }
    switch (type) {
      case 'robot_status':
        return { icon: <Zap size={20} />, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-l-blue-500' };
      case 'cat_alert':
        return { icon: <Bell size={20} />, bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-l-orange-500' };
      default:
        return { icon: <Info size={20} />, bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-l-gray-300' };
    }
  };

  // ✅ 알림 클릭 핸들러 (페이지 이동)
  const handleNotificationClick = (noti) => {
    // 1. 읽음 처리
    if (!noti.isRead) markAsRead(noti.id);

    // 2. 내용에 따라 페이지 이동
    if (noti.type === 'cat_alert' || noti.title.includes('영상')) {
      navigate('/gallery'); // 갤러리로 이동
    } else if (noti.type === 'robot_error' || noti.type === 'robot_status') {
      navigate('/logs'); // 로그 페이지로 이동
    } else {
      // 일반 알림은 이동 안 함 (혹은 대시보드로)
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. 상단 헤더 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            알림 센터
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 
              ? <span className="text-indigo-600 font-medium">{unreadCount}개의 읽지 않은 알림이 있습니다.</span>
              : "모든 알림을 확인했습니다."}
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* 🧪 테스트용 버튼 */}
          <button onClick={addTestNotification} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-2">
            <PlusCircle size={16} /> 테스트 알림 생성
          </button>

          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 flex items-center gap-2">
              <CheckCircle size={16} /> 모두 읽음
            </button>
          )}

          {notifications.length > 0 && (
            <button onClick={clearAllNotifications} className="px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center gap-2">
              <XCircle size={16} /> 전체 삭제
            </button>
          )}
        </div>
      </div>

      {/* 2. 알림 리스트 */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-200 text-gray-400">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <p>수신된 알림이 없습니다.</p>
          </div>
        ) : (
          notifications.map((noti) => {
            const style = getNotificationStyle(noti.type, noti.priority);
            
            return (
              <div 
                key={noti.id} 
                onClick={() => handleNotificationClick(noti)}
                className={`group bg-white p-5 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md flex gap-4 ${style.border} border-l-4 ${!noti.isRead ? 'bg-indigo-50/10' : ''} cursor-pointer`}
              >
                {/* 아이콘 */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                  {style.icon}
                </div>

                {/* 내용 */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold text-sm mb-1 flex items-center gap-2 ${noti.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                      {noti.title}
                      {!noti.isRead && (
                        <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold animate-pulse">
                          NEW
                        </span>
                      )}
                    </h3>
                    
                    {/* 우측 상단: 시간 & 삭제 버튼 */}
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400">
                        {new Date(noti.timestamp).toLocaleString()}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteNotification(noti.id); }}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        title="알림 삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <p className={`text-sm ${noti.isRead ? 'text-gray-400' : 'text-gray-600'}`}>
                    {noti.message}
                  </p>
                  
                  {!noti.isRead && (
                    <div className="mt-2 text-xs text-indigo-500 font-medium">
                      클릭하여 확인하기 &rarr;
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;