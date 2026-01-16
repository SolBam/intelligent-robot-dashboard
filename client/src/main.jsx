import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

// ✅ 1. 리액트 쿼리 임포트
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ✅ 2. 클라이언트 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // 실패 시 1번만 재시도
      refetchOnWindowFocus: false, // 탭 전환 시 자동 새로고침 끄기
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  /* 🚨 [삭제됨] <React.StrictMode> 
     이 태그가 있으면 개발 모드에서 컴포넌트를 2번 실행시켜서
     WebRTC 연결이 꼬이는 원인이 됩니다. 과감하게 지웠습니다!
  */
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  </QueryClientProvider>
  /* 🚨 [삭제됨] </React.StrictMode> */
);