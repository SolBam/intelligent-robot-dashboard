import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const SocketTest = () => {
  const [receivedMessage, setReceivedMessage] = useState("아직 메시지 없음");
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    // 1. 연결할 주소 설정 (http:// 입니다! ws:// 아님)
    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);

    // 2. 연결 시도
    client.connect({}, (frame) => {
      console.log('✅ 웹소켓 연결 성공!', frame);

      // 3. 구독 (서버가 보내는 메시지 듣기)
      client.subscribe('/sub/test', (response) => {
        console.log('📩 서버에서 온 메시지:', response.body);
        setReceivedMessage(response.body);
      });
      
      setStompClient(client);
    }, (error) => {
      console.error('❌ 웹소켓 연결 실패:', error);
    });

    // 컴포넌트 언마운트 시 연결 종료
    return () => {
      if (client) client.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (stompClient) {
      // 4. 메시지 전송 (발행)
      stompClient.send("/pub/test", {}, "Hello Robot!");
      console.log('📤 메시지 보냄: Hello Robot!');
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg border border-gray-300 m-4">
      <h3 className="font-bold text-lg mb-2">📡 웹소켓 테스트</h3>
      <p className="mb-2">서버 응답: <span className="text-blue-600 font-bold">{receivedMessage}</span></p>
      <button 
        onClick={sendMessage}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        테스트 메시지 보내기
      </button>
    </div>
  );
};

export default SocketTest;