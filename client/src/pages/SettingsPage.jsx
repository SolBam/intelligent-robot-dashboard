import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Lock, Shield, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SettingsPage = () => {
  // Context에서 실제 업데이트 함수 가져오기
  const { user, verifyUserPassword, updateProfile, updatePassword } = useAuth();
  
  // 보안 인증 상태
  const [isVerified, setIsVerified] = useState(false);
  const [verifyInput, setVerifyInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // 폼 상태
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

  // 초기 데이터 로드
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  // 1. 잠금 화면 인증 핸들러
  const handleVerify = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    const isMatch = await verifyUserPassword(verifyInput);
    if (isMatch) {
      toast.success("인증되었습니다.");
      setIsVerified(true);
    } else {
      toast.error("비밀번호가 일치하지 않습니다.");
      setVerifyInput("");
    }
    setIsVerifying(false);
  };

  // 2. 프로필(이름) 업데이트 핸들러
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    // DB 업데이트 요청
    const success = await updateProfile(profileData.name);
    
    if (success) {
      toast.success('프로필이 업데이트되었습니다.');
    } else {
      toast.error('프로필 수정 실패');
    }
  };

  // 3. 비밀번호 변경 핸들러
  const handleChangePassword = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (passwordData.new !== passwordData.confirm) return toast.error('새 비밀번호가 일치하지 않습니다.');
    if (passwordData.new.length < 6) return toast.error('비밀번호는 6자 이상이어야 합니다.');
    
    // 현재 비밀번호 한 번 더 체크 (보안 강화)
    const isCurrentCorrect = await verifyUserPassword(passwordData.current);
    if (!isCurrentCorrect) return toast.error('현재 비밀번호가 틀렸습니다.');

    // DB 업데이트 요청
    const success = await updatePassword(passwordData.new);
    
    if (success) {
      toast.success('비밀번호가 성공적으로 변경되었습니다.', {
        description: '다음 로그인 시 새 비밀번호를 사용해주세요.'
      });
      setPasswordData({ current: '', new: '', confirm: '' }); // 폼 초기화
    } else {
      toast.error('비밀번호 변경 실패');
    }
  };

  // 🔒 잠금 화면 UI
  if (!isVerified) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl text-center space-y-6 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={40} className="text-gray-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">보안 확인</h2>
            <p className="text-gray-500 mt-2 text-sm">개인정보 보호를 위해 비밀번호를 입력해주세요.</p>
          </div>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="relative">
              <input 
                type="password"
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
                placeholder="현재 비밀번호 입력"
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!verifyInput || isVerifying}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-30 transition-all"
              >
                {isVerifying ? <Loader2 className="animate-spin" size={18}/> : <ArrowRight size={18} />}
              </button>
            </div>
          </form>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 py-2 rounded-lg">
            <Shield size={12} /><span>안전한 보안 환경입니다.</span>
          </div>
        </div>
      </div>
    );
  }

  // 🔓 설정 화면 UI
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. 프로필 설정 */}
      <section className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <User size={20} /> 프로필 설정
        </h2>
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">이름</label>
            <input 
              type="text" 
              value={profileData.name}
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">이메일</label>
            <div className="relative">
              <input 
                type="email" 
                value={profileData.email}
                disabled
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
              />
              <span className="text-xs text-gray-400 mt-1 block pl-1">* 이메일은 변경할 수 없습니다</span>
            </div>
          </div>
          <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-md hover:bg-gray-800 transition-colors">
            프로필 업데이트
          </button>
        </form>
      </section>

      {/* 2. 비밀번호 변경 */}
      <section className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Lock size={20} /> 비밀번호 변경
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">현재 비밀번호</label>
            <input 
              type="password" 
              value={passwordData.current}
              onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none"
              placeholder="현재 비밀번호"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">새 비밀번호</label>
            <input 
              type="password" 
              value={passwordData.new}
              onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none"
              placeholder="새 비밀번호 (최소 6자)"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">새 비밀번호 확인</label>
            <input 
              type="password" 
              value={passwordData.confirm}
              onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none"
              placeholder="새 비밀번호 확인"
            />
          </div>
          <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-md hover:bg-gray-800 transition-colors">
            비밀번호 변경
          </button>
        </form>
      </section>

      {/* 3. 계정 정보 */}
      <section className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Shield size={20} /> 계정 정보
        </h2>
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-medium text-gray-500">계정 ID</span>
            <span className="text-sm font-bold text-gray-900 font-mono">{user?.id}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-500">가입일</span>
            <span className="text-sm font-bold text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '날짜 정보 없음'}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;