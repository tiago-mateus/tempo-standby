# Tempo — Focus StandBy

Um relógio de mesa com Pomodoro, otimizado para smartphone na horizontal e desktop.

## Rodar localmente

Requer Node.js 20.19+ ou 22+.

```bash
npm install
npm run dev
```

Abra a URL indicada pelo Vite.

## Deploy na Vercel

1. Publique esta pasta em um repositório GitHub.
2. Em https://vercel.com/new, importe o repositório.
3. Framework: **Vite**; Build: `npm run build`; Output: `dist`.
4. Clique em **Deploy**.

Não requer servidor, banco de dados ou variáveis de ambiente.

## Recursos

- Horário e data locais em tempo real.
- Sessões de foco e pausas curtas/longas.
- Modo imersivo com contagem oculta por padrão e opção de mostrar o tempo restante, salva neste dispositivo.
- Relógio em destaque no standby e sessão em destaque durante o foco, com cores suaves para as pausas.
- Controles secundários e textos decorativos desaparecem após alguns segundos de sessão; toque, movimento do mouse ou teclado os revelam. Pausar e mostrar o tempo permanecem disponíveis.
- Marcadores de progresso até a pausa longa; sessões puladas não contam como concluídas.
- Cronômetro baseado em timestamp (mantém contagem correta após aba em segundo plano).
- Persistência de preferências e sessão em `localStorage`.
- Opção de estilo noturno original ou visual claro minimalista inspirado na Apple.
- Alternância entre tela cheia e janela.
- Screen Wake Lock API (quando suportada e sessão em andamento).
- Layout adaptado para celulares deitados e telas de desktop.
- Manifesto web para instalação como atalho/aplicativo.

## Observações

O aviso sonoro só é confiável enquanto a página está ativa e o navegador permite áudio. Navegadores móveis podem suspender abas; a contagem retoma corretamente ao voltar, mas notificações e sons durante a suspensão não são garantidos. A função de manter a tela acesa depende de HTTPS e suporte do navegador. Em modo tela cheia, a ativação também depende da permissão do navegador.
