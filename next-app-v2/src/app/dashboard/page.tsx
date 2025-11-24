'use client';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatusCard from '@/components/dashboard/StatusCard';
import SubjectCard from '@/components/dashboard/SubjectCard';
import ToolCard from '@/components/dashboard/ToolCard';

export default function DashboardPage() {
  const handleAlert = (message: string) => {
    alert(message);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <DashboardHeader />

        {/* 교과별 활동 현황 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatusCard
            icon="⚛️"
            bgColorClass="bg-indigo-100"
            title="물리학II"
            value="활동 1개"
          />
          <StatusCard
            icon="🔬"
            bgColorClass="bg-green-100"
            title="과학탐구실험"
            value="활동 다수"
          />
          <StatusCard
            icon="📚"
            bgColorClass="bg-purple-100"
            title="전체 교과"
            value="2개 교과"
          />
        </div>

        {/* 교과별 관리 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 물리학II 관리 */}
          <SubjectCard
            title="물리학II"
            icon="⚛️"
            description="2학기 수행평가 활동"
            gradientFrom="from-indigo-500"
            gradientTo="to-purple-600"
            textColor="text-indigo-100"
          >
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleAlert('물리학II 활동 페이지로 이동합니다 (준비 중)');
              }}
              className="block w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-3 px-4 rounded-lg transition-colors text-center"
            >
              📰 최신 물리학, 공학 연관기사 탐구 발표
            </a>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">활동 정보</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• 활동 유형: 기사탐구 및 발표</div>
                <div>• 평가 요소: 과학적 정보 소양, 융합적 사고력</div>
                <div>• 제출 형태: ZIP 파일 (HTML + 발표 스크립트)</div>
                <div>• 발표 시간: 5-7분</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => window.open('#', '_blank')}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                👁️ 활동지 미리보기
              </button>
              <button
                onClick={() => handleAlert('물리학II 활동지 편집 기능을 준비 중입니다.')}
                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                ✏️ 활동지 편집
              </button>
            </div>
          </SubjectCard>

          {/* 과학탐구실험 관리 */}
          <SubjectCard
            title="과학탐구실험"
            icon="🔬"
            description="실험 및 탐구 활동"
            gradientFrom="from-green-500"
            gradientTo="to-teal-600"
            textColor="text-green-100"
          >
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleAlert('과학탐구실험 교과 홈으로 이동합니다 (준비 중)');
              }}
              className="block w-full bg-green-50 hover:bg-green-100 text-green-700 font-medium py-3 px-4 rounded-lg transition-colors text-center"
            >
              🧪 과학탐구실험 교과 홈
            </a>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">활동 정보</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• 활동 유형: 다양한 과학 실험 및 탐구</div>
                <div>• 평가 요소: 실험 설계, 데이터 분석, 과학적 사고</div>
                <div>• 제출 형태: 실험 보고서 및 분석 자료</div>
                <div>• 활동 수: 다수의 실험 및 탐구 활동</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => window.open('#', '_blank')}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                👁️ 활동지 미리보기
              </button>
              <button
                onClick={() => handleAlert('과학탐구실험 활동지 편집 기능을 준비 중입니다.')}
                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                ✏️ 활동지 편집
              </button>
            </div>
          </SubjectCard>
        </div>

        {/* 활동 관리 도구 */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">활동 관리 도구</h3>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  handleAlert(
                    '새 활동 생성 기능을 준비 중입니다.\n\n기능:\n• 활동 제목 및 설명 설정\n• 평가 요소 선택\n• 활동지 템플릿 적용\n• 제출 형태 설정'
                  )
                }
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                ➕ 새 활동 추가
              </button>
              <button
                onClick={() =>
                  handleAlert(
                    '활동 목록 관리 기능을 준비 중입니다.\n\n기능:\n• 기존 활동 목록 보기\n• 활동 활성화/비활성화\n• 활동 순서 변경\n• 활동 삭제'
                  )
                }
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                📋 활동 목록 관리
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ToolCard
              title="기본 활동지"
              icon="📝"
              description="학생 정보 입력, 활동 내용 작성, 미리보기 기능이 포함된 기본 템플릿"
              buttonText="템플릿 사용"
              onAction={() => handleAlert('기본 활동지 템플릿을 사용합니다.\n\n템플릿 적용 기능을 준비 중입니다.')}
            />
            <ToolCard
              title="발표 활동지"
              icon="🎤"
              description="발표 스크립트 작성 기능이 포함된 발표용 활동지 템플릿"
              buttonText="템플릿 사용"
              onAction={() => handleAlert('발표 활동지 템플릿을 사용합니다.\n\n템플릿 적용 기능을 준비 중입니다.')}
            />
            <ToolCard
              title="실험 보고서"
              icon="🧪"
              description="실험 목적, 방법, 결과, 결론 작성이 포함된 실험 보고서 템플릿"
              buttonText="템플릿 사용"
              onAction={() => handleAlert('실험 보고서 템플릿을 사용합니다.\n\n템플릿 적용 기능을 준비 중입니다.')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
