import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Expand, Shrink, Settings2, Play, Pause } from 'lucide-react';
import { workQuotes } from './quotes';
import { Progress, isAmbientProgress, isInlineProgress } from './Progress';
import { Settings } from './Settings';
import { SessionSchedule } from './SessionSchedule';
import type { Mode, Prefs } from './types';
import './style.css';

type Session = {mode:Mode; endAt:number|null; remaining:number; running:boolean; completed:number; started:boolean; startedAt?:number|null; quoteIndex:number|null; duration?:number};
const defaults: Prefs = {focus:25, short:5, long:15, longEvery:4, sound:true, seconds:false, keepAwake:true, showTime:false, appearance:'night', progressStyle:'line'};
const secondsFor = (mode:Mode,p:Prefs) => p[mode]*60;
const read = <T,>(key:string,fallback:T):T => {try{const value=localStorage.getItem(key);return value?{...fallback,...JSON.parse(value)}:fallback}catch{return fallback}};
const pad=(n:number)=>String(n).padStart(2,'0');
const cx=(...values:(string|false|null|undefined)[])=>values.filter(Boolean).join(' ');
const iconButtonClass='grid size-11 shrink-0 place-items-center rounded-xl text-muted hover:bg-surface hover:text-foreground';
const primaryButtonClass='flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-accent-ink hover:brightness-110 compact:min-h-11';
function notifyDone(){try{const Ctx=window.AudioContext || (window as any).webkitAudioContext;if(!Ctx)return;const ctx=new Ctx();[0,.2,.4].forEach((delay)=>{const o=ctx.createOscillator();const g=ctx.createGain();o.type='sine';o.frequency.value=880;g.gain.setValueAtTime(.0001,ctx.currentTime+delay);g.gain.exponentialRampToValueAtTime(.08,ctx.currentTime+delay+.02);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+delay+.16);o.connect(g);g.connect(ctx.destination);o.start(ctx.currentTime+delay);o.stop(ctx.currentTime+delay+.17)});setTimeout(()=>ctx.close(),1200)}catch{}}
function App(){
 const [prefs,setPrefs]=useState<Prefs>(()=>read('tempo-prefs',defaults));
 const [session,setSession]=useState<Session>(()=>{const s=read<Session>('tempo-session',{mode:'focus',endAt:null,remaining:25*60,running:false,completed:0,started:false,startedAt:null,quoteIndex:null,duration:undefined});return {...s,started:s.started||s.running||s.remaining<secondsFor(s.mode,prefs),remaining:s.running&&s.endAt?Math.max(0,Math.ceil((s.endAt-Date.now())/1000)):s.remaining}});
 const quoteCursor=useRef(read('tempo-quote',{index:-1}).index);
 const [now,setNow]=useState(new Date());const [settings,setSettings]=useState(false);const [full,setFull]=useState(false);const [message,setMessage]=useState('');
 const wakeRef=useRef<any>(null);const lastDoneRef=useRef<number|null>(null);
 useEffect(()=>{localStorage.setItem('tempo-prefs',JSON.stringify(prefs))},[prefs]);
 useEffect(()=>{document.querySelector('meta[name="theme-color"]')?.setAttribute('content',prefs.appearance==='apple'?'#f5f5f7':'#090b10')},[prefs.appearance]);
 useEffect(()=>{localStorage.setItem('tempo-session',JSON.stringify(session))},[session]);
 useEffect(()=>{const id=window.setInterval(()=>{setNow(new Date());setSession(s=>{if(!s.running||!s.endAt)return s;const left=Math.max(0,Math.ceil((s.endAt-Date.now())/1000));if(left>0)return s.remaining===left?s:{...s,remaining:left};if(lastDoneRef.current===s.endAt)return {...s,remaining:0,running:false,endAt:null};lastDoneRef.current=s.endAt;const count=s.completed+(s.mode==='focus'?1:0);const next:Mode=s.mode==='focus'?(count%prefs.longEvery===0?'long':'short'):'focus';if(prefs.sound)notifyDone();setMessage(s.mode==='focus'?'Foco concluído! Hora de descansar.':'Pausa concluída! Hora de focar.');return {mode:next,remaining:secondsFor(next,prefs),endAt:null,running:false,completed:count,started:false,startedAt:null,quoteIndex:null,duration:undefined}})},250);return()=>clearInterval(id)},[prefs]);
 useEffect(()=>{const check=()=>setFull(Boolean(document.fullscreenElement));document.addEventListener('fullscreenchange',check);return()=>document.removeEventListener('fullscreenchange',check)},[]);
 useEffect(()=>{let active=true;async function acquire(){if(!prefs.keepAwake||!session.running||!('wakeLock'in navigator)){if(wakeRef.current){try{await wakeRef.current.release()}catch{}wakeRef.current=null}return}try{if(!wakeRef.current&&document.visibilityState==='visible'){const lock=await (navigator as any).wakeLock.request('screen');if(active)wakeRef.current=lock;else await lock.release()}}catch{}}acquire();const visible=()=>{if(document.visibilityState==='visible'){wakeRef.current=null;acquire()}};document.addEventListener('visibilitychange',visible);return()=>{active=false;document.removeEventListener('visibilitychange',visible);if(wakeRef.current){wakeRef.current.release().catch(()=>{});wakeRef.current=null}}},[prefs.keepAwake,session.running]);
 const start=()=>{
  setMessage('');
  const timestamp=Date.now();
  const fresh=!session.started;
  const index=fresh?(quoteCursor.current+1)%workQuotes.length:session.quoteIndex;
  if(fresh){quoteCursor.current=index!;try{localStorage.setItem('tempo-quote',JSON.stringify({index}))}catch{}}
  setSession(s=>({...s,started:true,startedAt:fresh?timestamp:s.startedAt,running:true,endAt:timestamp+s.remaining*1000,quoteIndex:index,duration:fresh?s.remaining:s.duration}));
 };
 const pause=()=>setSession(s=>({...s,running:false,endAt:null,remaining:s.endAt?Math.max(0,Math.ceil((s.endAt-Date.now())/1000)):s.remaining}));
 const reset=()=>{setMessage('');setSession(s=>({...s,running:false,endAt:null,started:false,startedAt:null,quoteIndex:null,duration:undefined,remaining:secondsFor(s.mode,prefs)}))};
 const pick=(mode:Mode)=>{setMessage('');setSession(s=>({...s,mode,running:false,endAt:null,started:false,startedAt:null,quoteIndex:null,duration:undefined,remaining:secondsFor(mode,prefs)}))};
 const skip=()=>{setMessage('');setSession(s=>{const mode:Mode=s.mode==='focus'?'short':'focus';return {...s,mode,running:false,endAt:null,started:false,startedAt:null,quoteIndex:null,duration:undefined,remaining:secondsFor(mode,prefs)}})};
 const toggleFull=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{setMessage('Tela cheia indisponível neste navegador.')}};
 const updateDurations=(values:Partial<Pick<Prefs,'focus'|'short'|'long'>>)=>{
  const next={...prefs,...values};
  setPrefs(p=>({...p,...values}));
  setSession(s=>s.started?{...s,duration:s.duration??secondsFor(s.mode,prefs)}:{...s,remaining:secondsFor(s.mode,next),duration:undefined});
 };
 const time=now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',...(prefs.seconds?{second:'2-digit'}:{})});
 const date=now.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
 const modes:Record<Mode,string>={focus:'Foco',short:'Pausa curta',long:'Pausa longa'};
 const cycleProgress=session.completed>0&&session.completed%prefs.longEvery===0&&session.mode!=='focus'?prefs.longEvery:session.completed%prefs.longEvery;
 const paused=!session.running&&session.started;
 const sessionTitle=paused?'Em pausa':session.running?(session.mode==='focus'?'Em foco':'Hora de descansar'):(session.mode==='focus'?'Pronto para focar?':modes[session.mode]);
 const active=session.running||paused;
 const elapsed=Math.max(0,(session.duration??secondsFor(session.mode,prefs))-session.remaining);
 const displayedQuoteIndex=session.quoteIndex===null?null:(session.quoteIndex+Math.floor(elapsed/300))%workQuotes.length;
 const quote=displayedQuoteIndex===null?null:workQuotes[displayedQuoteIndex];
 useEffect(()=>{
  if(displayedQuoteIndex===null)return;
  quoteCursor.current=displayedQuoteIndex;
  try{localStorage.setItem('tempo-quote',JSON.stringify({index:displayedQuoteIndex}))}catch{}
 },[displayedQuoteIndex]);
 const progress=Math.max(0,Math.min(100,(1-session.remaining/(session.duration??secondsFor(session.mode,prefs)))*100));
 return <div
  data-theme={prefs.appearance==='apple'?'light':'dark'}
  data-mode={session.mode}
  data-active={active}
  data-show-time={prefs.showTime}
  className="group/app relative isolate flex min-h-dvh flex-col bg-canvas font-sans text-foreground pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]"
 >
  {isAmbientProgress(prefs.progressStyle)?<Progress value={progress} variant={prefs.progressStyle} className="absolute inset-0 z-0"/>:null}
  <header className="relative z-10 flex h-16 shrink-0 items-center justify-between gap-3 px-6 md:px-10 wide:h-13 wide:px-4 compact:h-12">
   <span className="font-display text-lg font-medium tracking-tight text-muted">tempo.</span>
   <div className="flex items-center gap-1">
    <button className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm text-muted hover:bg-surface hover:text-foreground" aria-label="Configurações" onClick={()=>setSettings(true)}><Settings2 size={18}/><span>Configurações</span></button>
    <button className={iconButtonClass} title="Tela cheia" aria-label="Tela cheia" onClick={toggleFull}>{full?<Shrink size={18}/>:<Expand size={18}/>}</button>
   </div>
  </header>

  <main className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-10 px-6 py-8 md:grid-cols-2 md:gap-16 md:px-10 group-data-[active=true]/app:max-w-4xl group-data-[active=true]/app:grid-cols-1 wide:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] wide:gap-10 wide:px-6 wide:py-3 compact:gap-6 compact:py-1.5">
   <section data-slot="standby-clock" className="min-w-0 text-center group-data-[active=true]/app:hidden" aria-label="Relógio">
    <div className={cx('whitespace-nowrap font-display leading-none font-medium tracking-[-0.04em] tabular-nums',prefs.seconds?'text-[clamp(48px,10vw,130px)] wide:text-[clamp(52px,9.4vw,104px)]':'text-[clamp(80px,14vw,160px)] wide:text-[clamp(72px,13vw,144px)]')} aria-label={'Hora atual '+time}>{time}</div>
    <p className="mt-4 text-sm text-balance text-muted wide:mt-3 wide:text-[13px]">{date}</p>
   </section>

   <section data-slot="pomodoro" className="mx-auto grid w-full min-w-0 max-w-2xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-5 text-center wide:gap-y-3 compact:gap-y-1.5" aria-label="Sessão de foco">
    <div data-slot="session-display" className="relative isolate col-span-full flex min-h-36 w-full flex-col items-center justify-center gap-3 group-data-[active=true]/app:min-h-44 wide:gap-2 wide:min-h-24 group-data-[active=true]/app:wide:min-h-28 compact:min-h-20 group-data-[active=true]/app:compact:min-h-20 compact:gap-1">
     {prefs.progressStyle==='halo'?<Progress value={progress} variant="halo" className="absolute -inset-x-2 -inset-y-1 -z-10"/>:null}
     <h1 className={cx('font-display leading-[1.1] font-medium tracking-[-0.035em] text-balance',prefs.showTime&&active?'text-xl text-muted compact:text-base':'text-3xl group-data-[active=true]/app:text-[clamp(48px,7vw,76px)] group-data-[active=true]/app:wide:text-[clamp(40px,7vw,68px)] group-data-[active=true]/app:compact:text-[40px]')} aria-live="polite">{active?sessionTitle:modes[session.mode]}</h1>
     {prefs.showTime?<div data-slot="countdown" className="font-display text-[clamp(64px,8vw,96px)] leading-none font-medium tracking-[-0.04em] tabular-nums group-data-[active=true]/app:text-[clamp(80px,12vw,144px)] wide:text-[clamp(44px,6vw,64px)] group-data-[active=true]/app:wide:text-[clamp(64px,11vw,112px)] compact:text-[40px] group-data-[active=true]/app:compact:text-[56px]" aria-label="Tempo restante" aria-live="off">{pad(Math.floor(session.remaining/60))}:{pad(session.remaining%60)}</div>:!active?<p className="text-sm text-muted">{prefs[session.mode]} minutos</p>:null}
     {active?<SessionSchedule startedAt={session.startedAt} endAt={session.endAt} running={session.running}/>:null}
     {message?<p className="text-xs text-balance text-muted" role="status">{message}</p>:null}
    </div>
    {isInlineProgress(prefs.progressStyle)?<div className="col-span-full mx-auto w-full max-w-lg">
     <Progress value={progress} variant={prefs.progressStyle}/>
    </div>:null}
    {active&&quote?<figure data-slot="session-quote" className="contents" aria-live="polite">
     <blockquote className="col-span-full mx-auto w-full max-w-lg text-sm leading-relaxed text-balance text-muted compact:text-xs compact:leading-snug">“{quote.text}”</blockquote>
     <figcaption className="justify-self-start text-left text-xs leading-relaxed text-muted compact:text-[11px]">
      <a href={quote.source} target="_blank" rel="noopener noreferrer" className="flex min-h-11 flex-col justify-center rounded-sm px-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><span>São Josemaria Escrivá</span><span className="underline decoration-line underline-offset-4">Caminho, {quote.point}{quote.excerpt?' · trecho':''}</span></a>
     </figcaption>
    </figure>:null}
    <button className={cx(active?'flex min-h-12 min-w-28 items-center justify-center gap-2 rounded-xl px-4 text-sm text-muted hover:bg-surface hover:text-foreground compact:min-h-11':primaryButtonClass,active&&quote?'justify-self-end':'col-span-full justify-self-center')} onClick={session.running?pause:start}>{session.running?<><Pause size={17}/> Pausar</>:<><Play size={17}/> {paused?'Retomar':session.mode==='focus'?'Iniciar foco':'Iniciar pausa'}</>}</button>
   </section>
  </main>

  {settings&&<Settings prefs={prefs} mode={session.mode} running={session.running} started={session.started} cycleProgress={cycleProgress} onClose={()=>setSettings(false)} onPreferencesChange={patch=>setPrefs(p=>({...p,...patch}))} onDurationsChange={updateDurations} onModeChange={pick} onReset={reset} onSkip={skip}/>}

 </div>
}

createRoot(document.getElementById('root')!).render(<App/>);
