# Tempo — Focus StandBy

Um relógio de mesa com Pomodoro, projetado principalmente para ficar apoiado no celular na horizontal. Desktop e celular na vertical também são suportados.

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
- Relógio e data no standby; durante a sessão, o Pomodoro, uma barra fina de progresso e a frase ocupam a área central.
- Cabeçalho discreto desaparece após alguns segundos durante a sessão; toque, movimento do mouse ou teclado o revelam. Pausar permanece disponível.
- Tipo de sessão, reinício, avanço, ciclos e exibição do contador ficam nas configurações, sem abas ou textos decorativos na tela principal.
- Uma frase de São Josemaria Escrivá permanece junto ao Pomodoro durante toda a sessão, com autoria e link para a fonte oficial. Fica abaixo da barra de progresso, em tamanho menor que o estado ou o contador do Pomodoro.
- As seis frases se alternam no início e a cada cinco minutos de tempo efetivo da sessão. A troca acompanha o cronômetro: pausa junto com a sessão e mantém a posição ao recarregar a página.
- Barra de progresso sem percentuais visíveis, que acompanha o tempo decorrido e para junto com a sessão.
- Ciclos até a pausa longa; sessões puladas não contam como concluídas.
- Cronômetro baseado em timestamp (mantém contagem correta após aba em segundo plano).
- Persistência de preferências e sessão em `localStorage`.
- Opção de estilo noturno original ou visual claro minimalista inspirado na Apple.
- Alternância entre tela cheia e janela.
- Screen Wake Lock API (quando suportada e sessão em andamento).
- Layout horizontal com relógio e sessão lado a lado no standby, áreas de toque de pelo menos 44 px e espaço para o recorte da tela e o indicador de início.
- Controles compactos para aproveitar a altura disponível mesmo com as barras do navegador; configurações com rolagem própria.
- Manifesto web para instalação como atalho/aplicativo.

## Interface

Estilos com Tailwind CSS 4.3.3 e o plugin oficial `@tailwindcss/vite`. Layout, responsividade e estados usam classes utilitárias nos componentes. `src/style.css` contém apenas imports, tokens de tema, variantes para horizontal e estilos básicos globais.

As citações ficam em `src/quotes.ts`, com trechos identificados e referências verificadas em [Caminho, na edição brasileira oficial](https://escriva.org/pt-br/camino/). O texto está incluído no aplicativo e não depende de uma consulta à internet a cada sessão.

## Observações

O aviso sonoro só é confiável enquanto a página está ativa e o navegador permite áudio. Navegadores móveis podem suspender abas; a contagem retoma corretamente ao voltar, mas notificações e sons durante a suspensão não são garantidos. A função de manter a tela acesa depende de HTTPS e suporte do navegador. Em modo tela cheia, a ativação também depende da permissão do navegador.
