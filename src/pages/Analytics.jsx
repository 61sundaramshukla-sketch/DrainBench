import { useMemo, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, LineChart, Line, Legend, ScatterChart, Scatter,
  ZAxis, ReferenceLine, Label,
} from 'recharts';
import { DemoBadge } from '../components/DemoBadge.jsx';
import { DEMO_EXPERIMENTS } from '../data/demoData.js';
import { recessionTime, smoothSamples } from '../lib/analysis.js';
import { formatDuration, formatTimeAxis } from '../lib/format.js';

const PALETTE = ['var(--primary)', '#2D9EFF', '#00BFFF', 'var(--cyan)'];
const OUTLET_COLORS = { 100: 'var(--primary)', 75: '#2D9EFF', 50: '#00BFFF', 25: 'var(--cyan)' };

function ChartTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glow)', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: '.8rem' }}>
      <div style={{ color: 'var(--text-muted)' }}>Outlet: {d.outlet}% open</div>
      <div className="mono" style={{ color: 'var(--cyan)', fontWeight: 600, marginTop: 4 }}>
        {d.sec != null ? `${d.sec.toFixed(1)} s` : '—'}
      </div>
      {d.sec != null && <div style={{ color: 'var(--text-muted)' }}>{formatDuration(d.sec)}</div>}
      <div style={{ color: 'var(--text-muted)', fontSize: '.7rem', marginTop: 2 }}>[DEMO] Simulated</div>
    </div>
  );
}

function OverlayTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glow)', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: '.8rem', minWidth: 160 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>t = {label} s</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, color: p.color }}>
          <span>{p.name}</span>
          <span className="mono">{p.value != null ? `${p.value} cm` : '—'}</span>
        </div>
      ))}
    </div>
  );
}

