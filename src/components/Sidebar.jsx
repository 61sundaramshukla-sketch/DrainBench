import { NavLink } from 'react-router-dom';
import { LayoutDashboard,Activity,FlaskConical,GitCompare,BarChart2,Bell,Cpu,Database,Settings,X,Droplets } from 'lucide-react';

const NAV=[
  {section:'Monitor',items:[{to:'/',label:'Dashboard',icon:LayoutDashboard},{to:'/live',label:'Live Monitoring',icon:Activity}]},
  {section:'Experiment',items:[{to:'/experiments',label:'Experiments',icon:FlaskConical},{to:'/compare',label:'Method Comparison',icon:GitCompare},{to:'/analytics',label:'Analytics',icon:BarChart2}]},
  {section:'System',items:[{to:'/alerts',label:'Alerts',icon:Bell},{to:'/status',label:'System Status',icon:Cpu},{to:'/logs',label:'Data Logs',icon:Database},{to:'/settings',label:'Settings',icon:Settings}]},
];

export function Sidebar({isOpen,onClose}) {
  return (
    <>
      <div className={`sidebar-overlay${isOpen?'':' hidden'}`} onClick={onClose} aria-hidden="true"/>
      <nav className={`sidebar${isOpen?' mobile-open':''}`} aria-label="Main navigation"
        onKeyDown={e=>e.key==='Escape'&&isOpen&&onClose()}>
        <div className="sidebar-logo">
          <Droplets size={28} style={{color:'var(--cyan)',flexShrink:0}} aria-hidden="true"/>
          <div><div className="sidebar-logo-text">DrainBench</div><div className="sidebar-logo-sub mono">DEMO MODE</div></div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close navigation"
            style={{marginLeft:'auto',display:isOpen?'flex':'none'}}><X size={15} aria-hidden="true"/></button>
        </div>
        <div className="sidebar-nav" role="list">
          {NAV.map(s=>(
            <div key={s.section} role="group" aria-label={s.section}>
              <div className="nav-section-label">{s.section}</div>
              {s.items.map(item=>(
                <NavLink key={item.to} to={item.to} end={item.to==='/'} onClick={onClose}
                  className={({isActive})=>`nav-item${isActive?' active':''}`} aria-label={item.label} role="listitem">
                  <item.icon size={17} aria-hidden="true" style={{flexShrink:0}}/>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <div style={{fontSize:'.7rem',color:'var(--text-muted)',textAlign:'center'}}>v1.0.0 · College Prototype</div>
        </div>
      </nav>
    </>
  );
}
