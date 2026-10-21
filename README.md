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
- Linha discreta com início e término previsto de cada foco ou pausa. O início permanece salvo; ao pausar, o término indica “ao retomar” e é recalculado na retomada. Sessões que atravessam a meia-noite indicam o dia seguinte.
- Modo imersivo com contagem oculta por padrão e opção de mostrar o tempo restante, salva neste dispositivo.
- Relógio e data no standby; durante a sessão, o Pomodoro, uma barra fina de progresso e a frase ocupam a área central.
- Botão “Configurações” com texto, sempre visível e acessível com um toque durante a sessão.
- Tipo de sessão, reinício, avanço, ciclos e exibição do contador ficam nas configurações, sem abas ou textos decorativos na tela principal.
- Uma frase de São Josemaria Escrivá permanece junto ao Pomodoro durante toda a sessão, com autoria e link para a fonte oficial. Fica abaixo da barra de progresso, em tamanho menor que o estado ou o contador do Pomodoro.
- As seis frases se alternam no início e a cada cinco minutos de tempo efetivo da sessão. A troca acompanha o cronômetro: pausa junto com a sessão e mantém a posição ao recarregar a página.
- Barra de progresso sem percentuais visíveis, que acompanha o tempo decorrido e para junto com a sessão.
- Oito estilos de progresso nas configurações: linha, círculo, segmentos, borda inferior, fundo que se preenche, halo do Pomodoro, ampulheta e luz de horizonte. Seletor com prévia contextual e preferência salva neste dispositivo.
- Os estilos imersivos acompanham o tempo efetivo, sem pulsos ou animações em loop. O halo envolve o Pomodoro, a borda e o preenchimento usam a tela, e a ampulheta e o horizonte ficam acima da frase. A opção de movimento reduzido do sistema é respeitada.
- Ciclos até a pausa longa; sessões puladas não contam como concluídas.
- Cronômetro baseado em timestamp (mantém contagem correta após aba em segundo plano).
- Persistência de preferências e sessão em `localStorage`.
- Opção de estilo noturno original ou visual claro minimalista inspirado na Apple.
- Alternância entre tela cheia e janela.
- Screen Wake Lock API (quando suportada e sessão em andamento).
- Layout horizontal com relógio e sessão lado a lado no standby, áreas de toque de pelo menos 44 px e espaço para o recorte da tela e o indicador de início.
- Configurações divididas em Visual, Tempos e Sessão, com navegação e botão Fechar fixos. Na horizontal, o painel ocupa a tela e as categorias ficam ao lado do conteúdo.
- Mudanças salvas automaticamente, com prévias de progresso, controles de +/− para os minutos e combinações prontas de 25/5 ou 50/10. Alterar os tempos preserva o andamento da sessão atual.
- Manifesto web para instalação como atalho/aplicativo.

## Interface

Estilos com Tailwind CSS 4.3.3 e o plugin oficial `@tailwindcss/vite`. Layout, responsividade e estados usam classes utilitárias nos componentes. `src/style.css` contém apenas imports, tokens de tema, variantes para horizontal e estilos básicos globais.

As citações ficam em `src/quotes.ts`, com trechos identificados e referências verificadas em [Caminho, na edição brasileira oficial](https://escriva.org/pt-br/camino/). O texto está incluído no aplicativo e não depende de uma consulta à internet a cada sessão.

## Observações

O aviso sonoro só é confiável enquanto a página está ativa e o navegador permite áudio. Navegadores móveis podem suspender abas; a contagem retoma corretamente ao voltar, mas notificações e sons durante a suspensão não são garantidos. A função de manter a tela acesa depende de HTTPS e suporte do navegador. Em modo tela cheia, a ativação também depende da permissão do navegador.
