import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Clock3, Expand, Shrink, Settings2, Play, Pause, RotateCcw, SkipForward, Volume2, Eye, EyeOff, X, Check, Coffee, Focus, Smartphone } from 'lucide-react';
import './style.css';

type Mode = 'focus' | 'short' | 'long';
type Prefs = {focus:number; short:number; long:number; longEvery:number; sound:boolean; seconds:boolean; keepAwake:boolean; showTime:boolean; appearance:'night'|'apple'};
type Session = {mode:Mode; endAt:number|null; remaining:number; running:boolean; completed:number};
const defaults: Prefs = {focus:25, short:5, long:15, longEvery:4, sound:true, seconds:false, keepAwake:true, showTime:false, appearance:'night'};
const secondsFor = (mode:Mode,p:Prefs) => p[mode]*60;
const read = <T,>(key:string,fallback:T):T => {try{const value=localStorage.getItem(key);return value?{...fallback,...JSON.parse(value)}:fallback}catch{return fallback}};
const pad=(n:number)=>String(n).padStart(2,'0');
function notifyDone(){try{const Ctx=window.AudioContext || (window as any).webkitAudioContext;if(!Ctx)return;const ctx=new Ctx();[0,.2,.4].forEach((delay)=>{const o=ctx.createOscillator();const g=ctx.createGain();o.type='sine';o.frequency.value=880;g.gain.setValueAtTime(.0001,ctx.currentTime+delay);g.gain.exponentialRampToValueAtTime(.08,ctx.currentTime+delay+.02);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+delay+.16);o.connect(g);g.connect(ctx.destination);o.start(ctx.currentTime+delay);o.stop(ctx.currentTime+delay+.17)});setTimeout(()=>ctx.close(),1200)}catch{}}
function App(){
 const [prefs,setPrefs]=useState<Prefs>(()=>read('tempo-prefs',defaults));
 const [session,setSession]=useState<Session>(()=>{const s=read<Session>('tempo-session',{mode:'focus',endAt:null,remaining:25*60,running:false,completed:0});return {...s,remaining:s.running&&s.endAt?Math.max(0,Math.ceil((s.endAt-Date.now())/1000)):s.remaining}});
 const [now,setNow]=useState(new Date());const [settings,setSettings]=useState(false);const [full,setFull]=useState(false);const [message,setMessage]=useState('');
 const wakeRef=useRef<any>(null);const lastDoneRef=useRef<number|null>(null);
 const [controlsVisible,setControlsVisible]=useState(true);
 const idleRef=useRef<number|undefined>(undefined);
 const revealControls=()=>{setControlsVisible(true);window.clearTimeout(idleRef.current);if(session.running)idleRef.current=window.setTimeout(()=>setControlsVisible(false),3500)};
 useEffect(()=>{revealControls();return()=>window.clearTimeout(idleRef.current)},[session.running]);
 useEffect(()=>{localStorage.setItem('tempo-prefs',JSON.stringify(prefs))},[prefs]);
 useEffect(()=>{document.querySelector('meta[name="theme-color"]')?.setAttribute('content',prefs.appearance==='apple'?'#f5f5f7':'#090b10')},[prefs.appearance]);
 useEffect(()=>{localStorage.setItem('tempo-session',JSON.stringify(session))},[session]);
 useEffect(()=>{const id=window.setInterval(()=>{setNow(new Date());setSession(s=>{if(!s.running||!s.endAt)return s;const left=Math.max(0,Math.ceil((s.endAt-Date.now())/1000));if(left>0)return s.remaining===left?s:{...s,remaining:left};if(lastDoneRef.current===s.endAt)return {...s,remaining:0,running:false,endAt:null};lastDoneRef.current=s.endAt;const count=s.completed+(s.mode==='focus'?1:0);const next:Mode=s.mode==='focus'?(count%prefs.longEvery===0?'long':'short'):'focus';if(prefs.sound)notifyDone();setMessage(s.mode==='focus'?'Foco concluído! Hora de descansar.':'Pausa concluída! Hora de focar.');return {mode:next,remaining:secondsFor(next,prefs),endAt:null,running:false,completed:count}})},250);return()=>clearInterval(id)},[prefs]);
 useEffect(()=>{const check=()=>setFull(Boolean(document.fullscreenElement));document.addEventListener('fullscreenchange',check);return()=>document.removeEventListener('fullscreenchange',check)},[]);
 useEffect(()=>{let active=true;async function acquire(){if(!prefs.keepAwake||!session.running||!('wakeLock'in navigator)){if(wakeRef.current){try{await wakeRef.current.release()}catch{}wakeRef.current=null}return}try{if(!wakeRef.current&&document.visibilityState==='visible'){const lock=await (navigator as any).wakeLock.request('screen');if(active)wakeRef.current=lock;else await lock.release()}}catch{}}acquire();const visible=()=>{if(document.visibilityState==='visible'){wakeRef.current=null;acquire()}};document.addEventListener('visibilitychange',visible);return()=>{active=false;document.removeEventListener('visibilitychange',visible);if(wakeRef.current){wakeRef.current.release().catch(()=>{});wakeRef.current=null}}},[prefs.keepAwake,session.running]);
 const start=()=>{setMessage('');setSession(s=>({...s,running:true,endAt:Date.now()+s.remaining*1000}))};
 const pause=()=>setSession(s=>({...s,running:false,endAt:null,remaining:s.endAt?Math.max(0,Math.ceil((s.endAt-Date.now())/1000)):s.remaining}));
 const reset=()=>{setMessage('');setSession(s=>({...s,running:false,endAt:null,remaining:secondsFor(s.mode,prefs)}))};
 const pick=(mode:Mode)=>{setMessage('');setSession(s=>({...s,mode,running:false,endAt:null,remaining:secondsFor(mode,prefs)}))};
 const skip=()=>{setMessage('');setSession(s=>{const mode:Mode=s.mode==='focus'?'short':'focus';return {...s,mode,running:false,endAt:null,remaining:secondsFor(mode,prefs)}})};
 const toggleFull=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{setMessage('Tela cheia indisponível neste navegador.')}};
 const changeDuration=(field:'focus'|'short'|'long',val:number)=>{const clamped=Math.min(180,Math.max(1,val||1));setPrefs(p=>({...p,[field]:clamped}));setSession(s=>s.mode===field&&!s.running?{...s,remaining:clamped*60}:s)};
 const progress=1-session.remaining/secondsFor(session.mode,prefs);
 const time=now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',...(prefs.seconds?{second:'2-digit'}:{})});
 const date=now.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
 const modes:Record<Mode,string>={focus:'Foco',short:'Pausa curta',long:'Pausa longa'};
 const cycleProgress=session.completed>0&&session.completed%prefs.longEvery===0&&session.mode!=='focus'?prefs.longEvery:session.completed%prefs.longEvery;
 const paused=!session.running&&session.remaining<secondsFor(session.mode,prefs);
 const sessionTitle=paused?'Sessão pausada':session.running?(session.mode==='focus'?'Em foco':'Hora de descansar'):(session.mode==='focus'?'Seu próximo momento de foco':modes[session.mode]);
 return <div className={'app '+(prefs.appearance==='apple'?'apple-theme ':'')+(session.running?'is-running ':'')+(session.mode!=='focus'?'is-break ':'')+(!controlsVisible?'is-quiet':'')} onPointerMove={revealControls} onPointerDown={revealControls} onKeyDownCapture={revealControls}>
  <header className="topbar"><div className="brand"><span className="brandicon"><Clock3 size={18}/></span><span>tempo<span className="branddot">.</span></span><span className="brand-sub">standby focus</span></div><div className="top-actions"><span className="live"><i/> AMBIENTE DE FOCO</span><button className="icon-button" title="Configurações" aria-label="Configurações" onClick={()=>setSettings(true)}><Settings2 size={19}/></button><button className="icon-button" title="Tela cheia" aria-label="Tela cheia" onClick={toggleFull}>{full?<Shrink size={19}/>:<Expand size={19}/>}</button></div></header>
  <main className="dashboard">
   <section className="clock-zone" aria-label="Relógio">
    <div className="clock-intro">Seu espaço, seu tempo.</div>
    <div className={'clock '+(prefs.seconds?'with-seconds':'')} aria-label={'Hora atual '+time}>{time}</div>
    <div className="date">{date}</div>
    <div className="clock-foot"><span className="statusdot"/> Um momento de cada vez.</div>
   </section>
   <div className="separator"/>
   <section className="timer-zone" aria-label="Sessão de foco">
    <div className="timer-top">
     <span className="session-label">{session.running?modes[session.mode]:'Seu ritmo'}</span>
     <div className="session-count" aria-label={cycleProgress+' de '+prefs.longEvery+' sessões concluídas antes da pausa longa'}>
      <span className="cycle-dots" aria-hidden="true">{Array.from({length:prefs.longEvery},(_,i)=><i key={i} className={i<cycleProgress?'complete':''}/>)}</span>
      <span>{cycleProgress} de {prefs.longEvery} sessões</span>
     </div>
    </div>
    <div className="mode-tabs ambient-controls" role="group" aria-label="Tipo de sessão">{(['focus','short','long'] as Mode[]).map(mode=><button aria-pressed={session.mode===mode} key={mode} className={'mode '+(session.mode===mode?'selected':'')} onClick={()=>pick(mode)}>{mode==='focus'?<Focus size={15}/>:<Coffee size={15}/>} {modes[mode]}</button>)}</div>
    <div className="timer-body">
     <h1 className="session-title" aria-live="polite">{sessionTitle}</h1>
     {prefs.showTime?<div className="timer-time" aria-label="Tempo restante" aria-live="off">{pad(Math.floor(session.remaining/60))}<span className="timer-colon">:</span>{pad(session.remaining%60)}</div>:null}
     <div className="timer-caption">{session.running?(session.mode==='focus'?'Uma coisa de cada vez. O tempo fica por aqui.':'Afaste os olhos da tela. Aproveite a pausa.'):paused?'Continue quando estiver pronto.':session.mode==='focus'?prefs.focus+' minutos para o que importa agora.':prefs[session.mode]+' minutos para renovar a atenção.'}</div>
    </div>
    <div className="progress-track" role="progressbar" aria-label="Progresso da sessão" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.max(0,Math.min(100,progress*100)))}><div style={{width:Math.max(0,Math.min(100,progress*100))+'%'}}/></div>
    <button className="time-visibility" aria-pressed={prefs.showTime} onClick={()=>setPrefs(p=>({...p,showTime:!p.showTime}))}>{prefs.showTime?<EyeOff size={16}/>:<Eye size={16}/>} {prefs.showTime?'Ocultar tempo':'Mostrar tempo'}</button>
    <div className="timer-controls">
     <button className="control secondary ambient-controls" onClick={reset} title="Reiniciar sessão" aria-label="Reiniciar sessão"><RotateCcw size={19}/></button>
     <button className="control primary" onClick={session.running?pause:start}>{session.running?<><Pause size={20} fill="currentColor"/> Pausar</>:<><Play size={20} fill="currentColor"/> {paused?'Retomar':session.mode==='focus'?'Iniciar foco':'Iniciar pausa'}</>}</button>
     <button className="control secondary ambient-controls" onClick={skip} title="Pular para a próxima sessão" aria-label="Pular para a próxima sessão"><SkipForward size={20}/></button>
    </div>
    {message?<div className="notice" role="status"><Check size={16}/>{message}</div>:null}
   </section>
  </main>
  <footer className="footer"><span><span className="shortkey">◉</span> Respire. Concentre-se. Progrida.</span><span>Feito para momentos de foco <span className="heart">✦</span></span></footer>
  {settings&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSettings(false)}}><div className="modal" role="dialog" aria-modal="true" aria-label="Configurações"><div className="modal-heading"><div><div className="eyebrow">PERSONALIZE SUA EXPERIÊNCIA</div><h2>Configurações</h2></div><button className="icon-button" aria-label="Fechar" onClick={()=>setSettings(false)}><X size={20}/></button></div><p className="modal-section-label">ESTILO</p><div className="appearance-options" role="radiogroup" aria-label="Estilo visual"><button type="button" role="radio" aria-checked={prefs.appearance==='night'} className={'appearance-option '+(prefs.appearance==='night'?'selected':'')} onClick={()=>setPrefs(p=>({...p,appearance:'night'}))}><span className="appearance-swatch night-swatch"/>Noite original</button><button type="button" role="radio" aria-checked={prefs.appearance==='apple'} className={'appearance-option '+(prefs.appearance==='apple'?'selected':'')} onClick={()=>setPrefs(p=>({...p,appearance:'apple'}))}><span className="appearance-swatch apple-swatch"/>Apple minimalista</button></div><p className="modal-section-label">DURAÇÃO DAS SESSÕES</p><div className="inputs">{(['focus','short','long'] as const).map(field=><label key={field}><span>{modes[field]}</span><div className="number-input"><input type="number" min="1" max="180" value={prefs[field]} onChange={e=>changeDuration(field,Number(e.target.value))}/><small>min</small></div></label>)}</div><p className="modal-section-label">PREFERÊNCIAS</p><label className="toggle-row"><span><Volume2 size={17}/> Aviso sonoro ao concluir</span><input type="checkbox" checked={prefs.sound} onChange={e=>setPrefs(p=>({...p,sound:e.target.checked}))}/></label><label className="toggle-row"><span><Clock3 size={17}/> Exibir segundos no relógio</span><input type="checkbox" checked={prefs.seconds} onChange={e=>setPrefs(p=>({...p,seconds:e.target.checked}))}/></label><label className="toggle-row"><span><Smartphone size={17}/> Manter a tela ativa durante sessões*</span><input type="checkbox" checked={prefs.keepAwake} onChange={e=>setPrefs(p=>({...p,keepAwake:e.target.checked}))}/></label><p className="fineprint">* Depende do suporte do navegador e pode consumir mais bateria. Os tempos ficam salvos apenas neste dispositivo.</p><button className="done" onClick={()=>setSettings(false)}><Check size={17}/> Concluído</button></div></div>}
 </div>
}

createRoot(document.getElementById('root')!).render(<App/>);
