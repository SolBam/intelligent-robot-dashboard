import { VideoOff } from 'lucide-react';

const CameraView = ({ streamUrl }) => {
  return (
    <div style={styles.card}>
      <h3 style={styles.header}>
        🎥 Live Feed 
        {streamUrl && <span style={styles.liveIndicator}>LIVE</span>}
      </h3>
      
      <div style={styles.videoContainer}>
        {streamUrl ? (
          // MJPEG 스트림은 img 태그로 바로 볼 수 있습니다.
          // (지금은 테스트를 위해 외부 플레이스홀더 이미지를 사용합니다)
          <img 
            src={streamUrl} 
            alt="Robot Live Stream" 
            style={styles.video}
            onError={(e) => {
                e.target.onerror = null; 
                // e.target.src = '대체 이미지 URL'; // 연결 끊겼을 때 이미지
            }}
          />
        ) : (
          // 스트림 주소가 없을 때 보여줄 화면
          <div style={styles.placeholder}>
            <VideoOff size={48} color="#666" />
            <p>Signal Lost</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#2a2a2a', // 조금 더 어두운 배경
    padding: '15px',
    borderRadius: '12px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '640px', // 비디오 화면은 좀 더 넓게
    border: '1px solid #444'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  liveIndicator: {
    backgroundColor: '#F44336',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 'bold'
  },
  videoContainer: {
    width: '100%',
    aspectRatio: '16 / 9', // 16:9 비율 고정
    backgroundColor: '#000',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' // 화면 꽉 채우기
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#666',
    gap: '10px'
  }
};

export default CameraView;