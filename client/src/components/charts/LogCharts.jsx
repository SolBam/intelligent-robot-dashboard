import React, { useMemo } from 'react';
import { useRobot } from '@/contexts/RobotContext'; // ✅ 실제 데이터 가져오기
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Clock, AlertTriangle } from 'lucide-react';

const LogCharts = () => {
  const { logs } = useRobot(); // ✅ 저장된 로그 목록 가져오기

  // 📊 로그 데이터를 요일별 통계로 변환하는 함수
  const chartData = useMemo(() => {
    // 1. 초기 데이터 (월~일)
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const stats = days.map(day => ({ name: day, duration: 0, events: 0 }));

    // 2. 로그 하나씩 까보면서 더하기
    logs.forEach(log => {
      // createdDate가 없으면 현재 시간으로 가정 (테스트 데이터용)
      const date = log.createdAt ? new Date(log.createdAt) : new Date();
      const dayIndex = date.getDay(); // 0(일) ~ 6(토)
      
      // 순찰 시간 합산 (문자열 "5분"에서 숫자만 추출하거나 durationNum 사용)
      const duration = log.durationNum || 5; 
      
      // 감지 횟수 합산
      const events = log.detectionCount || 0;

      stats[dayIndex].duration += duration;
      stats[dayIndex].events += events;
    });

    // 월요일부터 시작하게 배열 순서 조정 (일요일을 맨 뒤로)
    const sunday = stats.shift();
    stats.push(sunday);

    return stats;
  }, [logs]); // logs가 변할 때마다 재계산

  // 총계 계산
  const totalDuration = chartData.reduce((acc, cur) => acc + cur.duration, 0);
  const totalEvents = chartData.reduce((acc, cur) => acc + cur.events, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* 1. 순찰 시간 차트 */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">주간 순찰 시간</h3>
            <p className="text-xs text-gray-500">이번 주 총 {totalDuration}분 순찰</p>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}> {/* ✅ 가짜 data 대신 계산된 chartData 사용 */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#F3F4F6' }}
              />
              <Bar dataKey="duration" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} name="순찰 시간(분)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. 이벤트 감지 차트 */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-red-50 rounded-lg text-red-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">주간 감지 리포트</h3>
            <p className="text-xs text-gray-500">이번 주 총 {totalEvents}건 감지</p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}> {/* ✅ 여기도 chartData 사용 */}
              <defs>
                <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="events" 
                stroke="#ef4444" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorEvents)" 
                name="감지 건수"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default LogCharts;