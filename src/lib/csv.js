/** csv.js — RFC 4180 CSV export with BOM for Excel */
function esc(v) {
  if (v==null) return '';
  const s=String(v);
  return (s.includes('"')||s.includes(',')||s.includes('\n'))?`"${s.replace(/"/g,'""')}"`:s;
}
export function buildCSV(headers,rows) {
  return '\uFEFF'+[headers.map(esc).join(','),...rows.map(r=>r.map(esc).join(','))].join('\r\n');
}
export function downloadCSV(content,filename) {
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8;'}));
  a.download=filename; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(a.href);
}
export function exportExperimentsCSV(exps) {
  const csv=buildCSV(
    ['ID','Date/Time','Outlet (%)','Peak (cm)','Upper Ref (cm)','Lower Ref (cm)','Status','Note'],
    exps.map(e=>[e.id,e.date,e.outletPct,e.peakCm,e.upperCm,e.lowerCm,e.status,'[DEMO RECORD] Simulated data'])
  );
  downloadCSV(csv,`drainbench-experiments-${new Date().toISOString().slice(0,10)}.csv`);
}
export function exportSamplesCSV(exp) {
  const origin=exp.samples[0]?.t??0;
  const csv=buildCSV(
    ['Time (ms)','Time (s)','Level (cm)','Pump On','Note'],
    exp.samples.map(s=>[s.t,((s.t-origin)/1000).toFixed(2),s.levelCm,s.pumpOn?'YES':'NO','[DEMO] Simulated'])
  );
  downloadCSV(csv,`drainbench-samples-${exp.id}-${new Date().toISOString().slice(0,10)}.csv`);
}
