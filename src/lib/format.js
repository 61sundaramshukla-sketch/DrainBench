/** format.js — consistent unit display throughout the app */
export const formatLevel        = (cm,d=1)=>cm==null||isNaN(cm)?'—':`${(+cm).toFixed(d)} cm`;
export const formatLevelPercent = (cm,h=40)=>cm==null||isNaN(cm)?'—':`${Math.round(cm/h*100)}%`;
export const formatDuration     = (s,d=1)=>{
  if (s==null||isNaN(s)) return '—';
  if (s<60) return `${(+s).toFixed(d)} s`;
  return `${Math.floor(s/60)}m ${(s%60).toFixed(0)}s`;
};
export const formatRate         = r=>r==null||isNaN(r)?'—':`${(+r).toFixed(3)} cm/s`;
export const formatTimestamp    = iso=>{
  if (!iso) return '—';
  const d=new Date(iso); if(isNaN(d)) return '—';
  return d.toLocaleString(undefined,{year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});
};
export const formatTimeAxis     = (ms,origin=0)=>+((ms-origin)/1000).toFixed(1);
export const formatOutlet       = pct=>pct==null?'—':`${pct}% open`;
