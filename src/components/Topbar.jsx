import { useState, useEffect } from 'react';
import { Bell, Menu } from 'lucide-react';
import { DEMO_ALERTS } from '../data/demoData.js';

export function Topbar({pageTitle,onMenuClick}) {
  const [now,setNow]=useState(new Date());
  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),1000); return()=>clearInterval(t); },[]);
  const unread=DEMO_ALERTS.filter(a=>!a.read).length;
  const time=now.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const date=now.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'2-digit'});
  return (
    <header className="topbar" role="banner">
      <button id="mobile-menu-btn" className="btn btn-ghost btn-icon" onClick={onMenuClick}
        aria-label="Open navigation" style={{display:'none'}}><Menu size={18} aria-hidden="true"/></button>
      <h1 className="topbar-title">{pageTitle}</h1>
      <div className="demo-pill" role="status" aria-label="Demo mode — hardware not connected">
        <span className="pulse-dot" style={{background:'var(--warning)'}} aria-hidden="true"/>
        DEMO MODE — Hardware Not Connected
      </div>
      <div className="mono" style={{fontSize:'.8rem',color:'var(--text-muted)',whiteSpace:'nowrap'}} aria-label={`Time: ${time}`}>
        {date} · {time}
      </div>
      <button className="btn btn-ghost btn-icon notif-btn" aria-label={`${unread} unread notifications`}>
        <Bell size={17} aria-hidden="true"/>
        {unread>0&&<span className="notif-badge" aria-hidden="true">{unread}</span>}
      </button>
      <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,var(--primary),var(--cyan))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.7rem',fontWeight:700,color:'#fff',flexShrink:0}} role="img" aria-label="Team profile">DB</div>
    </header>
  );
}
