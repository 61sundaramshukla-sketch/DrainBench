import { useState, useMemo } from 'react';
import { AlertsPanel } from '../components/AlertsPanel.jsx';
import { DemoBadge } from '../components/DemoBadge.jsx';
import { DEMO_ALERTS } from '../data/demoData.js';
import { AlertCircle, AlertTriangle, Info, CheckCircle, Filter } from 'lucide-react';
import { formatTimestamp } from '../lib/format.js';

const TYPE_COLORS = {
  error:   'var(--danger)',
  warning: 'var(--warning)',
  info:    'var(--primary)',
  success: 'var(--success)',
};
const TYPE_ICONS = { error: AlertCircle, warning: AlertTriangle, info: Info, success: CheckCircle };

export function Alerts() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [showRead, setShowRead] = useState(true);

  const filtered = useMemo(() => {
    return DEMO_ALERTS
      .filter(a => typeFilter === 'all' || a.type === typeFilter)
      .filter(a => showRead || !a.read)
      .sort((a, b) => b.ts - a.ts);
  }, [typeFilter, showRead]);

  const counts = useMemo(() => ({
    all:     DEMO_ALERTS.length,
    warning: DEMO_ALERTS.filter(a => a.type === 'warning').length,
    info:    DEMO_ALERTS.filter(a => a.type === 'info').length,
    unread:  DEMO_ALERTS.filter(a => !a.read).length,
  }), []);

  const TYPE_BTNS = [
    { id: 'all',     label: `All (${counts.all})` },
    { id: 'warning', label: `⚠ Warnings (${counts.warning})` },
    { id: 'info',    label: `ℹ Info (${counts.info})` },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s5)' }}>
      <div className="flex items-center gap-3">
        <DemoBadge />
        <span style={{ color: 'var(--text-muted)', fontSize: '.875rem' }}>
          All alerts are demo examples — no real sensor data
        </span>
      </div>

      {/* Info banner */}
      <div className="card" style={{ padding: 'var(--s4)', background: 'rgba(8,127,255,.04)', borderColor: 'rgba(8,127,255,.2)' }} role="note">
        <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
          <strong style={{ color: 'var(--text)' }}>Alert types:</strong><br />
          🔵 <strong>Info</strong> — experiment start/stop events<br />
          🟠 <strong>Warning</strong> — experimental indicators (level above threshold, slow recession)<br />
          Alerts never claim real blockage detection. "Possible outlet restriction" is an experimental indicator only.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--s4)' }}>
        {[
          { label: 'Total Alerts', value: counts.all, color: 'var(--primary)' },
          { label: 'Warnings', value: counts.warning, color: 'var(--warning)' },
          { label: 'Info', value: counts.info, color: 'var(--primary)' },
          { label: 'Unread', value: counts.unread, color: 'var(--danger)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: 'var(--s4)' }}>
            <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap', alignItems: 'center', padding: 'var(--s3) var(--s4)' }}>
        <Filter size={14} style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
        <span style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>Filter:</span>
        {TYPE_BTNS.map(b => (
          <button key={b.id} className={`btn btn-sm ${typeFilter === b.id ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTypeFilter(b.id)} aria-pressed={typeFilter === b.id}>
            {b.label}
          </button>
        ))}
        <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showRead} onChange={e => setShowRead(e.target.checked)}
            style={{ accentColor: 'var(--primary)' }} />
          Show read
        </label>
      </div>

      {/* Timeline */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--s5)' }}>Alert Timeline</h3>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--s8) 0', color: 'var(--text-muted)', fontSize: '.875rem' }}>
            <CheckCircle size={26} style={{ marginBottom: 8, color: 'var(--success)' }} aria-hidden="true" />
            <div>No alerts match the current filter.</div>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: 'var(--s6)' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 9, top: 0, bottom: 0, width: 2, background: 'var(--border)', borderRadius: 1 }} aria-hidden="true" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
              {filtered.map(a => {
                const Icon = TYPE_ICONS[a.type] ?? Info;
                const color = TYPE_COLORS[a.type] ?? 'var(--text-muted)';
                return (
                  <div key={a.id} style={{ position: 'relative', display: 'flex', gap: 'var(--s4)', alignItems: 'flex-start' }}>
                    {/* Timeline dot */}
                    <div style={{
                      position: 'absolute', left: 'calc(-1 * var(--s6) + 2px)',
                      width: 16, height: 16, borderRadius: '50%',
                      background: `${color}22`, border: `2px solid ${color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }} aria-hidden="true">
                      <Icon size={8} style={{ color }} />
                    </div>
                    {/* Card */}
                    <div className={`alert-item ${a.type}`} style={{ flex: 1 }} role="listitem">
                      <Icon size={15} style={{ color, flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '.875rem', color: 'var(--text)' }}>{a.title}</strong>
                          {!a.read && (
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)', flexShrink: 0 }} aria-label="Unread" />
                          )}
                        </div>
                        <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{a.message}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 6, opacity: .7 }}>
                          {formatTimestamp(a.ts)} {a.read && '· Read'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Original compact panel for quick overview */}
      <AlertsPanel alerts={DEMO_ALERTS} maxVisible={20} />
    </div>
  );
}
