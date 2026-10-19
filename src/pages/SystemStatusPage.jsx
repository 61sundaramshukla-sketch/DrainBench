import { SystemStatus } from '../components/SystemStatus.jsx';
import { DemoBadge } from '../components/DemoBadge.jsx';
import { dataSource } from '../services/dataSource.js';

export function SystemStatusPage() {
  const status = dataSource.getStatus();
  return (
    <div className="animate-fade-in" style={{display:'flex',flexDirection:'column',gap:'var(--s5)'}}>
      <div className="flex items-center gap-3">
        <DemoBadge/>
        <span style={{color:'var(--text-muted)',fontSize:'.875rem'}}>Hardware not connected — showing demo system state</span>
      </div>
      <div className="card" style={{background:'rgba(255,82,99,.03)',borderColor:'rgba(255,82,99,.2)'}} role="note">
        <p style={{fontSize:'.8rem',color:'var(--danger)',lineHeight:1.7}}>
          ⚠ <strong>DEMO MODE ACTIVE</strong> — No ESP32, sensor, or Wi-Fi is connected.
          All "disconnected" statuses are expected. To connect real hardware, implement <code>LiveDataSource</code> in <code>src/services/dataSource.js</code>.
        </p>
      </div>
      <SystemStatus status={status}/>
      <div className="card">
        <h3 style={{marginBottom:'var(--s4)'}}>Next Steps for Hardware Integration</h3>
        <ol style={{paddingLeft:'var(--s5)',color:'var(--text-muted)',fontSize:'.875rem',lineHeight:2.2}}>
          <li>Implement <code>LiveDataSource</code> in <code>src/services/dataSource.js</code></li>
          <li>Flash ESP32 firmware with HC-SR04 ultrasonic driver</li>
          <li>Apply sensor conversion: <code>levelCm = chamberH − distanceCm − calibrationOffset</code></li>
          <li>Choose transport: WebSocket (low latency) or MQTT (reliable retry)</li>
          <li>Add persistence (Firebase / local DB) for experiment records</li>
          <li>Validate all four methods against real experimental runs</li>
        </ol>
      </div>
    </div>
  );
}
