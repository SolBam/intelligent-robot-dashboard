import React, { useMemo } from 'react';
import { useRobot } from '@/contexts/RobotContext';
import { FileText, Clock, MapPin, Cat, Trash2, PlusCircle, Calendar } from 'lucide-react';

const LogsPage = () => {
  const { logs, addTestLog, deleteLog } = useRobot();

  // ✅ 로그를 날짜별로 그룹화하는 로직
  const groupedLogs = useMemo(() => {
    const groups = {};
    logs.forEach(log => {
      // 날짜 문자열 추출 (예: 2026. 1. 15.)
      const dateKey = new Date(log.startTime).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
    });
    return groups;
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">활동 로그 리포트</h2>
          <p className="text-sm text-gray-500 mt-1">로봇의 주행 기록과 감지된 이벤트를 날짜별로 확인합니다.</p>
        </div>
        
        {/* 🧪 테스트용 버튼 */}
        <button 
          onClick={addTestLog}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors"
        >
          <PlusCircle size={16} />
          테스트 로그 생성
        </button>
      </div>

      {/* 로그 리스트 (날짜별 그룹) */}
      <div className="space-y-8">
        {Object.keys(groupedLogs).length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-lg border border-dashed">
            <FileText size={48} className="mx-auto mb-4 opacity-20" />
            <p>기록된 활동 로그가 없습니다.</p>
            <p className="text-xs mt-2">상단 버튼을 눌러 테스트 데이터를 만들어보세요.</p>
          </div>
        ) : (
          Object.entries(groupedLogs).map(([date, dayLogs]) => (
            <div key={date} className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
              
              {/* 📅 날짜 헤더 */}
              <div className="flex items-center gap-2 px-1">
                <Calendar size={18} className="text-indigo-600" />
                <h3 className="font-bold text-gray-700">{date}</h3>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {dayLogs.length}건
                </span>
              </div>

              {/* 해당 날짜의 로그들 */}
              <div className="space-y-4">
                {dayLogs.map((log) => (
                  <div key={log.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow relative group">
                    
                    {/* 삭제 버튼 (우측 상단, 마우스 올리면 표시) */}
                    <button 
                      onClick={() => deleteLog(log.id)}
                      className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-2 transition-colors opacity-0 group-hover:opacity-100"
                      title="로그 삭제"
                    >
                      <Trash2 size={18} />
                    </button>

                    {/* 1. 리포트 본문 */}
                    <div className="p-6 pb-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${log.mode === '자동 모드' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                          <FileText size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            {log.mode}
                            {log.status === 'completed' ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold border border-green-200">
                                완료
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200">
                                중단됨
                              </span>
                            )}
                          </h3>
                          <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Clock size={12} /> 
                            {new Date(log.startTime).toLocaleTimeString()} 시작 
                            <span className="text-gray-300">|</span> 
                            {log.duration} 주행
                          </span>
                        </div>
                      </div>

                      {/* 상세 이벤트 내용 */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm text-gray-700">
                        <span className="font-bold text-gray-900 mr-2">📌 이벤트:</span>
                        {log.details}
                      </div>
                    </div>

                    {/* 2. 요약 통계 (하단 바) */}
                    <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100 bg-gray-50/50">
                      <div className="p-3 flex items-center justify-center gap-2">
                        <Cat size={14} className="text-gray-400"/>
                        <span className="text-xs font-medium text-gray-600">감지: <span className="text-gray-900 font-bold">{log.detectionCount}회</span></span>
                      </div>
                      <div className="p-3 flex items-center justify-center gap-2">
                        <MapPin size={14} className="text-gray-400"/>
                        <span className="text-xs font-medium text-gray-600">이동: <span className="text-gray-900 font-bold">{log.distance}m</span></span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogsPage;