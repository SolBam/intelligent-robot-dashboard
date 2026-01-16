import React from 'react';
import Skeleton from '../ui/Skeleton';

const DashboardSkeleton = () => {
  return (
    <div className="grid grid-cols-12 gap-6 h-full pb-10">
      
      {/* === 왼쪽 패널 (지도 & 영상) === */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* 1. 지도 영역 (높이 500px) */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[500px] p-4 flex flex-col gap-4">
          <div className="flex justify-between">
            <Skeleton className="h-6 w-32" /> {/* 제목 */}
            <Skeleton className="h-4 w-24" /> {/* 서브텍스트 */}
          </div>
          <Skeleton className="flex-1 w-full rounded-lg" /> {/* 지도 본문 */}
        </div>

        {/* 2. 카메라 영역 (비디오 비율) */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="w-full aspect-video rounded-lg" />
        </div>
      </div>

      {/* === 오른쪽 패널 (상태 & 제어) === */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        
        {/* 1. 로봇 상태 카드 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-6">
            <div className="flex justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            {/* 배터리, 모드, 네트워크 줄 */}
            <div className="space-y-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </div>

        {/* 2. 제어 버튼 패널 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
            <Skeleton className="h-6 w-24" />
            <div className="grid grid-cols-3 gap-2 justify-items-center">
                <div />
                <Skeleton className="w-14 h-14 rounded-xl" /> {/* W */}
                <div />
                <Skeleton className="w-14 h-14 rounded-xl" /> {/* A */}
                <div />
                <Skeleton className="w-14 h-14 rounded-xl" /> {/* D */}
                <div />
                <Skeleton className="w-14 h-14 rounded-xl" /> {/* S */}
                <div />
            </div>
            <Skeleton className="w-full h-12 rounded-lg mt-2" /> {/* 비상정지 */}
        </div>

        {/* 3. 음성 제어 패널 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
        </div>

      </div>
    </div>
  );
};

export default DashboardSkeleton;