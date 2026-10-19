import { useState } from 'react';
import { DemoBadge } from '../components/DemoBadge.jsx';
import { useSettings } from '../contexts/SettingsContext.jsx';
import { Save, RotateCcw } from 'lucide-react';

export function Settings() {
  const { settings, setSetting, saveSettings, savedFlash, reset } = useSettings();

  // Local draft state for changes before saving
  const [draft, setDraft] = useState({ ...settings });

  function updateDraft(key, value) {
    setDraft(prev => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    saveSettings(draft);
  }

  function handleReset() {
    reset();
    setDraft({
      chamberHeightCm: 40,
      alertThresholdCm: 22,
      smoothingMethod: 'moving_average',
      smoothingWindow: 3,
      glowIntensity: 'normal',
    });
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)', maxWidth: 640 }}>
      <div className="flex items-center gap-3">
        <DemoBadge />
        <span style={{ color: 'var(--text-muted)', fontSize: '.875rem' }}>
          Settings are persisted to <code>localStorage</code> and applied globally
        </span>
      </div>

      {/* Chamber Configuration */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--s4)' }}>Chamber Configuration</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="set-chamber">Chamber Height (cm)</label>
            <input id="set-chamber" type="number" min="10" max="200" step="1"
              className="form-input mono"
              value={draft.chamberHeightCm}
              onChange={e => updateDraft('chamberHeightCm', Number(e.target.value))} />
            <small style={{ color: 'var(--text-muted)', fontSize: '.72rem' }}>
              Total measurable depth of the drainage chamber. Used to compute fill percentage.
            </small>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="set-thresh">Alert Threshold (cm)</label>
            <input id="set-thresh" type="number" min="1" max={draft.chamberHeightCm} step=".5"
              className="form-input mono"
              value={draft.alertThresholdCm}
              onChange={e => updateDraft('alertThresholdCm', Number(e.target.value))} />
            <small style={{ color: 'var(--text-muted)', fontSize: '.72rem' }}>
              Level above which the "threshold exceeded" indicator fires in method comparison.
            </small>
          </div>
        </div>
      </div>

      {/* Data Smoothing */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--s4)' }}>Data Smoothing</h3>
        <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: 'var(--s4)' }}>
          Applied before analysis functions to reduce sensor noise. Affects Dashboard, Experiments, Method Comparison and Live Monitoring.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="set-smooth">Method</label>
            <select id="set-smooth" className="form-select" value={draft.smoothingMethod}
              onChange={e => updateDraft('smoothingMethod', e.target.value)}>
              <option value="moving_average">Moving Average</option>
              <option value="median">Median Filter</option>
              <option value="none">None (raw)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="set-win">Window Size: {draft.smoothingWindow} samples</label>
            <input id="set-win" type="range" min="1" max="9" step="2"
              value={draft.smoothingWindow}
              onChange={e => updateDraft('smoothingWindow', Number(e.target.value))}
              disabled={draft.smoothingMethod === 'none'}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
              aria-label="Smoothing window size" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.7rem', color: 'var(--text-muted)' }}>
              <span>1 (raw)</span><span>5</span><span>9 (heavy)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Display */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--s4)' }}>Display</h3>
        <div className="form-group">
          <label className="form-label" htmlFor="set-glow">Glow Intensity</label>
          <select id="set-glow" className="form-select" value={draft.glowIntensity}
            onChange={e => updateDraft('glowIntensity', e.target.value)}>
            <option value="normal">Normal</option>
            <option value="reduced">Reduced (accessibility / battery saving)</option>
          </select>
          <small style={{ color: 'var(--text-muted)', fontSize: '.72rem' }}>
            Reduced also respects prefers-reduced-motion.
          </small>
        </div>
      </div>

      {/* About */}
      <div className="card" style={{ background: 'rgba(8,127,255,.04)', borderColor: 'rgba(8,127,255,.2)' }}>
        <h3 style={{ marginBottom: 'var(--s3)' }}>About DrainBench</h3>
        <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: 'var(--s2) var(--s5)', fontSize: '.8rem', color: 'var(--text-muted)' }}>
          {[
            ['Version', 'v1.0.0'],
            ['Mode', 'DEMO — No hardware connected'],
            ['Data source', 'Deterministic simulated recession curves (LCG seeded)'],
            ['ESP32 support', 'Implement LiveDataSource in src/services/dataSource.js'],
            ['Sample rate', '2 Hz (simulated)'],
            ['Chamber default', '40 cm'],
          ].map(([k, v]) => (
            <><dt key={k} style={{ color: 'var(--text)', fontWeight: 500 }}>{k}</dt><dd key={k+'v'}>{v}</dd></>
          ))}
        </dl>
      </div>

      <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
        <button id="settings-save-btn" className="btn btn-primary" onClick={handleSave}>
          <Save size={14} aria-hidden="true" />
          {savedFlash ? '✓ Saved!' : 'Save Settings'}
        </button>
        <button className="btn btn-ghost" onClick={handleReset} aria-label="Reset to defaults">
          <RotateCcw size={14} aria-hidden="true" />
          Reset to Defaults
        </button>
        {savedFlash && (
          <span style={{ color: 'var(--success)', fontSize: '.875rem' }} role="status">
            Saved to localStorage ✓
          </span>
        )}
      </div>
    </div>
  );
}
