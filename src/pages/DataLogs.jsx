import { useState, useMemo } from 'react';
import { Download, Search, Database } from 'lucide-react';
import { DemoBadge, DemoRecordBadge } from '../components/DemoBadge.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { DEMO_EXPERIMENTS } from '../data/demoData.js';
import { exportSamplesCSV } from '../lib/csv.js';
import { formatTimeAxis } from '../lib/format.js';

const PAGE_SIZE = 50;

export function DataLogs() {
  const [sel, setSel] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const exp = DEMO_EXPERIMENTS[sel];

  const rows = useMemo(() => {
    const origin = exp.samples[0]?.t ?? 0;
    let list = exp.samples.map(s => ({ ...s, tSec: formatTimeAxis(s.t, origin) }));
    if (search) { const q = parseFloat(search); if (!isNaN(q)) list = list.filter(r => Math.abs(r.levelCm - q) < 1); }
    return list;
  }, [exp, search]);

  const pages = Math.ceil(rows.length / PAGE_SIZE);
  const visible = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="animate-fade-in" style={{display:'flex',flexDirection:'column',gap:'var(--s5)'}}>
      <div className="flex items-center gap-3" style={{flexWrap:'wrap'}}>
        <DemoBadge/>
        <span style={{color:'var(--text-muted)',fontSize:'.875rem'}}>Raw simulated sample data — not real sensor readings</span>
      </div>

      <div className="card" style={{display:'flex',gap:'var(--s3)',flexWrap:'wrap',alignItems:'center'}}>
        <span style={{fontSize:'.875rem',color:'var(--text-muted)'}}>Dataset:</span>
        {DEMO_EXPERIMENTS.map((e,i)=>(
          <button key={e.id} className={`btn btn-sm ${sel===i?'btn-primary':'btn-ghost'}`}
            onClick={()=>{setSel(i);setPage(0);}} aria-pressed={sel===i}>{e.outletPct}% outlet</button>
        ))}
        <button className="btn btn-ghost btn-sm" style={{marginLeft:'auto'}} id="export-samples-btn"
          onClick={()=>exportSamplesCSV(exp)} aria-label="Export samples as CSV">
          <Download size={13} aria-hidden="true"/> Export CSV
        </button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between" style={{marginBottom:'var(--s4)',flexWrap:'wrap',gap:'var(--s3)'}}>
          <h3>[DEMO] Raw Samples — {exp.id}</h3>
          <div style={{position:'relative'}}>
            <Search size={12} style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}} aria-hidden="true"/>
            <input className="form-input" style={{paddingLeft:24,width:155,fontSize:'.8rem'}}
              placeholder="Filter by level…" value={search}
              onChange={e=>{setSearch(e.target.value);setPage(0);}} aria-label="Filter samples"/>
          </div>
        </div>

        {visible.length===0
          ? <EmptyState icon={Database} title="No samples" message="No samples match your filter."/>
          : <>
              <div style={{overflowX:'auto'}}>
                <table className="data-table" aria-label="Raw sample data">
                  <thead><tr><th>Time (ms)</th><th>Time (s)</th><th>Level (cm)</th><th>Pump</th><th>Record</th></tr></thead>
                  <tbody>{visible.map(s=>(
                    <tr key={s.t}>
                      <td className="mono" style={{fontSize:'.78rem',color:'var(--text-muted)'}}>{s.t}</td>
                      <td className="mono">{s.tSec}</td>
                      <td className="mono" style={{color:'var(--cyan)'}}>{s.levelCm}</td>
                      <td><span className={`badge ${s.pumpOn?'badge-success':'badge-info'}`}>{s.pumpOn?'ON':'OFF'}</span></td>
                      <td><DemoRecordBadge/></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between" style={{marginTop:'var(--s4)',flexWrap:'wrap',gap:'var(--s3)'}}>
                <span style={{fontSize:'.78rem',color:'var(--text-muted)'}}>
                  {page*PAGE_SIZE+1}–{Math.min((page+1)*PAGE_SIZE,rows.length)} of {rows.length} samples
                </span>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} aria-label="Previous">‹ Prev</button>
                  {Array.from({length:pages},(_,i)=>i).slice(Math.max(0,page-2),page+3).map(i=>(
                    <button key={i} className={`btn btn-sm ${i===page?'btn-primary':'btn-ghost'}`}
                      onClick={()=>setPage(i)} aria-current={i===page?'page':undefined}>{i+1}</button>
                  ))}
                  <button className="btn btn-ghost btn-sm" onClick={()=>setPage(p=>Math.min(pages-1,p+1))} disabled={page>=pages-1} aria-label="Next">Next ›</button>
                </div>
              </div>
            </>
        }
      </div>
    </div>
  );
}
