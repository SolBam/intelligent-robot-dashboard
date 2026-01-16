import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // 경로 확인 필요 (보통 ../contexts/AuthContext)
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, Loader2, Bot } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 🚨 수정 1: signup 대신 register로 이름 변경!
  const { login, register } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLoginMode) {
        // === 로그인 시도 ===
        const success = await login(email, password);
        if (success) {
          // toast는 AuthContext 안에서도 띄우고 있으니 중복되면 여기서 제거해도 됩니다.
          navigate('/');
        }
      } else {
        // === 회원가입 시도 ===
        
        // 🚨 수정 2: 데이터를 객체 하나로 묶어서 보내야 함!
        const userData = {
          email: email,
          password: password,
          name: name
        };

        // 🚨 수정 3: signup(...) 대신 register(userData) 호출
        const success = await register(userData);
        
        if (success) {
          setIsLoginMode(true); // 로그인 모드로 전환
          setName('');
          setPassword('');
        }
      }
    } catch (error) {
      // AuthContext 내부에서 에러 처리를 하고 있으므로 여기서는 로그만 찍거나 생략 가능
      console.error("Login Page Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
        
        {/* 상단 로고 영역 */}
        <div className="bg-white p-8 pb-0 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-200">
            <Bot size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">펫케어 로봇 시스템</h1>
          <p className="text-gray-500 mt-2 text-sm">
            {isLoginMode ? '반려동물 돌봄 로봇 관리 플랫폼' : '새로운 관리자 계정 생성'}
          </p>
        </div>

        {/* 탭 전환 버튼 */}
        <div className="px-8 mt-6">
          <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setIsLoginMode(true)}
              className={`py-2 text-sm font-medium rounded-md transition-all ${isLoginMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              로그인
            </button>
            <button
              onClick={() => setIsLoginMode(false)}
              className={`py-2 text-sm font-medium rounded-md transition-all ${!isLoginMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              회원가입
            </button>
          </div>
        </div>

        {/* 입력 폼 */}
        <div className="p-8 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 이름 (회원가입용) */}
            {!isLoginMode && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-bold text-gray-600 ml-1">이름</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
                    placeholder="홍길동"
                    required={!isLoginMode}
                  />
                </div>
              </div>
            )}

            {/* 이메일 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 ml-1">이메일</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 ml-1">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white font-bold py-3 rounded-lg shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLoginMode ? '로그인' : '회원가입'}
                  {!isLoading && <ArrowRight size={18} />}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;