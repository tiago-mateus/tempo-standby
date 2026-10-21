import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Clock3, Expand, Shrink, Settings2, Play, Pause, RotateCcw, SkipForward, Volume2, Eye, X, Check, Coffee, Focus, Smartphone } from 'lucide-react';
import { workQuotes } from './quotes';
import './style.css';

type Mode = 'focus' | 'short' | 'long';
type Prefs = {focus:number; short:number; long:number; longEvery:number; sound:boolean; seconds:boolean; keepAwake:boolean; showTime:boolean; appearance:'night'|'apple'};
type Session = {mode:Mode; endAt:number|null; remaining:number; running:boolean; completed:number; started:boolean; quoteIndex:number|null; duration?:number};
const defaults: Prefs = {focus:25, short:5, long:15, longEvery:4, sound:true, seconds:false, keepAwake:true, showTime:false, appearance:'night'};
const secondsFor = (mode:Mode,p:Prefs) => p[mode]*60;
const read = <T,>(key:string,fallback:T):T => {try{const value=localStorage.getItem(key);return value?{...fallback,...JSON.parse(value)}:fallback}catch{return fallback}};
const pad=(n:number)=>String(n).padStart(2,'0');
const cx=(...values:(string|false|null|undefined)[])=>values.filter(Boolean).join(' ');
const iconButtonClass='grid size-11 shrink-0 place-items-center rounded-xl text-muted hover:bg-surface hover:text-foreground';
const quietClass='transition-opacity duration-300 motion-reduce:transition-none group-data-[quiet=true]/app:pointer-events-none group-data-[quiet=true]/app:opacity-0 focus-within:pointer-events-auto focus-within:opacity-100 focus:pointer-events-auto focus:opacity-100';
const primaryButtonClass='flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-accent-ink hover:brightness-110 compact:min-h-11';
const sectionLabelClass='mb-3 text-xs font-semibold tracking-wide text-muted';
function notifyDone(){try{const Ctx=window.AudioContext || (window as any).webkitAudioContext;if(!Ctx)return;const ctx=new Ctx();[0,.2,.4].forEach((delay)=>{const o=ctx.createOscillator();const g=ctx.createGain();o.type='sine';o.frequency.value=880;g.gain.setValueAtTime(.0001,ctx.currentTime+delay);g.gain.exponentialRampToValueAtTime(.08,ctx.currentTime+delay+.02);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+delay+.16);o.connect(g);g.connect(ctx.destination);o.start(ctx.currentTime+delay);o.stop(ctx.currentTime+delay+.17)});setTimeout(()=>ctx.close(),1200)}catch{}}
function App(){
 const [prefs,setPrefs]=useState<Prefs>(()=>read('tempo-prefs',defaults));
 const [session,setSession]=useState<Session>(()=>{const s=read<Session>('tempo-session',{mode:'focus',endAt:null,remaining:25*60,running:false,completed:0,started:false,quoteIndex:null,duration:undefined});return {...s,started:s.started||s.running||s.remaining<secondsFor(s.mode,prefs),remaining:s.running&&s.endAt?Math.max(0,Math.ceil((s.endAt-Date.now())/1000)):s.remaining}});
 const quoteCursor=useRef(read('tempo-quote',{index:-1}).index);
 const [now,setNow]=useState(new Date());const [settings,setSettings]=useState(false);const [full,setFull]=useState(false);const [message,setMessage]=useState('');
 const wakeRef=useRef<any>(null);const lastDoneRef=useRef<number|null>(null);
 const modalRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(!settings)return;
  const previous=document.activeElement as HTMLElement|null;
  const dialog=modalRef.current;
  const getItems=()=>Array.from(dialog?.querySelectorAll<HTMLElement>('button, input')??[]);
  getItems()[0]?.focus();
  const keydown=(event:KeyboardEvent)=>{
   if(event.key==='Escape')setSettings(false);
   if(event.key==='Tab'){
    const items=getItems(),first=items[0],last=items[items.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
   }
  };
  document.addEventListener('keydown',keydown);
  return()=>{document.removeEventListener('keydown',keydown);previous?.focus()};
 },[settings]);
 const [controlsVisible,setControlsVisible]=useState(true);
 const idleRef=useRef<number|undefined>(undefined);
 const revealControls=()=>{setControlsVisible(true);window.clearTimeout(idleRef.current);if(session.running)idleRef.current=window.setTimeout(()=>setControlsVisible(false),3500)};
 useEffect(()=>{revealControls();return()=>window.clearTimeout(idleRef.current)},[session.running]);
 useEffect(()=>{localStorage.setItem('tempo-prefs',JSON.stringify(prefs))},[prefs]);
 useEffect(()=>{document.querySelector('meta[name="theme-color"]')?.setAttribute('content',prefs.appearance==='apple'?'#f5f5f7':'#090b10')},[prefs.appearance]);
 useEffect(()=>{localStorage.setItem('tempo-session',JSON.stringify(session))},[session]);
 useEffect(()=>{const id=window.setInterval(()=>{setNow(new Date());setSession(s=>{if(!s.running||!s.endAt)return s;const left=Math.max(0,Math.ceil((s.endAt-Date.now())/1000));if(left>0)return s.remaining===left?s:{...s,remaining:left};if(lastDoneRef.current===s.endAt)return {...s,remaining:0,running:false,endAt:null};lastDoneRef.current=s.endAt;const count=s.completed+(s.mode==='focus'?1:0);const next:Mode=s.mode==='focus'?(count%prefs.longEvery===0?'long':'short'):'focus';if(prefs.sound)notifyDone();setMessage(s.mode==='focus'?'Foco concluído! Hora de descansar.':'Pausa concluída! Hora de focar.');return {mode:next,remaining:secondsFor(next,prefs),endAt:null,running:false,completed:count,started:false,quoteIndex:null,duration:undefined}})},250);return()=>clearInterval(id)},[prefs]);
 useEffect(()=>{const check=()=>setFull(Boolean(document.fullscreenElement));document.addEventListener('fullscreenchange',check);return()=>document.removeEventListener('fullscreenchange',check)},[]);
 useEffect(()=>{let active=true;async function acquire(){if(!prefs.keepAwake||!session.running||!('wakeLock'in navigator)){if(wakeRef.current){try{await wakeRef.current.release()}catch{}wakeRef.current=null}return}try{if(!wakeRef.current&&document.visibilityState==='visible'){const lock=await (navigator as any).wakeLock.request('screen');if(active)wakeRef.current=lock;else await lock.release()}}catch{}}acquire();const visible=()=>{if(document.visibilityState==='visible'){wakeRef.current=null;acquire()}};document.addEventListener('visibilitychange',visible);return()=>{active=false;document.removeEventListener('visibilitychange',visible);if(wakeRef.current){wakeRef.current.release().catch(()=>{});wakeRef.current=null}}},[prefs.keepAwake,session.running]);
 const start=()=>{
  setMessage('');
  const fresh=!session.started;
  const index=fresh?(quoteCursor.current+1)%workQuotes.length:session.quoteIndex;
  if(fresh){quoteCursor.current=index!;try{localStorage.setItem('tempo-quote',JSON.stringify({index}))}catch{}}
  setSession(s=>({...s,started:true,running:true,endAt:Date.now()+s.remaining*1000,quoteIndex:index,duration:fresh?s.remaining:s.duration}));
 };
 const pause=()=>setSession(s=>({...s,running:false,endAt:null,remaining:s.endAt?Math.max(0,Math.ceil((s.endAt-Date.now())/1000)):s.remaining}));
 const reset=()=>{setMessage('');setSession(s=>({...s,running:false,endAt:null,started:false,quoteIndex:null,duration:undefined,remaining:secondsFor(s.mode,prefs)}))};
 const pick=(mode:Mode)=>{setMessage('');setSession(s=>({...s,mode,running:false,endAt:null,started:false,quoteIndex:null,duration:undefined,remaining:secondsFor(mode,prefs)}))};
 const skip=()=>{setMessage('');setSession(s=>{const mode:Mode=s.mode==='focus'?'short':'focus';return {...s,mode,running:false,endAt:null,started:false,quoteIndex:null,duration:undefined,remaining:secondsFor(mode,prefs)}})};
 const toggleFull=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{setMessage('Tela cheia indisponível neste navegador.')}};
 const changeDuration=(field:'focus'|'short'|'long',val:number)=>{const clamped=Math.min(180,Math.max(1,val||1));setPrefs(p=>({...p,[field]:clamped}));setSession(s=>s.mode===field&&!s.running?{...s,remaining:clamped*60,duration:clamped*60}:s)};
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
  data-quiet={session.running&&!controlsVisible}
  data-show-time={prefs.showTime}
  className="group/app flex min-h-dvh flex-col bg-canvas font-sans text-foreground pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]"
  onPointerMove={revealControls} onPointerDown={revealControls} onKeyDownCapture={revealControls}
 >
  <header className={cx('flex h-16 shrink-0 items-center justify-between gap-3 px-6 md:px-10 wide:h-13 wide:px-4 compact:h-12',quietClass)}>
   <span className="font-display text-lg font-medium tracking-tight text-muted">tempo.</span>
   <div className="flex items-center gap-1">
    <button className={iconButtonClass} title="Configurações" aria-label="Configurações" onClick={()=>setSettings(true)}><Settings2 size={18}/></button>
    <button className={iconButtonClass} title="Tela cheia" aria-label="Tela cheia" onClick={toggleFull}>{full?<Shrink size={18}/>:<Expand size={18}/>}</button>
   </div>
  </header>

  <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-10 px-6 py-8 md:grid-cols-2 md:gap-16 md:px-10 group-data-[active=true]/app:max-w-4xl group-data-[active=true]/app:grid-cols-1 wide:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] wide:gap-10 wide:px-6 wide:py-3 compact:gap-6 compact:py-1.5">
   <section data-slot="standby-clock" className="min-w-0 text-center group-data-[active=true]/app:hidden" aria-label="Relógio">
    <div className={cx('whitespace-nowrap font-display leading-none font-medium tracking-[-0.04em] tabular-nums',prefs.seconds?'text-[clamp(48px,10vw,130px)] wide:text-[clamp(52px,9.4vw,104px)]':'text-[clamp(80px,14vw,160px)] wide:text-[clamp(72px,13vw,144px)]')} aria-label={'Hora atual '+time}>{time}</div>
    <p className="mt-4 text-sm text-balance text-muted wide:mt-3 wide:text-[13px]">{date}</p>
   </section>

   <section data-slot="pomodoro" className="mx-auto grid w-full min-w-0 max-w-2xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-5 text-center wide:gap-y-3 compact:gap-y-2" aria-label="Sessão de foco">
    <div data-slot="session-display" className="col-span-full flex min-h-36 w-full flex-col items-center justify-center gap-3 group-data-[active=true]/app:min-h-44 wide:min-h-24 group-data-[active=true]/app:wide:min-h-28 compact:min-h-20 group-data-[active=true]/app:compact:min-h-20 compact:gap-1">
     <h1 className={cx('font-display leading-[1.1] font-medium tracking-[-0.035em] text-balance',prefs.showTime&&active?'text-xl text-muted compact:text-base':'text-3xl group-data-[active=true]/app:text-[clamp(48px,7vw,76px)] group-data-[active=true]/app:wide:text-[clamp(40px,7vw,68px)] group-data-[active=true]/app:compact:text-[40px]')} aria-live="polite">{active?sessionTitle:modes[session.mode]}</h1>
     {prefs.showTime?<div data-slot="countdown" className="font-display text-[clamp(64px,8vw,96px)] leading-none font-medium tracking-[-0.04em] tabular-nums group-data-[active=true]/app:text-[clamp(80px,12vw,144px)] wide:text-[clamp(44px,6vw,64px)] group-data-[active=true]/app:wide:text-[clamp(64px,11vw,112px)] compact:text-[40px] group-data-[active=true]/app:compact:text-[64px]" aria-label="Tempo restante" aria-live="off">{pad(Math.floor(session.remaining/60))}:{pad(session.remaining%60)}</div>:!active?<p className="text-sm text-muted">{prefs[session.mode]} minutos</p>:null}
     {message?<p className="text-xs text-balance text-muted" role="status">{message}</p>:null}
    </div>
    <div className="col-span-full mx-auto h-0.5 w-full max-w-lg overflow-hidden rounded-full bg-line/60" role="progressbar" aria-label="Progresso da sessão" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
     <div className="h-full rounded-full bg-accent transition-[width] duration-300 ease-linear motion-reduce:transition-none" style={{width:progress+'%'}}/>
    </div>
    {active&&quote?<figure data-slot="session-quote" className="contents" aria-live="polite">
     <blockquote className="col-span-full mx-auto w-full max-w-lg text-sm leading-relaxed text-balance text-muted compact:text-xs">“{quote.text}”</blockquote>
     <figcaption className="justify-self-start text-left text-xs leading-relaxed text-muted compact:text-[11px]">
      <a href={quote.source} target="_blank" rel="noopener noreferrer" className="flex min-h-11 flex-col justify-center rounded-sm px-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><span>São Josemaria Escrivá</span><span className="underline decoration-line underline-offset-4">Caminho, {quote.point}{quote.excerpt?' · trecho':''}</span></a>
     </figcaption>
    </figure>:null}
    <button className={cx(active?'flex min-h-12 min-w-28 items-center justify-center gap-2 rounded-xl px-4 text-sm text-muted hover:bg-surface hover:text-foreground compact:min-h-11':primaryButtonClass,active&&quote?'justify-self-end':'col-span-full justify-self-center')} onClick={session.running?pause:start}>{session.running?<><Pause size={17}/> Pausar</>:<><Play size={17}/> {paused?'Retomar':session.mode==='focus'?'Iniciar foco':'Iniciar pausa'}</>}</button>
   </section>
  </main>

  {settings&&<div className="fixed inset-0 z-20 flex items-center justify-center bg-black/65 pt-[max(12px,env(safe-area-inset-top))] pr-[max(16px,env(safe-area-inset-right))] pb-[max(12px,env(safe-area-inset-bottom))] pl-[max(16px,env(safe-area-inset-left))] backdrop-blur-sm" onMouseDown={e=>{if(e.target===e.currentTarget)setSettings(false)}}>
   <div ref={modalRef} className="max-h-[calc(100dvh-max(12px,env(safe-area-inset-top))-max(12px,env(safe-area-inset-bottom)))] w-full max-w-lg overflow-y-auto overscroll-contain rounded-3xl border border-line bg-surface px-6 pb-6 shadow-2xl wide:max-w-xl wide:px-5 wide:pb-5" role="dialog" aria-modal="true" aria-labelledby="settings-title">
    <div className="sticky top-0 z-10 mb-5 flex items-center justify-between gap-3 bg-surface py-5">
     <h2 id="settings-title" className="font-display text-2xl font-medium tracking-tight">Configurações</h2>
     <button className={iconButtonClass} aria-label="Fechar" onClick={()=>setSettings(false)}><X size={20}/></button>
    </div>
    <p className={sectionLabelClass}>Sessão</p>
    <div className="mb-3 flex gap-1 rounded-xl bg-canvas p-1" role="group" aria-label="Tipo de sessão">
     {(['focus','short','long'] as Mode[]).map(mode=><button key={mode} aria-pressed={session.mode===mode} className={cx('flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg px-1 text-xs',session.mode===mode?'bg-accent-soft text-accent':'text-muted hover:bg-raised')} onClick={()=>{pick(mode);setSettings(false)}}>{mode==='focus'?<Focus size={14}/>:<Coffee size={14}/>} {modes[mode]}</button>)}
    </div>
    <div className="mb-2 flex flex-wrap gap-2">
     <button className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-xs text-muted hover:bg-raised" onClick={()=>{reset();setSettings(false)}}><RotateCcw size={15}/>Reiniciar sessão</button>
     <button className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-xs text-muted hover:bg-raised" onClick={()=>{skip();setSettings(false)}}><SkipForward size={15}/>Pular sessão</button>
    </div>
    <p className="mb-6 text-xs text-muted">{cycleProgress} de {prefs.longEvery} sessões até a pausa longa.</p>
    <p className={sectionLabelClass}>Estilo</p>
    <div className="mb-6 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2" role="radiogroup" aria-label="Estilo visual">
     {([{value:'night',label:'Noite original'},{value:'apple',label:'Apple minimalista'}] as const).map(option=><button key={option.value} type="button" role="radio" aria-checked={prefs.appearance===option.value} className={cx('flex min-h-12 items-center gap-3 rounded-xl border px-3 text-left text-xs font-semibold',prefs.appearance===option.value?'border-accent bg-accent-soft text-accent':'border-line text-muted hover:bg-raised')} onClick={()=>setPrefs(p=>({...p,appearance:option.value}))}><span className={cx('size-5 shrink-0 rounded-full border border-line',option.value==='night'?'bg-[#090b10]':'bg-[#f5f5f7]')}/>{option.label}{prefs.appearance===option.value?<Check size={15} className="ml-auto"/>:null}</button>)}
    </div>
    <p className={sectionLabelClass}>Duração das sessões</p>
    <div className="mb-6 grid grid-cols-3 gap-3">
     {(['focus','short','long'] as const).map(field=><label key={field} className="min-w-0 text-xs text-muted"><span>{modes[field]}</span><span className="mt-2 flex min-h-11 items-center gap-1 rounded-xl border border-line bg-canvas px-3"><input className="w-full min-w-0 bg-transparent py-3 text-base text-foreground accent-accent" type="number" min="1" max="180" value={prefs[field]} onChange={e=>changeDuration(field,Number(e.target.value))}/><span className="text-[11px]">min</span></span></label>)}
    </div>
    <p className={sectionLabelClass}>Preferências</p>
    {[
     {key:'showTime' as const,label:'Exibir tempo restante na sessão',icon:Eye},
     {key:'sound' as const,label:'Aviso sonoro ao concluir',icon:Volume2},
     {key:'seconds' as const,label:'Exibir segundos no relógio',icon:Clock3},
     {key:'keepAwake' as const,label:'Manter a tela ativa durante sessões*',icon:Smartphone},
    ].map(({key,label,icon:Icon})=><label key={key} className="flex min-h-14 cursor-pointer items-center justify-between gap-4 border-b border-line py-3 text-xs"><span className="flex items-center gap-2"><Icon size={17} className="shrink-0"/>{label}</span><span className="grid size-11 shrink-0 place-items-center"><input className="size-5 cursor-pointer accent-accent" type="checkbox" checked={prefs[key]} onChange={e=>setPrefs(p=>({...p,[key]:e.target.checked}))}/></span></label>)}
    <p className="mt-4 text-xs leading-relaxed text-muted">* Depende do suporte do navegador e pode consumir mais bateria. Os tempos ficam salvos apenas neste dispositivo.</p>
    <button className={cx(primaryButtonClass,'mt-5 w-full')} onClick={()=>setSettings(false)}><Check size={17}/>Concluído</button>
   </div>
  </div>}
 </div>
}

createRoot(document.getElementById('root')!).render(<App/>);
