const clockTime = (timestamp: number) => new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

function endLabel(timestamp: number, startedAt?: number | null) {
  if (!startedAt) return clockTime(timestamp);
  const start = new Date(startedAt), end = new Date(timestamp);
  const days = Math.round((Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / 86_400_000);
  return clockTime(timestamp) + (days > 0 ? ' (+' + days + (days === 1 ? ' dia)' : ' dias)') : '');
}

export function SessionSchedule({ startedAt, endAt, running }: { startedAt?: number | null; endAt: number | null; running: boolean }) {
  return <p data-slot="session-schedule" aria-label="Horários da sessão" className="flex flex-wrap items-center justify-center gap-x-2 text-xs leading-normal text-muted tabular-nums wide:leading-tight compact:text-[11px]">
    {startedAt ? <><span>Início <time dateTime={new Date(startedAt).toISOString()}>{clockTime(startedAt)}</time></span><span aria-hidden="true">·</span></> : null}
    <span>Término {running && endAt ? <time dateTime={new Date(endAt).toISOString()}>{endLabel(endAt, startedAt)}</time> : <span>ao retomar</span>}</span>
  </p>;
}
