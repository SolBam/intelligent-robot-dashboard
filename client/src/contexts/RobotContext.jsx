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
    mode: 'manual',
    lastUpdate: new Date().toISOString(),
  });

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isVoiceCloned, setIsVoiceCloned] = useState(false);
  const [useClonedVoice, setUseClonedVoice] = useState(false);
  
  // 무전기 상태 (녹음 중인지 여부)
  const [isRecording, setIsRecording] = useState(false);

  /* ============================================================
     2. 데이터 상태 (갤러리, 로그)
     ============================================================ */
  const [videos, setVideos] = useState([]);
  const [logs, setLogs] = useState([]);

  /* ============================================================
     3. 로봇 상태 동기화 (Polling)
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
     4. 로봇 제어 함수들 (부드러운 이동 구현)
     ============================================================ */
  
  // (1) 이동 명령 전송 (내부 로직)
  const moveRobot = async (linear, angular) => {
    if (IS_TEST_MODE) {
      setRobotStatus(prev => ({
        ...prev,
        position: {
          x: Math.min(100, Math.max(0, prev.position.x + angular * 1.5)), // 부드러움을 위해 이동량 조정
          y: Math.min(100, Math.max(0, prev.position.y - linear * 1.5))
        },
        speed: Math.abs(linear),
        mode: 'manual'
      }));
    } else {
      try {
        await axios.post('/api/robot/control', { linear, angular });
      } catch (err) { console.error(err); }
    }
  };

  // ✅ (2) 키보드 상태 추적 및 루프 (부드러운 움직임 핵심!)
  const keysPressed = useRef({}); // 현재 눌린 키들을 저장

  useEffect(() => {
    // 키 누름 감지
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      keysPressed.current[e.key.toLowerCase()] = true;
      keysPressed.current[e.code] = true; // ArrowKey 처리용
    };

    // 키 뗌 감지
    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 0.05초마다 키 상태 확인하여 이동 명령 전송 (게임 루프 방식)
    const moveLoop = setInterval(() => {
      let linear = 0;
      let angular = 0;
      const speedVal = 1.0;

      // W / 위쪽 화살표
      if (keysPressed.current['w'] || keysPressed.current['ArrowUp']) linear += speedVal;
      // S / 아래쪽 화살표
      if (keysPressed.current['s'] || keysPressed.current['ArrowDown']) linear -= speedVal;
      // A / 왼쪽 화살표
      if (keysPressed.current['a'] || keysPressed.current['ArrowLeft']) angular -= speedVal;
      // D / 오른쪽 화살표
      if (keysPressed.current['d'] || keysPressed.current['ArrowRight']) angular += speedVal;
      // Space (비상정지)
      if (keysPressed.current[' ']) { emergencyStop(); return; }

      // 입력이 있을 때만 명령 전송
      if (linear !== 0 || angular !== 0) {
        moveRobot(linear, angular);
      }
    }, 50); // 50ms 간격

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(moveLoop);
    };
  }, []);

  // (3) 영상 토글
  const toggleVideo = () => setIsVideoOn(prev => !prev);

  // (4) TTS 전송
  const sendTTS = async (text) => {
    if (!text.trim()) return;
    addNotification({ type: 'robot_action', title: '음성 출력', message: `"${text}" 전송 중...` });
    if (!IS_TEST_MODE) {
      await axios.post('/api/robot/tts', { text, useClonedVoice: isVoiceCloned && useClonedVoice });
    }
  };

  // ✅ (5) 무전기 (상태 관리 추가)
  const startWalkieTalkie = () => {
    setIsRecording(true);
    console.log("🎤 무전 녹음 시작");
    // 여기에 실제 마이크 녹음 시작 로직 추가
  };

  const stopWalkieTalkie = () => {
    if (isRecording) { // 녹음 중이었을 때만 전송
      setIsRecording(false);
      console.log("📡 무전 전송 완료");
      addNotification({ type: 'robot_action', title: '무전 전송', message: '사용자 음성을 전송했습니다.' });
      // 여기에 녹음 중단 및 파일 전송 로직 추가
    }
  };

  // (6) 목소리 학습
  const trainVoice = async () => {
    addNotification({ type: 'system', title: '학습 시작', message: '목소리 학습을 시작합니다.' });
    setTimeout(() => {
      setIsVoiceCloned(true);
      setUseClonedVoice(true);
      addNotification({ type: 'system', title: '학습 완료', message: '목소리 모델 생성 완료.' });
    }, 3000);
  };

  // (7) 비상 정지
  const emergencyStop = async () => {
    if (!IS_TEST_MODE) await axios.post('/api/robot/control', { linear: 0, angular: 0 });
    setRobotStatus(prev => ({ ...prev, mode: 'emergency', speed: 0 }));
    addNotification({ type: 'system', title: '비상 정지', message: '로봇이 급정지했습니다.', priority: 'high' });
  };

  const toggleMode = () => { /* 모드 전환 로직 */ };


  /* ============================================================
     5. 갤러리 및 로그 관리
     ============================================================ */
  useEffect(() => {
    if (user && user.id) {
      fetchVideos(user.id);
      fetchLogs(user.id);
    } else {
      setVideos([]);
      setLogs([]);
    }
  }, [user]);

  const fetchVideos = async (userId) => {
    try {
      const res = await axios.get(`/api/videos?userId=${userId}`);
      setVideos(res.data);
    } catch (err) { console.error(err); }
  };

  const deleteVideo = async (videoId) => {
    if(!confirm("삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/videos/${videoId}`);
      setVideos(prev => prev.filter(v => v.id !== videoId));
      toast.success("삭제됨");
    } catch (err) { console.error(err); }
  };

  const addTestVideo = async () => { /* ...기존과 동일... */ };

  const fetchLogs = async (userId) => {
    try {
      const res = await axios.get(`/api/logs?userId=${userId}`);
      setLogs(res.data);
    } catch (err) { console.error(err); }
  };

  const deleteLog = async (logId) => {
    if(!confirm("삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/logs/${logId}`);
      setLogs(prev => prev.filter(l => l.id !== logId));
      toast.success("삭제됨");
    } catch (err) { console.error(err); }
  };

  const addTestLog = async () => { /* ...기존과 동일... */ };

  return (
    <RobotContext.Provider value={{
      robotStatus, isVideoOn, toggleVideo, moveRobot, emergencyStop, toggleMode,
      sendTTS, startWalkieTalkie, stopWalkieTalkie, isRecording, // 👈 isRecording 추가
      trainVoice, isVoiceCloned, useClonedVoice, setUseClonedVoice,
      videos, deleteVideo, addTestVideo,
      logs, addTestLog, deleteLog
    }}>
      {children}
    </RobotContext.Provider>
  );
};

export const useRobot = () => useContext(RobotContext);