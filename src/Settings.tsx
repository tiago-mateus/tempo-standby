import { useEffect, useRef, useState } from 'react';
import { Check, Coffee, Focus, Minus, Plus, RotateCcw, SkipForward, X } from 'lucide-react';
import { ProgressPreview, progressStyles, type ProgressStyle } from './Progress';
import type { Mode, Prefs } from './types';

const tabs = [
  { id: 'visual', label: 'Visual' },
  { id: 'times', label: 'Tempos' },
  { id: 'session', label: 'Sessão' },
] as const;
type Tab = typeof tabs[number]['id'];
type Durations = Pick<Prefs, 'focus' | 'short' | 'long'>;
const modes: Record<Mode, string> = { focus: 'Foco', short: 'Pausa curta', long: 'Pausa longa' };
const buttonClass = 'flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm text-foreground hover:bg-raised';
const headingClass = 'mb-3 text-sm font-semibold text-foreground';
const optionClass = 'flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line px-3 text-sm text-muted hover:bg-raised peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent';

function DurationControl({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  const inputId = 'duration-' + label.toLowerCase().replace(/\s+/g, '-');
  useEffect(() => setDraft(String(value)), [value]);
  const commit = (next: number) => {
    const clamped = Math.max(1, Math.min(180, Math.round(Number.isFinite(next) ? next : value)));
    setDraft(String(clamped));
    onChange(clamped);
  };
  return <div>
    <label htmlFor={inputId} className="mb-2 block text-sm text-muted">{label}</label>
    <div className="flex items-center gap-1 rounded-xl border border-line bg-canvas p-1">
      <button type="button" aria-label={'Diminuir ' + label.toLowerCase()} disabled={value <= 1} className="grid size-11 shrink-0 place-items-center rounded-lg text-muted hover:bg-raised disabled:cursor-default disabled:opacity-30" onClick={() => commit((Number(draft) || value) - 1)}><Minus size={17}/></button>
      <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
        <input id={inputId} type="number" inputMode="numeric" min="1" max="180" value={draft} onChange={event => setDraft(event.target.value)} onBlur={() => draft.trim() ? commit(Number(draft)) : setDraft(String(value))} onKeyDown={event => { if (event.key === 'Enter' || event.key === 'Escape') event.currentTarget.blur(); }} className="min-h-11 w-12 min-w-0 bg-transparent text-center text-base text-foreground tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"/>
        <span className="text-xs text-muted">min</span>
      </div>
      <button type="button" aria-label={'Aumentar ' + label.toLowerCase()} disabled={value >= 180} className="grid size-11 shrink-0 place-items-center rounded-lg text-muted hover:bg-raised disabled:cursor-default disabled:opacity-30" onClick={() => commit((Number(draft) || value) + 1)}><Plus size={17}/></button>
    </div>
  </div>;
}

function Toggle({ label, checked, onChange, description }: { label: string; checked: boolean; onChange: (value: boolean) => void; description?: string }) {
  return <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 border-b border-line py-3">
    <span className="min-w-0"><span className="block text-sm">{label}</span>{description ? <span className="mt-1 block text-xs leading-relaxed text-muted">{description}</span> : null}</span>
    <span className="grid min-h-11 w-12 shrink-0 place-items-center">
      <input type="checkbox" role="switch" aria-label={label} checked={checked} onChange={event => onChange(event.target.checked)} className="peer sr-only"/>
      <span aria-hidden="true" className="flex h-6 w-10 items-center rounded-full bg-line p-1 transition-colors peer-checked:bg-accent peer-checked:[&>span]:translate-x-4 peer-checked:[&>span]:bg-accent-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent motion-reduce:transition-none"><span className="size-4 rounded-full bg-foreground transition-transform motion-reduce:transition-none"/></span>
    </span>
  </label>;
}

export function Settings({ prefs, mode, running, started, cycleProgress, onClose, onPreferencesChange, onDurationsChange, onModeChange, onReset, onSkip }: {
  prefs: Prefs;
  mode: Mode;
  running: boolean;
  started: boolean;
  cycleProgress: number;
  onClose: () => void;
  onPreferencesChange: (patch: Partial<Prefs>) => void;
  onDurationsChange: (values: Partial<Durations>) => void;
  onModeChange: (mode: Mode) => void;
  onReset: () => void;
  onSkip: () => void;
}) {
  const [tab, setTab] = useState<Tab>('visual');
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const items = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled])') ?? []).filter(item => item.tabIndex >= 0 && item.getClientRects().length);
    items()[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key === 'Tab') {
        const elements = items(), first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', keydown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', keydown); document.body.style.overflow = previousOverflow; previous?.focus(); };
  }, []);

  return <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/65 p-4 pt-[max(16px,env(safe-area-inset-top))] pr-[max(16px,env(safe-area-inset-right))] pb-[max(16px,env(safe-area-inset-bottom))] pl-[max(16px,env(safe-area-inset-left))] wide:bg-canvas wide:pt-[env(safe-area-inset-top)] wide:pr-[env(safe-area-inset-right)] wide:pb-[env(safe-area-inset-bottom)] wide:pl-[env(safe-area-inset-left)]" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="settings-title" className="flex h-[min(680px,calc(100dvh-max(16px,env(safe-area-inset-top))-max(16px,env(safe-area-inset-bottom))))] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl wide:h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] wide:max-w-none wide:rounded-none wide:border-0 wide:shadow-none">
      <header className="flex min-h-20 shrink-0 items-center justify-between gap-3 border-b border-line px-5 wide:min-h-16 compact:min-h-14">
        <div><h2 id="settings-title" className="text-xl font-semibold tracking-tight">Configurações</h2><p className="mt-0.5 text-xs text-muted" role="status">Salvo automaticamente neste dispositivo</p></div>
        <button className={buttonClass} onClick={onClose}><X size={18}/><span>Fechar</span></button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col wide:flex-row">
        <div role="tablist" aria-label="Categorias das configurações" className="flex shrink-0 gap-1 border-b border-line p-2 wide:w-36 wide:flex-col wide:gap-2 wide:border-r wide:border-b-0 wide:p-3">
          {tabs.map((item, index) => <button key={item.id} role="tab" id={'settings-tab-' + item.id} aria-selected={tab === item.id} aria-controls={'settings-panel-' + item.id} tabIndex={tab === item.id ? 0 : -1} className={'min-h-11 flex-1 rounded-xl px-4 text-sm font-medium wide:flex-none wide:text-left ' + (tab === item.id ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-raised')} onClick={() => setTab(item.id)} onKeyDown={event => {
            const movement = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 0;
            if (!movement && !['Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + movement + tabs.length) % tabs.length;
            setTab(tabs[next].id);
            document.getElementById('settings-tab-' + tabs[next].id)?.focus();
          }}>{item.label}</button>)}
        </div>
        <div key={tab} id={'settings-panel-' + tab} role="tabpanel" aria-labelledby={'settings-tab-' + tab} className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-5 wide:px-6 wide:py-4 compact:py-3">
          {tab === 'visual' ? <div className="space-y-5">
            <div className="grid items-center gap-4 min-[680px]:grid-cols-2">
              <div className="min-w-0">
                <label htmlFor="progress-style" className={headingClass + ' block'}>Estilo de progresso</label>
                <select id="progress-style" value={prefs.progressStyle} onChange={event => onPreferencesChange({ progressStyle: event.target.value as ProgressStyle })} aria-describedby="progress-description" className="min-h-12 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-foreground [color-scheme:dark] group-data-[theme=light]/app:[color-scheme:light]">
                  {([{ value: 'simple', label: 'Discretos' }, { value: 'immersive', label: 'Imersivos' }] as const).map(group => <optgroup key={group.value} label={group.label}>
                    {progressStyles.filter(option => option.group === group.value).map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </optgroup>)}
                </select>
                <p id="progress-description" className="mt-2 text-xs leading-relaxed text-muted">{progressStyles.find(option => option.value === prefs.progressStyle)?.description}</p>
              </div>
              <div><ProgressPreview variant={prefs.progressStyle}/><p className="mt-1 text-center text-[11px] text-muted">Prévia do estilo</p></div>
            </div>
            <Toggle label="Mostrar tempo restante" checked={prefs.showTime} onChange={showTime => onPreferencesChange({ showTime })}/>
            <fieldset>
              <legend className={headingClass}>Aparência</legend>
              <div className="grid grid-cols-2 gap-2">
                {([{ value: 'night', label: 'Escuro' }, { value: 'apple', label: 'Claro' }] as const).map(option => <label key={option.value} className="cursor-pointer">
                  <input type="radio" name="appearance" value={option.value} checked={prefs.appearance === option.value} onChange={() => onPreferencesChange({ appearance: option.value })} className="peer sr-only"/>
                  <span className={optionClass}><span aria-hidden="true" className={'size-4 rounded-full border border-line ' + (option.value === 'night' ? 'bg-[#090b10]' : 'bg-[#f5f5f7]')}/>{option.label}{prefs.appearance === option.value ? <Check size={15}/> : null}</span>
                </label>)}
              </div>
            </fieldset>
            <Toggle label="Segundos no relógio" checked={prefs.seconds} onChange={seconds => onPreferencesChange({ seconds })}/>
          </div> : tab === 'times' ? <div className="space-y-5">
            <div><h3 className={headingClass}>Duração das sessões</h3><p className="text-xs leading-relaxed text-muted">{started ? 'Os novos tempos valem para as próximas sessões. A sessão atual continua como está.' : 'Ajuste os minutos ou escolha uma combinação.'}</p></div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Combinações de tempo">
              <button className="min-h-11 rounded-xl border border-line px-4 text-sm hover:bg-raised" onClick={() => onDurationsChange({ focus: 25, short: 5, long: 15 })}>25 min foco / 5 min pausa</button>
              <button className="min-h-11 rounded-xl border border-line px-4 text-sm hover:bg-raised" onClick={() => onDurationsChange({ focus: 50, short: 10, long: 20 })}>50 min foco / 10 min pausa</button>
            </div>
            <div className="grid gap-4 min-[680px]:grid-cols-2">
              {(['focus', 'short', 'long'] as const).map(field => <DurationControl key={field} label={modes[field]} value={prefs[field]} onChange={value => onDurationsChange({ [field]: value })}/>)}
            </div>
            <p className="text-xs text-muted">De 1 a 180 minutos por sessão.</p>
          </div> : <div className="space-y-5">
            <div><h3 className={headingClass}>Sessão atual</h3><p className="text-xs text-muted">{modes[mode]} · {running ? 'Em andamento' : started ? 'Pausada' : 'Pronta para iniciar'} · {cycleProgress} de {prefs.longEvery} focos concluídos</p></div>
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Tipo de sessão">
              {(['focus', 'short', 'long'] as Mode[]).map(item => <button key={item} aria-pressed={mode === item} className={'flex min-h-12 items-center justify-center gap-1 rounded-xl border px-1 text-xs ' + (mode === item ? 'border-accent bg-accent-soft text-accent' : 'border-line text-muted hover:bg-raised')} onClick={() => onModeChange(item)}>{item === 'focus' ? <Focus size={14}/> : <Coffee size={14}/>} {modes[item]}</button>)}
            </div>
            <p className="text-xs text-muted">Trocar o tipo prepara uma nova sessão.</p>
            <div className="flex flex-wrap gap-2"><button className={buttonClass + ' border border-line'} onClick={onReset}><RotateCcw size={16}/>Reiniciar sessão</button><button className={buttonClass + ' border border-line'} onClick={onSkip}><SkipForward size={16}/>Pular sessão</button></div>
            <Toggle label="Som ao concluir" checked={prefs.sound} onChange={sound => onPreferencesChange({ sound })}/>
            <Toggle label="Manter tela acesa" description="Durante a sessão, quando o navegador permitir. Pode consumir mais bateria." checked={prefs.keepAwake} onChange={keepAwake => onPreferencesChange({ keepAwake })}/>
          </div>}
        </div>
      </div>
    </div>
  </div>;
}