export function Analytics() {
  const [activeTab, setActiveTab] = useState('bar');

  // Bar chart data: recession time by outlet
  const barData = useMemo(() => DEMO_EXPERIMENTS.map(e => {
    const sm = smoothSamples(e.samples);
    const r = recessionTime(sm, e.inflowStopT, e.upperCm, e.lowerCm, e.chamberHeightCm);
    return { outlet: e.outletPct, sec: r.seconds, label: `${e.outletPct}%` };
  }), []);

  // Overlay chart: aligned recession curves (t=0 at inflow stop)
  const overlayData = useMemo(() => {
    // Find max duration in post-inflow phase
    const allPost = DEMO_EXPERIMENTS.map(e => {
      const sm = smoothSamples(e.samples);
      const post = sm.filter(s => s.t >= e.inflowStopT);
      return post.map(s => ({ tSec: formatTimeAxis(s.t, e.inflowStopT), levelCm: s.levelCm, outlet: e.outletPct }));
    });
    // Build merged timeline at 0.5s resolution
    const maxT = Math.max(...allPost.map(p => p[p.length - 1]?.tSec ?? 0));
    const steps = [];
    for (let t = 0; t <= maxT; t += 0.5) {
      const row = { tSec: +t.toFixed(1) };
      DEMO_EXPERIMENTS.forEach((e, i) => {
        const pts = allPost[i];
        const near = pts.reduce((best, pt) => Math.abs(pt.tSec - t) < Math.abs(best.tSec - t) ? pt : best, pts[0]);
        if (near && Math.abs(near.tSec - t) < 1.5) {
          row[`outlet_${e.outletPct}`] = near.levelCm;
        }
      });
      steps.push(row);
    }
    return steps;
  }, []);

  // Scatter: outlet opening vs recession seconds
  const scatterData = useMemo(() => barData.map(d => ({ x: d.outlet, y: d.sec })), [barData]);

  const TABS = [
    { id: 'bar',     label: 'Recession Time' },
    { id: 'overlay', label: 'Curve Overlay' },
    { id: 'scatter', label: 'Scatter Plot' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>
      <div className="flex items-center gap-3">
        <DemoBadge />
        <span style={{ color: 'var(--text-muted)', fontSize: '.875rem' }}>
          Comparing methods on pre-generated demo datasets — not validated experimental results
        </span>
      </div>

      {/* Tab Selector */}
      <div className="card" style={{ display: 'flex', gap: 'var(--s2)', flexWrap: 'wrap', padding: 'var(--s3) var(--s4)' }}>
        {TABS.map(tab => (
          <button key={tab.id} className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab(tab.id)} aria-pressed={activeTab === tab.id}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Bar Chart Tab ── */}
      {activeTab === 'bar' && (
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--s4)' }}>
            <h3>[DEMO] Recession Time vs Outlet Opening</h3>
            <DemoBadge />
          </div>
          <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: 'var(--s4)' }}>
            Smaller outlet openings produce longer simulated recession times. Demo outputs only.
          </p>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 24, bottom: 28, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(8,127,255,.08)" />
                <XAxis dataKey="label" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  label={{ value: 'Outlet Opening (%)', position: 'insideBottom', offset: -14, fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  label={{ value: 'Recession Time (s)', angle: -90, position: 'insideLeft', offset: 12, fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="sec" radius={[5, 5, 0, 0]}>
                  {barData.map((d, i) => <Cell key={d.outlet} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Overlay Chart Tab ── */}
      {activeTab === 'overlay' && (
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--s4)' }}>
            <h3>[DEMO] Recession Curve Overlay</h3>
            <DemoBadge />
          </div>
          <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: 'var(--s4)' }}>
            All 4 demo curves aligned at t=0 (inflow stop). Shows how outlet size affects drainage rate.
          </p>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overlayData} margin={{ top: 5, right: 40, bottom: 28, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(8,127,255,.08)" />
                <XAxis dataKey="tSec" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  label={{ value: 'Time since inflow stop (s)', position: 'insideBottom', offset: -14, fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} domain={[0, 30]}
                  label={{ value: 'Level (cm)', angle: -90, position: 'insideLeft', offset: 12, fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip content={<OverlayTip />} />
                <Legend wrapperStyle={{ fontSize: '.78rem', color: 'var(--text-muted)', paddingTop: 8 }} />
                <ReferenceLine y={22} stroke="var(--success)" strokeDasharray="4 2" strokeWidth={1}>
                  <Label value="Upper ref (22 cm)" position="right" fill="var(--success)" fontSize={10} />
                </ReferenceLine>
                <ReferenceLine y={10} stroke="var(--danger)" strokeDasharray="4 2" strokeWidth={1}>
                  <Label value="Lower ref (10 cm)" position="right" fill="var(--danger)" fontSize={10} />
                </ReferenceLine>
                {DEMO_EXPERIMENTS.map(e => (
                  <Line key={e.outletPct} type="monotone"
                    dataKey={`outlet_${e.outletPct}`}
                    name={`${e.outletPct}% outlet`}
                    stroke={OUTLET_COLORS[e.outletPct]}
                    strokeWidth={2} dot={false}
                    isAnimationActive={false}
                    connectNulls={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Scatter Plot Tab ── */}
      {activeTab === 'scatter' && (
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--s4)' }}>
            <h3>[DEMO] Outlet Opening vs Recession Time</h3>
            <DemoBadge />
          </div>
          <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: 'var(--s4)' }}>
            Negative correlation: larger outlet → faster drainage → shorter recession time.
          </p>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 5, right: 24, bottom: 28, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(8,127,255,.08)" />
                <XAxis type="number" dataKey="x" name="Outlet %" domain={[0, 110]}
                  stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  label={{ value: 'Outlet Opening (%)', position: 'insideBottom', offset: -14, fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis type="number" dataKey="y" name="Recession (s)" domain={[0, 'auto']}
                  stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  label={{ value: 'Recession Time (s)', angle: -90, position: 'insideLeft', offset: 12, fill: 'var(--text-muted)', fontSize: 11 }} />
                <ZAxis range={[80, 80]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const { x, y } = payload[0].payload;
                    return (
                      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glow)', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: '.8rem' }}>
                        <div style={{ color: 'var(--text-muted)' }}>Outlet: {x}% open</div>
                        <div className="mono" style={{ color: 'var(--cyan)', fontWeight: 600 }}>{y?.toFixed(1)} s</div>
                        <div style={{ color: 'var(--text-muted)' }}>{formatDuration(y)}</div>
                      </div>
                    );
                  }} />
                <Scatter data={scatterData} fill="var(--cyan)"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(0,217,255,.6))' }} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Summary Table — always visible */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--s4)' }}>[DEMO] Summary Table</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" aria-label="Recession time by outlet">
            <thead>
              <tr>
                <th>Outlet Setting</th>
                <th>Recession (s)</th>
                <th>Formatted</th>
                <th>Speed</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {barData.map((d, i) => {
                const maxSec = Math.max(...barData.map(x => x.sec ?? 0));
                const pct = d.sec != null ? Math.round((d.sec / maxSec) * 100) : 0;
                return (
                  <tr key={d.outlet}>
                    <td className="mono">{d.outlet}% open</td>
                    <td className="mono" style={{ color: 'var(--cyan)' }}>{d.sec != null ? d.sec.toFixed(1) : '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{d.sec != null ? formatDuration(d.sec) : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--bg-secondary)', borderRadius: 3, minWidth: 80 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: PALETTE[i % PALETTE.length], borderRadius: 3, transition: 'width .4s ease' }} />
                        </div>
                        <span style={{ fontSize: '.72rem', color: 'var(--text-muted)', minWidth: 36 }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>[DEMO] Simulated — not a real measurement</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
