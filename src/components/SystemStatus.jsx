import { Cpu, Radio, Wifi, Clock, Database, Activity } from 'lucide-react';
import { formatTimestamp } from '../lib/format.js';

const S_MAP={
  connected:  { color:'var(--success)', dot:'online',  label:'Connected' },
  disconnected:{ color:'var(--danger)', dot:'offline', label:'Disconnected' },
  demo:       { color:'var(--warning)', dot:'demo',    label:'Demo / Simulated' },
};

function Row({icon:Icon,label,statusKey,detail}) {
  const s=S_MAP[statusKey]??S_MAP.disconnected;
  return (
    <div style={{display:'flex',alignItems:'center',gap:'var(--s3)',padding:'var(--s3) 0',borderBottom:'1px solid var(--border)'}}>
      <span style={{width:34,height:34,borderRadius:'var(--r-md)',background:`${s.color}14`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}} aria-hidden="true">
        <Icon size={15} style={{color:s.color}}/>
      </span>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:'.875rem',fontWeight:500}}>{label}</div>
        {detail&&<div style={{fontSize:'.72rem',color:'var(--text-muted)'}}>{detail}</div>}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
        <span className={`status-dot ${s.dot}`} aria-hidden="true"/>
        <span style={{fontSize:'.8rem',color:s.color,fontWeight:500}}>{s.label}</span>
      </div>
    </div>
  );
}

export function SystemStatus({status}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between" style={{marginBottom:'var(--s4)'}}>
        <h3>System Status</h3>
        <span className="badge badge-demo">Hardware Not Connected</span>
      </div>
      <Row icon={Cpu}      label="ESP32 Microcontroller"  statusKey={status.esp32.state}  detail={status.esp32.label}/>
      <Row icon={Radio}    label="Ultrasonic Sensor"      statusKey={status.sensor.state} detail={status.sensor.label}/>
      <Row icon={Wifi}     label="Wi-Fi / Network"        statusKey={status.wifi.state}   detail={status.wifi.label}/>
      <Row icon={Clock}    label="Last Reading"           statusKey={status.lastReadingAt?'connected':'disconnected'} detail={status.lastReadingAt?formatTimestamp(status.lastReadingAt):'No data received'}/>
      <Row icon={Database} label="Data Source"            statusKey={status.source==='DEMO'?'demo':'connected'} detail={status.source==='DEMO'?'Demo mode — simulated samples':'Live ESP32 data'}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'var(--s3)',marginTop:'var(--s2)'}}>
        <span style={{display:'flex',alignItems:'center',gap:8,fontSize:'.8rem',color:'var(--text-muted)'}}>
          <Activity size={13} aria-hidden="true"/> Total demo samples
        </span>
        <span className="mono" style={{color:'var(--cyan)',fontSize:'.9rem'}}>{status.sampleCount?.toLocaleString()}</span>
      </div>
    </div>
  );
}
