import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';
import api from '../api/axios';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const RobotContext = createContext();

// ✅ 백엔드 주소
const SOCKET_URL = 'ws://localhost:8080/ws';

export const RobotProvider = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  
  const stompClient = useRef(null);
  const peerConnection = useRef(null); // ✅ WebRTC 연결 객체 추가

  /* 1. 로봇 상태 */
  const [robotStatus, setRobotStatus] = useState({
    isOnline: false, battery: 80, mode: 'manual', 
    position: { x: 50, y: 50 }, speed: 0, lastUpdate: new Date().toISOString(),
  });
  
  const [isRobotLoading, setIsRobotLoading] = useState(true);
  const [remoteStream, setRemoteStream] = useState(null); // ✅ 수신된 영상 데이터

  /* 2. 웹소켓 및 WebRTC 연결 설정 */
  useEffect(() => {
    // const socket = new SockJS(SOCKET_URL);
    const socket = new WebSocket(SOCKET_URL);
    const client = Stomp.over(socket);
    client.debug = null;

    client.connect({}, () => {
      console.log('✅ RobotContext: 웹소켓 연결 성공!');
      setIsRobotLoading(false);
      setRobotStatus(prev => ({ ...prev, isOnline: true }));
      stompClient.current = client;

      // (1) 로봇 상태 구독 (위치, 배터리 등)
      client.subscribe('/sub/robot/status', (message) => {
        const data = JSON.parse(message.body);
        setRobotStatus(prev => ({ ...prev, ...data, lastUpdate: new Date().toISOString() }));
      });

      // (2) 📹 WebRTC Offer 수신 (여기가 핵심! 로봇 전화를 받는 부분)
      client.subscribe('/sub/peer/offer', async (message) => {
        console.log("📹 [WebRTC] Offer 수신! 연결을 시도합니다...");
        const offer = JSON.parse(message.body);

        // P2P 연결 생성 (구글 무료 STUN 서버 사용)
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        // 📡 영상 트랙이 들어오면 state에 저장
        pc.ontrack = (event) => {
          console.log("🎥 [WebRTC] 영상 스트림 확보됨 (Stream ID: " + event.streams[0].id + ")");
          setRemoteStream(event.streams[0]);
        };

        peerConnection.current = pc;

        // 로봇의 명함(Offer) 저장
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // 내 명함(Answer) 생성 및 저장
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // 내 명함을 로봇에게 전송
        client.send("/pub/peer/answer", {}, JSON.stringify({
          sdp: pc.localDescription.sdp,
          type: pc.localDescription.type
        }));
        console.log("📤 [WebRTC] Answer 전송 완료!");
      });

    }, (error) => {
      console.error('❌ 웹소켓 연결 실패:', error);
      setIsRobotLoading(false);
      setRobotStatus(prev => ({ ...prev, isOnline: false }));
    });

    return () => {
      if (client && client.connected) client.disconnect();
      if (peerConnection.current) peerConnection.current.close();
    };
  }, []);

  /* 3. 데이터 조회 (기존 유지) */
  const { data: videos = [] } = useQuery({ queryKey: ['videos', user?.id], queryFn: async () => (await api.get(`/videos?userId=${user.id}`)).data, enabled: !!user?.id });
  const { data: logs = [] } = useQuery({ queryKey: ['logs', user?.id], queryFn: async () => (await api.get(`/logs?userId=${user.id}`)).data, enabled: !!user?.id });
  const deleteVideoMutation = useMutation({ mutationFn: (id) => api.delete(`/videos/${id}`), onSuccess: () => { queryClient.invalidateQueries(['videos']); toast.success("삭제되었습니다."); }});
  const deleteLogMutation = useMutation({ mutationFn: (id) => api.delete(`/logs/${id}`), onSuccess: () => { queryClient.invalidateQueries(['logs']); toast.success("삭제되었습니다."); }});

  /* 4. 로봇 제어 (기존 유지) */
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isVoiceCloned, setIsVoiceCloned] = useState(false);
  const [useClonedVoice, setUseClonedVoice] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const moveRobot = (linear, angular) => {
    if (!stompClient.current || !stompClient.current.connected) return;
    if (robotStatus.mode === 'auto') return;
    stompClient.current.send("/pub/robot/control", {}, JSON.stringify({ type: 'MOVE', linear, angular }));
  };

  const emergencyStop = () => {
    if (stompClient.current?.connected) stompClient.current.send("/pub/robot/control", {}, JSON.stringify({ type: 'STOP' }));
    setRobotStatus(prev => ({ ...prev, mode: 'emergency', speed: 0 }));
    addNotification({ type: 'alert', title: '🚨 비상 정지', message: '사용자가 로봇을 긴급 정지시켰습니다.', link: '/' });
  };

  const toggleMode = () => {
    const newMode = robotStatus.mode === 'auto' ? 'manual' : 'auto';
    if (stompClient.current?.connected) stompClient.current.send("/pub/robot/control", {}, JSON.stringify({ type: 'MODE', value: newMode }));
    setRobotStatus(prev => ({ ...prev, mode: newMode }));
    addNotification({ type: 'robot', title: '모드 변경', message: `로봇이 ${newMode === 'auto' ? '자동' : '수동'} 모드로 전환되었습니다.`, link: '/' });
  };

  const toggleVideo = () => setIsVideoOn(prev => !prev);
  const sendTTS = async (text) => {
    if (!text.trim()) return;
    addNotification({ type: 'robot', title: '🔊 음성 출력', message: `로봇이 말합니다: "${text}"`, link: '/' });
    try { await api.post('/robot/tts', { text, useClonedVoice: isVoiceCloned && useClonedVoice }); } catch(e) {}
  };
  const startWalkieTalkie = () => { setIsRecording(true); };
  const stopWalkieTalkie = () => { if (isRecording) { setIsRecording(false); addNotification({ type: 'robot', title: '📡 무전 전송', message: '사용자의 음성을 로봇으로 전송했습니다.', link: '/' }); }};
  const trainVoice = () => { toast.info("목소리 학습 시작..."); setTimeout(() => { setIsVoiceCloned(true); setUseClonedVoice(true); toast.success("학습 완료!"); }, 3000); };

  /* 5. 키보드 제어 (기존 유지) */
  const keysPressed = useRef({}); 
  const lastCommand = useRef({ linear: 0, angular: 0 });

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.target.tagName !== 'INPUT') keysPressed.current[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e) => { keysPressed.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    
    const moveLoop = setInterval(() => {
      let linear = 0, angular = 0;
      if (keysPressed.current['w']) linear += 1.0; if (keysPressed.current['s']) linear -= 1.0; 
      if (keysPressed.current['a']) angular += 1.0; if (keysPressed.current['d']) angular -= 1.0;
      if (linear !== lastCommand.current.linear || angular !== lastCommand.current.angular) {
        moveRobot(linear, angular); lastCommand.current = { linear, angular };
      }
    }, 100); 
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); clearInterval(moveLoop); };
  }, [robotStatus.mode]); 

  /* 6. 테스트 데이터 */
  const addTestVideo = async () => {}; 
  const addTestLog = async () => { if (!user) return; try { await api.post('/logs', { userId: user.id, mode: "자동 모드", status: "completed", details: "테스트 로그" }); queryClient.invalidateQueries(['logs']); toast.success("로그 생성 완료"); } catch(e) {} };

  return (
    <RobotContext.Provider value={{
      robotStatus, isVideoOn, toggleVideo, moveRobot, emergencyStop, toggleMode,
      sendTTS, startWalkieTalkie, stopWalkieTalkie, isRecording, trainVoice, isVoiceCloned, useClonedVoice, setUseClonedVoice,
      videos, deleteVideo: deleteVideoMutation.mutate, addTestVideo, logs, deleteLog: deleteLogMutation.mutate, addTestLog, isRobotLoading,
      remoteStream // ✅ 이게 있어야 Dashboard에서 갖다 씁니다!
    }}>
      {children}
    </RobotContext.Provider>
  );
};
export const useRobot = () => useContext(RobotContext);