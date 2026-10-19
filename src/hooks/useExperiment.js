/**
 * useExperiment.js — experiment state machine + timer.
 * State: idle → filling → inflow_stopped → recording_recession → complete
 * Timer cleans up on unmount to prevent memory leaks.
 */
import { useReducer, useRef, useCallback, useEffect } from 'react';
import { dataSource } from '../services/dataSource.js';
import { smoothSamples, recessionTime } from '../lib/analysis.js';
import { CHAMBER_HEIGHT_CM } from '../data/demoData.js';
import { useSettings } from '../contexts/SettingsContext.jsx';

const STEPS = ['idle','filling','inflow_stopped','recording_recession','complete'];

function genId() { return `EXP-${new Date().toISOString().replace(/[:.]/g,'-').slice(0,19)}`; }

function makeInit(settings) {
  return {
    phase:'idle', experimentId:genId(),
    outletPct:100,
    upperCm: settings?.alertThresholdCm ?? 22,
    lowerCm:10, peakCm:26,
    chamberHeightCm: settings?.chamberHeightCm ?? CHAMBER_HEIGHT_CM,
    samples:[], inflowStopT:null,
    recessionResult:{seconds:null,reason:'Waiting for experiment.'},
    validationErrors:{},
    smoothingMethod: settings?.smoothingMethod ?? 'moving_average',
    smoothingWindow: settings?.smoothingWindow ?? 3,
  };
}

function reducer(s, a) {
  switch(a.type) {
    case 'SET_FIELD':    return {...s,[a.field]:a.value,validationErrors:{}};
    case 'SET_ERRORS':   return {...s,validationErrors:a.errors};
    case 'START':        return {...s,phase:'filling',samples:[],inflowStopT:null,experimentId:a.id,recessionResult:{seconds:null,reason:'Collecting inflow data…'}};
    case 'ADD_SAMPLE': {
      const samples=[...s.samples,a.sample];
      let rr=s.recessionResult;
      if (s.phase==='recording_recession'||s.phase==='complete') {
        const sm=smoothSamples(samples,s.smoothingMethod,s.smoothingWindow);
        rr=recessionTime(sm,s.inflowStopT,s.upperCm,s.lowerCm,s.chamberHeightCm);
      }
      return {...s,samples,recessionResult:rr};
    }
    case 'STOP_INFLOW':     return {...s,phase:'inflow_stopped',inflowStopT:a.t};
    case 'BEGIN_RECESSION': return {...s,phase:'recording_recession'};
    case 'COMPLETE': {
      const sm=smoothSamples(s.samples,s.smoothingMethod,s.smoothingWindow);
      return {...s,phase:'complete',recessionResult:recessionTime(sm,s.inflowStopT,s.upperCm,s.lowerCm,s.chamberHeightCm)};
    }
    case 'RESET': return {...makeInit(a.settings),experimentId:genId()};
    default: return s;
  }
}

function validate(s) {
  const e={};
  if (isNaN(s.upperCm)||s.upperCm<=0) e.upperCm='Must be a positive number.';
  else if (s.upperCm>=s.chamberHeightCm) e.upperCm=`Must be < chamber height (${s.chamberHeightCm} cm).`;
  if (isNaN(s.lowerCm)||s.lowerCm<=0) e.lowerCm='Must be a positive number.';
  else if (s.lowerCm>=s.chamberHeightCm) e.lowerCm=`Must be < chamber height (${s.chamberHeightCm} cm).`;
  if (!e.upperCm&&!e.lowerCm&&s.upperCm<=s.lowerCm) e.upperCm='Upper must be greater than lower level.';
  return e;
}

export function useExperiment() {
  const { settings } = useSettings();
  const [state, dispatch] = useReducer(reducer, null, () => makeInit(settings));
  const timerRef = useRef(null);
  const idxRef   = useRef(0);

  useEffect(()=>()=>clearInterval(timerRef.current),[]);

  const startExperiment = useCallback(()=>{
    const errs=validate(state);
    if (Object.keys(errs).length) { dispatch({type:'SET_ERRORS',errors:errs}); return; }
    clearInterval(timerRef.current);
    idxRef.current=0;
    const exp=dataSource.startExperiment({outletPct:state.outletPct,peakCm:state.peakCm,upperCm:state.upperCm,lowerCm:state.lowerCm});
    dispatch({type:'START',id:exp.id});
    timerRef.current=setInterval(()=>{
      const idx=idxRef.current;
      if (idx>=exp.samples.length) { clearInterval(timerRef.current); dispatch({type:'COMPLETE'}); return; }
      const sample=exp.samples[idx];
      dispatch({type:'ADD_SAMPLE',sample});
      if (idx>0&&!sample.pumpOn&&exp.samples[idx-1].pumpOn) {
        dispatch({type:'STOP_INFLOW',t:sample.t});
        setTimeout(()=>dispatch({type:'BEGIN_RECESSION'}),300);
      }
      idxRef.current=idx+1;
    },100);
  },[state]);

  const stopInflow=useCallback(()=>{
    if (state.phase!=='filling') return;
    dispatch({type:'STOP_INFLOW',t:Date.now()});
    setTimeout(()=>dispatch({type:'BEGIN_RECESSION'}),200);
  },[state.phase]);

  const resetExperiment=useCallback(()=>{
    clearInterval(timerRef.current); idxRef.current=0;
    dataSource.resetExperiment(); dispatch({type:'RESET',settings});
  },[settings]);

  const setField=useCallback((f,v)=>dispatch({type:'SET_FIELD',field:f,value:v}),[]);

  return {...state, stepIndex:STEPS.indexOf(state.phase), steps:STEPS, startExperiment, stopInflow, resetExperiment, setField};
}
