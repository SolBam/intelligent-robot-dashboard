import { useEffect, useState } from 'react';
import axios from 'axios';
import { Battery, Thermometer, Zap } from 'lucide-react'; // 아이콘

const StatusCard = () => {
  const [status, setStatus] = useState({
    batteryLevel: 0,
    temperature: 0.0,
    charging: false
  });

  // 1초마다 데이터 가져오기 (Polling)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/robot/latest');
        if (res.data) {
            setStatus(res.data);
        }
      } catch (err) {
        console.error("통신 에러:", err);
      }
    };

    fetchData(); // 최초 실행
    const interval = setInterval(fetchData, 1000); // 1초 반복

    return () => clearInterval(interval); // 화면 꺼지면 중단
  }, []);

  return (
    <div style={styles.card}>
      <h3>🤖 Robot Status</h3>
      
      <div style={styles.row}>
        <div style={styles.item}>
          <Battery size={32} color={status.batteryLevel > 20 ? "#4CAF50" : "#F44336"} />
          <span>{status.batteryLevel}%</span>
        </div>
        
        <div style={styles.item}>
          <Thermometer size={32} color="#FF9800" />
          <span>{status.temperature.toFixed(1)}°C</span>
        </div>

        <div style={styles.item}>
            <Zap size={32} color={status.charging ? "#FFEB3B" : "#555"} />
            <span>{status.charging ? "Charging" : "Discharging"}</span>
        </div>
      </div>
    </div>
  );
};

// 간단한 스타일 (CSS 대신 JS 객체 사용)
const styles = {
  card: {
    backgroundColor: '#333',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
    marginBottom: '20px',
    width: '100%',
    maxWidth: '400px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: '15px'
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    fontWeight: 'bold'
  }
};

export default StatusCard;