import './App.css'
import StatusCard from './components/StatusCard'
import ControlPanel from './components/ControlPanel'
import CameraView from './components/CameraView' // 추가됨

function App() {
  // 나중에 실제 로봇 카메라 주소로 바꿔야 합니다. (예: http://라즈베리파이IP:8080/stream.mjpg)
  // 지금은 테스트를 위해 고정된 이미지를 사용합니다.
  const TEST_STREAM_URL = "https://picsum.photos/seed/robot/640/360"; 
  // const TEST_STREAM_URL = null; // 이 주석을 풀면 "Signal Lost" 화면이 보입니다.

  return (
    <div className="dashboard-container">
      <header style={{marginBottom: '20px'}}>
        <h1>🤖 Intelligent Robot Dashboard</h1>
      </header>

      {/* 3단 그리드 레이아웃 적용 */}
      <main className="grid-layout-3col">
        
        {/* 왼쪽: 상태 패널 */}
        <section className="panel-side">
          <StatusCard />
        </section>

        {/* 가운데: 메인 카메라 */}
        <section className="panel-center">
            {/* streamUrl에 주소를 넘겨줍니다 */}
            <CameraView streamUrl={TEST_STREAM_URL} />
        </section>

        {/* 오른쪽: 제어 패널 */}
        <section className="panel-side">
            <ControlPanel />
        </section>

      </main>
    </div>
  )
}

// 스타일 업데이트 (3단 레이아웃)
const styles = `
  .dashboard-container {
    max-width: 1400px; /* 전체 너비를 좀 더 넓게 */
    margin: 0 auto;
    padding: 20px;
  }
  
  /* 3개의 컬럼으로 나누는 그리드 설정 */
  .grid-layout-3col {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr; /* 좌우는 1배, 중앙은 2배 넓이 */
    gap: 25px;
    align-items: start; /* 상단 정렬 */
  }

  /* 화면이 좁아지면 세로로 배치 (반응형) */
  @media (max-width: 1024px) {
    .grid-layout-3col {
      grid-template-columns: 1fr; /* 1줄로 변경 */
    }
    .panel-center {
      order: -1; /* 카메라를 가장 위로 올림 */
    }
  }

  .panel-side {
    display: flex;
    justify-content: center;
  }
`;

export default App