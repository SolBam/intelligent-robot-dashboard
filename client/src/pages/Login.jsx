import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, Loader2, Bot } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [isLoginMode, setIsLoginMode] = useState(true); // 로그인 <-> 회원가입 전환 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // 회원가입용 이름
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLoginMode) {
        // === 로그인 시도 ===
        const success = await login(email, password);
        if (success) {
          toast.success('환영합니다!', { description: '대시보드로 이동합니다.' });
          navigate('/');
        } else {
          toast.error('로그인 실패', { description: '이메일 또는 비밀번호를 확인해주세요.' });
        }
      } else {
        // === 회원가입 시도 ===
        const success = await signup(email, password, name);
        if (success) {
          toast.success('회원가입 성공!', { description: '이제 로그인해주세요.' });
          setIsLoginMode(true); // 로그인 모드로 자동 전환
          setName('');
          setPassword('');
        } else {
          toast.error('회원가입 실패', { description: '이미 사용 중인 이메일일 수 있습니다.' });
        }
      }
    } catch (error) {
      toast.error('오류 발생', { description: '서버와 통신할 수 없습니다.' });
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

        {/* 탭 전환 버튼 (로그인 / 회원가입) */}
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
            
            {/* 이름 입력 (회원가입일 때만 등장) */}
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