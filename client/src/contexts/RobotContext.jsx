import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { toast } from 'sonner';

const RobotContext = createContext();

export const RobotProvider = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  // ⭐ [테스트 모드 스위치]
  const IS_TEST_MODE = true; 

  /* ============================================================
     1. 로봇 상태 및 제어 관련 상태
     ============================================================ */
  const [robotStatus, setRobotStatus] = useState({
    isOnline: false,
    battery: 80, 
    networkStatus: 'connected',
    position: { x: 50, y: 50 },
    speed: 0,
    mode: 'auto', // ✅ 1. 기본값을 'auto'로 변경
    lastUpdate: new Date().toISOString(),
  });

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isVoiceCloned, setIsVoiceCloned] = useState(false);
  const [useClonedVoice, setUseClonedVoice] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // 데이터 상태
  const [videos, setVideos] = useState([]);
  const [logs, setLogs] = useState([]);

  /* ============================================================
     2. 로봇 상태 동기화 (Polling)
     ============================================================ */
  useEffect(() => {
    const fetchStatus = async () => {
      if (IS_TEST_MODE) {
        setRobotStatus(prev => ({
          ...prev,
          isOnline: true,
          battery: Math.max(0, prev.battery - 0.01),
          lastUpdate: new Date().toISOString()
        }));
      } else {
        try {
          const res = await axios.get('/api/robot/latest');
          if (res.data) {
            setRobotStatus(prev => ({
              ...prev,
              isOnline: true,
              battery: res.data.batteryLevel,
              // 실제 API에서 mode도 가져와야 함 (여기선 생략)
              lastUpdate: new Date().toISOString(),
            }));
          }
        } catch (err) {
          setRobotStatus(prev => ({ ...prev, isOnline: false }));
        }
      }
    };
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  /* ============================================================
     3. 로봇 제어 함수들
     ============================================================ */
  
  // (1) 모드 전환 (자동 <-> 수동) ✅ 수정됨
  const toggleMode = () => {
    const newMode = robotStatus.mode === 'auto' ? 'manual' : 'auto';
    setRobotStatus(prev => ({ ...prev, mode: newMode }));
    
    // 알림 생성
    addNotification({ 
      type: 'robot_status', 
      title: '모드 변경', 
      message: `로봇이 ${newMode === 'auto' ? '자동' : '수동'} 모드로 전환되었습니다.` 
    });

    if (!IS_TEST_MODE) {
       // 실제 로봇에게 모드 변경 명령 전송
       // axios.post('/api/robot/mode', { mode: newMode });
    }
  };

  // (2) 이동 명령 (수동 모드일 때만 동작하도록 가드 추가)
  const moveRobot = async (linear, angular) => {
    // 자동 모드일 때는 수동 조작 무시 (또는 경고)
    if (robotStatus.mode === 'auto') {
      // toast.warning("자동 모드 중입니다. 수동으로 전환해주세요."); // 너무 자주 뜨면 시끄러우니 주석 처리
      return; 
    }

    if (IS_TEST_MODE) {
      setRobotStatus(prev => ({
        ...prev,
        position: {
          x: Math.min(100, Math.max(0, prev.position.x + angular * 1.5)),
          y: Math.min(100, Math.max(0, prev.position.y - linear * 1.5))
        },
        speed: Math.abs(linear),
      }));
    } else {
      try {
        await axios.post('/api/robot/control', { linear, angular });
      } catch (err) { console.error(err); }
    }
  };

  // (3) 키보드 제어 루프
  const keysPressed = useRef({}); 
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      keysPressed.current[e.key.toLowerCase()] = true;
      keysPressed.current[e.code] = true;
    };
    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
      keysPressed.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const moveLoop = setInterval(() => {
      let linear = 0;
      let angular = 0;
      const speedVal = 1.0;

      if (keysPressed.current['w'] || keysPressed.current['ArrowUp']) linear += speedVal;
      if (keysPressed.current['s'] || keysPressed.current['ArrowDown']) linear -= speedVal;
      if (keysPressed.current['a'] || keysPressed.current['ArrowLeft']) angular -= speedVal;
      if (keysPressed.current['d'] || keysPressed.current['ArrowRight']) angular += speedVal;
      if (keysPressed.current[' ']) { emergencyStop(); return; }

      if (linear !== 0 || angular !== 0) {
        moveRobot(linear, angular);
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(moveLoop);
    };
  }, [robotStatus.mode]); // 모드가 바뀌면 루프 내부 조건도 반영됨

  const toggleVideo = () => setIsVideoOn(prev => !prev);

  const sendTTS = async (text) => {
    if (!text.trim()) return;
    addNotification({ type: 'robot_action', title: '음성 출력', message: `"${text}" 전송 중...` });
    if (!IS_TEST_MODE) await axios.post('/api/robot/tts', { text, useClonedVoice: isVoiceCloned && useClonedVoice });
  };

  const startWalkieTalkie = () => { setIsRecording(true); console.log("🎤 무전 녹음 시작"); };
  const stopWalkieTalkie = () => {
    if (isRecording) {
      setIsRecording(false);
      console.log("📡 무전 전송 완료");
      addNotification({ type: 'robot_action', title: '무전 전송', message: '사용자 음성을 전송했습니다.' });
    }
  };

  const trainVoice = async () => {
    addNotification({ type: 'system', title: '학습 시작', message: '목소리 학습을 시작합니다.' });
    setTimeout(() => {
      setIsVoiceCloned(true);
      setUseClonedVoice(true);
      addNotification({ type: 'system', title: '학습 완료', message: '목소리 모델 생성 완료.' });
    }, 3000);
  };

  const emergencyStop = async () => {
    if (!IS_TEST_MODE) await axios.post('/api/robot/control', { linear: 0, angular: 0 });
    setRobotStatus(prev => ({ ...prev, mode: 'emergency', speed: 0 }));
    addNotification({ type: 'system', title: '비상 정지', message: '로봇이 급정지했습니다.', priority: 'high' });
  };

  /* ============================================================
     4. 갤러리 및 로그 관리 (✅ 수정됨: 테스트 버튼 로직 강화)
     ============================================================ */
  useEffect(() => {
    if (user && user.id) {
      fetchVideos(user.id);
      fetchLogs(user.id);
    }
  }, [user]);

  // 영상 조회
  const fetchVideos = async (userId) => {
    try {
      const res = await axios.get(`/api/videos?userId=${userId}`);
      setVideos(res.data);
    } catch (err) { console.error("영상 로드 에러:", err); }
  };

  // 영상 삭제
  const deleteVideo = async (videoId) => {
    if(!confirm("삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/videos/${videoId}`);
      setVideos(prev => prev.filter(v => v.id !== videoId));
      toast.success("삭제됨");
    } catch (err) { console.error(err); }
  };

  // ✅ [수정] 테스트 영상 생성 (user 체크 강화)
  const addTestVideo = async () => {
    if (!user || !user.id) {
        toast.error("로그인 정보가 없습니다.");
        return;
    }

    const catNames = ["나비", "초코", "구름이", "치즈"];
    const behaviors = ["그루밍", "수면", "우다다", "사료 먹기"];
    
    const randomData = {
      userId: user.id,
      catName: catNames[Math.floor(Math.random() * catNames.length)],
      behavior: behaviors[Math.floor(Math.random() * behaviors.length)],
      duration: `${Math.floor(Math.random() * 10 + 5)}초`,
      thumbnailUrl: null
    };

    try {
      await axios.post('/api/videos', randomData);
      fetchVideos(user.id); // 즉시 새로고침
      toast.success("테스트 영상 생성 완료!");
      
      // 알림도 같이 생성
      addNotification({
        type: 'cat_alert',
        title: '새로운 영상 감지',
        message: `${randomData.catName}의 ${randomData.behavior} 영상이 저장되었습니다.`,
        priority: 'medium'
      });
    } catch (err) {
      console.error("테스트 영상 생성 실패:", err);
      toast.error("서버 오류: 영상 생성 실패");
    }
  };

  // 로그 조회
  const fetchLogs = async (userId) => {
    try {
      const res = await axios.get(`/api/logs?userId=${userId}`);
      setLogs(res.data);
    } catch (err) { console.error("로그 로드 에러:", err); }
  };

  // 로그 삭제
  const deleteLog = async (logId) => {
    if(!confirm("삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/logs/${logId}`);
      setLogs(prev => prev.filter(l => l.id !== logId));
      toast.success("삭제됨");
    } catch (err) { console.error(err); }
  };

  // ✅ [수정] 테스트 로그 생성 (user 체크 강화)
  const addTestLog = async () => {
    if (!user || !user.id) {
        toast.error("로그인 정보가 없습니다.");
        return;
    }

    const modes = ["자동 모드", "수동 제어"];
    const statuses = ["completed", "interrupted"];
    const randomMode = modes[Math.floor(Math.random() * modes.length)];
    const randomDuration = Math.floor(Math.random() * 20) + 1;
    
    const events = ["거실 정찰 완료", "주방에서 '나비' 감지", "현관 이동", "배터리 부족 복귀"];
    const randomDetail = events[Math.floor(Math.random() * events.length)];

    const logData = {
      userId: user.id,
      mode: randomMode,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      duration: `${randomDuration}분`,
      durationNum: randomDuration,
      distance: (Math.random() * 50).toFixed(1),
      detectionCount: Math.floor(Math.random() * 5),
      details: randomDetail
    };

    try {
      await axios.post('/api/logs', logData);
      fetchLogs(user.id); // 즉시 새로고침
      toast.success("테스트 로그 생성 완료!");
    } catch (err) {
      console.error("테스트 로그 생성 실패:", err);
      toast.error("서버 오류: 로그 생성 실패");
    }
  };

  return (
    <RobotContext.Provider value={{
      robotStatus, isVideoOn, toggleVideo, moveRobot, emergencyStop, toggleMode,
      sendTTS, startWalkieTalkie, stopWalkieTalkie, isRecording,
      trainVoice, isVoiceCloned, useClonedVoice, setUseClonedVoice,
      videos, deleteVideo, addTestVideo,
      logs, addTestLog, deleteLog
    }}>
      {children}
    </RobotContext.Provider>
  );
};

export const useRobot = () => useContext(RobotContext);