import { useState, useMemo } from 'react';
import { Download, ChevronUp, ChevronDown, Search, Database } from 'lucide-react';
import { DemoRecordBadge } from './DemoBadge.jsx';
import { EmptyState } from './EmptyState.jsx';
import { exportExperimentsCSV } from '../lib/csv.js';
import { formatTimestamp, formatOutlet } from '../lib/format.js';

const OUTLET_OPTS=['All','100','75','50','25'];
const STATUS_OPTS=['All','Complete','Running','Reset'];

export function ExperimentHistory({experiments=[]}) {
  const [search,setSearch]=useState('');
  const [outlet,setOutlet]=useState('All');
  const [status,setStatus]=useState('All');
  const [sortKey,setSortKey]=useState('date');
  const [sortDir,setSortDir]=useState('desc');

  const handleSort=k=>{ if(sortKey===k) setSortDir(d=>d==='asc'?'desc':'asc'); else{setSortKey(k);setSortDir('asc');} };

  const filtered=useMemo(()=>{
    let l=[...experiments];
    if(search){const q=search.toLowerCase();l=l.filter(e=>e.id.toLowerCase().includes(q));}
    if(outlet!=='All') l=l.filter(e=>String(e.outletPct)===outlet);
    if(status!=='All') l=l.filter(e=>e.status===status);
    l.sort((a,b)=>{
      let av=a[sortKey],bv=b[sortKey];
      if(sortKey==='date'){av=new Date(av);bv=new Date(bv);}
      if(av<bv) return sortDir==='asc'?-1:1;
      if(av>bv) return sortDir==='asc'?1:-1;
      return 0;
    });
    return l;
  },[experiments,search,outlet,status,sortKey,sortDir]);

  const SortIcon=({col})=>{
    if(sortKey!==col) return <ChevronUp size={11} style={{opacity:.3}} aria-hidden="true"/>;
    return sortDir==='asc'?<ChevronUp size={11} aria-hidden="true"/>:<ChevronDown size={11} aria-hidden="true"/>;
  };

  const COLS=[{k:'id',l:'ID'},{k:'date',l:'Date/Time'},{k:'outletPct',l:'Outlet'},{k:'peakCm',l:'Peak (cm)'},{k:'upperCm',l:'Upper Ref'},{k:'lowerCm',l:'Lower Ref'},{k:'status',l:'Status'},{k:null,l:'Record'}];

  return (
    <div className="card">
      <div className="flex items-center justify-between" style={{marginBottom:'var(--s4)',flexWrap:'wrap',gap:'var(--s3)'}}>
        <h3>Experiment History</h3>
        <button className="btn btn-ghost btn-sm" id="export-csv-btn" onClick={()=>exportExperimentsCSV(filtered)} aria-label="Export CSV">
          <Download size={13} aria-hidden="true"/> Export CSV
        </button>
      </div>
      {/* Filters */}
      <div className="flex gap-3" style={{marginBottom:'var(--s4)',flexWrap:'wrap'}}>
        <div style={{position:'relative',flex:1,minWidth:170}}>
          <Search size={13} style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}} aria-hidden="true"/>
          <input className="form-input" style={{paddingLeft:28}} placeholder="Search by ID…" value={search}
            onChange={e=>setSearch(e.target.value)} aria-label="Search experiments"/>
        </div>
        <select className="form-select" style={{width:'auto',minWidth:115}} value={outlet} onChange={e=>setOutlet(e.target.value)} aria-label="Filter by outlet">
          {OUTLET_OPTS.map(o=><option key={o}>{o==='All'?'All outlets':`${o}% outlet`}</option>)}
        </select>
        <select className="form-select" style={{width:'auto',minWidth:100}} value={status} onChange={e=>setStatus(e.target.value)} aria-label="Filter by status">
          {STATUS_OPTS.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length===0
        ? <EmptyState icon={Database} title="No matching experiments" message="Adjust filters or start a new simulation."/>
        : <div style={{overflowX:'auto'}}>
            <table className="data-table" aria-label="Experiment history">
              <thead><tr>{COLS.map(c=>(
                <th key={c.l} onClick={()=>c.k&&handleSort(c.k)} style={{cursor:c.k?'pointer':'default'}}
                  aria-sort={c.k===sortKey?(sortDir==='asc'?'ascending':'descending'):'none'} scope="col">
                  <span style={{display:'inline-flex',alignItems:'center',gap:3}}>{c.l}{c.k&&<SortIcon col={c.k}/>}</span>
                </th>
              ))}</tr></thead>
              <tbody>{filtered.map(e=>(
                <tr key={e.id}>
                  <td className="mono" style={{color:'var(--cyan)',fontSize:'.8rem'}}>{e.id}</td>
                  <td style={{fontSize:'.78rem',color:'var(--text-muted)'}}>{formatTimestamp(e.date)}</td>
                  <td className="mono">{formatOutlet(e.outletPct)}</td>
                  <td className="mono">{e.peakCm?.toFixed(1)}</td>
                  <td className="mono">{e.upperCm} cm</td>
                  <td className="mono">{e.lowerCm} cm</td>
                  <td><span className={`badge ${e.status==='Complete'?'badge-success':e.status==='Running'?'badge-live':'badge-info'}`}>{e.status}</span></td>
                  <td><DemoRecordBadge/></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
      }
      <div style={{marginTop:'var(--s3)',fontSize:'.72rem',color:'var(--text-muted)'}}>
        Showing {filtered.length} of {experiments.length} · All records are simulated [DEMO]
      </div>
    </div>
  );
}
