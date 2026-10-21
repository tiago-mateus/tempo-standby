export type ProgressStyle = 'line' | 'circle' | 'segments' | 'edge' | 'fill' | 'halo' | 'hourglass' | 'horizon';

export const progressStyles: { value: ProgressStyle; label: string; description: string; group: 'simple' | 'immersive' }[] = [
  { value: 'line', label: 'Linha', description: 'Uma linha fina abaixo do Pomodoro.', group: 'simple' },
  { value: 'circle', label: 'Círculo', description: 'Um pequeno círculo abaixo do Pomodoro.', group: 'simple' },
  { value: 'segments', label: 'Segmentos', description: 'Pequenos trechos que se preenchem aos poucos.', group: 'simple' },
  { value: 'edge', label: 'Borda inferior', description: 'O progresso percorre a borda inferior da tela.', group: 'immersive' },
  { value: 'fill', label: 'Fundo que se preenche', description: 'Uma cor suave avança pelo fundo da tela.', group: 'immersive' },
  { value: 'halo', label: 'Halo do Pomodoro', description: 'Um arco fino envolve o Pomodoro.', group: 'immersive' },
  { value: 'hourglass', label: 'Ampulheta', description: 'Duas áreas trocam preenchimento, sem movimento contínuo.', group: 'immersive' },
  { value: 'horizon', label: 'Luz de horizonte', description: 'Uma luz suave cresce do centro para as bordas.', group: 'immersive' },
];

export const isAmbientProgress = (variant: ProgressStyle) => variant === 'edge' || variant === 'fill';
export const isInlineProgress = (variant: ProgressStyle) => !isAmbientProgress(variant) && variant !== 'halo';
const transition = 'transition-[width,transform,stroke-dashoffset] duration-300 ease-linear motion-reduce:transition-none';

export function Progress({ value, variant, preview = false, className = '' }: {
  value: number;
  variant: ProgressStyle;
  preview?: boolean;
  className?: string;
}) {
  const percent = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  const remaining = Math.sqrt(1 - percent / 100);
  return <div
    data-progress-style={variant}
    className={'pointer-events-none ' + className}
    role={preview ? undefined : 'progressbar'}
    aria-hidden={preview || undefined}
    aria-label={preview ? undefined : 'Progresso da sessão'}
    aria-valuemin={preview ? undefined : 0}
    aria-valuemax={preview ? undefined : 100}
    aria-valuenow={preview ? undefined : Math.round(percent)}
  >
    {variant === 'edge' ? <div className={'absolute inset-x-0 h-0.75 bg-line/40 ' + (preview ? 'bottom-0' : 'bottom-[env(safe-area-inset-bottom)]')} aria-hidden="true">
      <div data-fill className={'h-full origin-left bg-accent ' + transition} style={{ transform: 'scaleX(' + percent / 100 + ')' }}/>
    </div> : variant === 'fill' ? <div aria-hidden="true" data-fill className={'absolute inset-0 origin-left border-r border-accent/15 bg-accent/8 ' + transition} style={{ transform: 'scaleX(' + percent / 100 + ')' }}/>
    : variant === 'halo' ? <svg className="absolute inset-0 size-full overflow-visible" viewBox="0 0 600 220" preserveAspectRatio="none" fill="none" aria-hidden="true">
      <ellipse cx="300" cy="110" rx="294" ry="104" vectorEffect="non-scaling-stroke" stroke="currentColor" strokeWidth="1" className="text-line/40"/>
      <ellipse data-fill cx="300" cy="110" rx="294" ry="104" vectorEffect="non-scaling-stroke" pathLength="100" stroke="currentColor" strokeWidth="1.5" strokeDasharray="100" strokeDashoffset={100 - percent} className={'text-accent/70 ' + transition}/>
    </svg> : variant === 'hourglass' ? <div className="flex h-8 items-center justify-center compact:h-6">
      <svg className="h-8 w-8 compact:size-6" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M8 3H32V8L22 19V21L32 32V37H8V32L18 21V19L8 8Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" className="text-muted/70"/>
        <polygon data-sand="top" points={(20 - 11 * remaining) + ',' + (19 - 12 * remaining) + ' ' + (20 + 11 * remaining) + ',' + (19 - 12 * remaining) + ' 20,19'} className="fill-accent/50"/>
        <polygon data-sand="bottom" points={'9,33 31,33 ' + (20 + 11 * remaining) + ',' + (21 + 12 * remaining) + ' ' + (20 - 11 * remaining) + ',' + (21 + 12 * remaining)} className="fill-accent/85"/>
      </svg>
    </div> : variant === 'horizon' ? <div className="relative mx-auto h-5 w-full max-w-lg" aria-hidden="true">
      <div className="absolute inset-x-0 bottom-0 h-px bg-line/40"/>
      <div data-fill className={'absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-accent ' + transition} style={{ width: percent + '%' }}/>
      <div className={'absolute bottom-0.5 left-1/2 h-4 -translate-x-1/2 bg-linear-to-t from-accent/12 to-transparent ' + transition} style={{ width: percent + '%' }}/>
    </div> : variant === 'circle' ? <div className="flex h-8 items-center justify-center compact:h-6">
      <svg className="size-8 -rotate-90 compact:size-6" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" className="text-line/60"/>
        <circle data-fill cx="16" cy="16" r="14" pathLength="100" stroke="currentColor" strokeWidth="2" strokeDasharray="100" strokeDashoffset={100 - percent} className={'text-accent ' + transition}/>
      </svg>
    </div> : variant === 'segments' ? <div className="flex h-0.75 gap-1.5" aria-hidden="true">
      {Array.from({ length: 12 }, (_, index) => <span key={index} className="h-full min-w-0 flex-1 overflow-hidden rounded-full bg-line/60">
        <span data-fill className={'block h-full rounded-full bg-accent ' + transition} style={{ width: Math.max(0, Math.min(100, percent * 12 - index * 100)) + '%' }}/>
      </span>)}
    </div> : <div className="h-0.5 overflow-hidden rounded-full bg-line/60" aria-hidden="true">
      <div data-fill className={'h-full rounded-full bg-accent ' + transition} style={{ width: percent + '%' }}/>
    </div>}
  </div>;
}

export function ProgressPreview({ variant }: { variant: ProgressStyle }) {
  return <div aria-hidden="true" className="relative isolate flex h-28 w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-line bg-canvas px-5">
    {isAmbientProgress(variant) ? <Progress value={60} variant={variant} preview className="absolute inset-0 z-0"/> : null}
    <div className="relative z-10 flex h-14 w-full max-w-44 items-center justify-center">
      {variant === 'halo' ? <Progress value={60} variant={variant} preview className="absolute -inset-x-3 -inset-y-1"/> : null}
      <span className="relative font-display text-3xl leading-none font-medium tracking-tight text-foreground tabular-nums">25:00</span>
    </div>
    {isInlineProgress(variant) ? <Progress value={60} variant={variant} preview className="absolute inset-x-5 bottom-2 z-10"/> : null}
  </div>;
}
