import { Joystick } from 'react-joystick-component';
import axios from 'axios';

const ControlPanel = () => {

  // 조이스틱을 움직일 때마다 실행
  const handleMove = (event) => {
    // event.y : 앞뒤 (Linear Velocity)
    // event.x : 좌우 (Angular Velocity)
    
    const command = {
      linear: event.y || 0,  // 값이 없으면 0
      angular: -event.x || 0 // 로봇 좌표계에 맞춰 반전 필요할 수 있음
    };

    // 서버로 전송
    axios.post('/api/robot/control', command)
      .then(res => console.log("전송 성공:", res.data))
      .catch(err => console.error("전송 실패:", err));
  };

  const handleStop = () => {
    // 손을 놓으면 정지 명령 전송
    handleMove({ x: 0, y: 0 });
  };

  return (
    <div style={styles.card}>
      <h3>🕹️ Manual Control</h3>
      <div style={styles.joystickWrapper}>
        <Joystick 
          size={120} 
          sticky={false} 
          baseColor="#444" 
          stickColor="#888" 
          move={handleMove} 
          stop={handleStop}
        />
      </div>
      <p style={{fontSize: '0.8rem', color: '#aaa', marginTop: '10px'}}>
        Use joystick to move robot
      </p>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#333',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '400px',
  },
  joystickWrapper: {
    marginTop: '10px',
    padding: '10px',
    background: '#222',
    borderRadius: '50%'
  }
};

export default ControlPanel;