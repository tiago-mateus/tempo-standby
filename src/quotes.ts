// Short excerpts checked against the official Brazilian Portuguese edition.
// Keep the wording and source together when adding a quotation.
export const workQuotes = [
  { text: 'faz o que deves e está no que fazes.', point: 815, excerpt: true },
  { text: 'A perseverança nas pequenas coisas, por Amor, é heroísmo.', point: 813, excerpt: true },
  { text: 'Põe um motivo sobrenatural na tua atividade profissional de cada dia, e terás santificado o trabalho.', point: 359, excerpt: false },
  { text: 'Persevera no cumprimento exato das obrigações de agora.', point: 825, excerpt: true },
  { text: 'A santidade “grande” está em cumprir os “deveres pequenos” de cada instante.', point: 817, excerpt: false },
  { text: 'Já paraste a considerar a enorme soma que podem vir a dar “muitos poucos”?', point: 827, excerpt: false },
].map(quote => ({ ...quote, source: 'https://escriva.org/pt-br/camino/' + quote.point + '/' }));
