Atualize e expanda a página Dashboard existente do Sistema de Gestão de Ambientes, mantendo completamente o design atual, a identidade visual, a paleta de cores, os componentes, espaçamentos e a estrutura já existente. Não recrie o sistema e não remova funcionalidades existentes.

O objetivo é melhorar a área de análise de utilização dos ambientes, adicionando uma nova visualização mensal e novos gráficos de indicadores.

1. Seção de Reservas — Alternância Semanal e Mensal

Na seção onde atualmente são exibidas as Reservas Semanais, mantenha a visualização semanal existente, porém adicione um controle de alternância para permitir ao usuário escolher entre:

Semanal
Mensal

Utilize um componente visual moderno, como abas ou um segmented control.

Visualização Semanal

Ao selecionar Semanal, manter a visualização atual das reservas e do gráfico semanal exatamente como já funciona.

Não remover nem substituir os dados existentes.

Visualização Mensal

Ao selecionar Mensal, exibir um mapa/calendário mensal de ocupação das salas.

O mapa deve permitir visualizar claramente:

os dias do mês;
quais salas foram utilizadas;
os horários das reservas;
períodos disponíveis;
períodos ocupados;
quantidade de reservas por dia.

A visualização deve funcionar como um calendário ou mapa de ocupação, onde seja possível identificar rapidamente os horários em que cada ambiente foi utilizado.

Exemplo de estrutura:

Horário	01	02	03	04	05	...
08:00	Sala A	Livre	Lab. Info	Livre	Sala A	
10:00	Livre	Sala B	Sala B	Livre	Lab. Info	
14:00	Auditório	Livre	Livre	Sala A	Sala B	

A visualização deve ser clara, compacta e fácil de analisar.

Adicionar também um seletor de mês, permitindo navegar entre meses anteriores e próximos.

Exemplo:

‹ Agosto 2026 ›

Ao passar o mouse ou clicar em uma reserva, exibir informações detalhadas, como:

Nome da sala;
Bloco/localização;
Horário de início e término;
Quantidade de pessoas;
Responsável pela reserva;
Status da reserva.

Utilizar os dados reais ou simulados já existentes no sistema para preencher essas informações.

2. Nova seção: Análise de Utilização dos Ambientes

Adicionar uma nova área abaixo ou ao lado da seção principal chamada:

Análise de Utilização

Essa seção deve conter gráficos e indicadores para facilitar a análise do uso das salas.

Gráfico 1 — Salas mais utilizadas

Criar um gráfico de barras horizontais mostrando quais salas possuem maior número de reservas.

Exemplo:

Lab. de Informática — 42 reservas
Sala Multimídia — 35 reservas
Auditório Central — 28 reservas
Sala de Reuniões — 21 reservas
Sala de Estudos — 17 reservas

Permitir ordenar por:

Número de reservas;
Horas de utilização;
Número de pessoas atendidas.
Gráfico 2 — Média de alunos/pessoas por sala

Criar um gráfico comparando a média de participantes por ambiente.

Exemplo:

Auditório Central — média de 120 pessoas;
Lab. de Informática — média de 32 pessoas;
Sala Multimídia — média de 28 pessoas;
Sala de Reuniões — média de 10 pessoas.

Comparar também, quando possível:

Média de ocupação × Capacidade total da sala

Exemplo:

Lab. de Informática
Média: 32 pessoas
Capacidade: 45
Taxa de ocupação: 71%

Isso pode ser representado através de barras de progresso, gráficos de barras ou indicadores circulares.

Gráfico 3 — Horários de maior utilização

Criar um gráfico mostrando quais horários possuem maior concentração de reservas.

Exemplo:

08:00–10:00
10:00–12:00
14:00–16:00
16:00–18:00
18:00–22:00

Mostrar claramente os horários de pico.

Gráfico 4 — Taxa de ocupação dos ambientes

Criar um gráfico mostrando o percentual de utilização de cada sala considerando:

Horas reservadas ÷ Horas disponíveis

Exemplo:

Lab. de Informática — 82%
Sala Multimídia — 74%
Auditório Central — 68%
Sala de Reuniões — 55%
Sala de Estudos — 41%

Destacar visualmente ambientes:

muito utilizados;
com utilização equilibrada;
pouco utilizados.
3. Cards de indicadores adicionais

Adicionar cards de resumo no dashboard, mantendo o mesmo estilo dos cards atuais.

Adicionar indicadores como:

Taxa geral de ocupação

Exemplo:

68%
dos ambientes utilizados no período.

Sala mais utilizada

Exemplo:

Lab. de Informática
42 reservas no período.

Horário de pico

Exemplo:

14h às 16h
Maior concentração de reservas.

Média de participantes

Exemplo:

38 pessoas
por reserva.

Total de horas reservadas

Exemplo:

286 horas
no período selecionado.

4. Filtros globais

Adicionar filtros para permitir analisar os dados do dashboard.

Os filtros devem incluir:

Período
Semana atual;
Mês atual;
Últimos 3 meses;
Personalizado.
Sala/Ambiente
Todas;
Laboratórios;
Salas de aula;
Auditórios;
Salas de reunião.
Bloco

Os gráficos e indicadores devem ser atualizados de acordo com os filtros selecionados.

5. Design e comportamento

Manter o dashboard visualmente organizado e sem excesso de informações.

A nova estrutura deve seguir uma hierarquia semelhante:

Dashboard

→ Cards principais de resumo

→ Reservas

Alternância: Semanal | Mensal
Visualização correspondente

→ Análise de Utilização

Salas mais utilizadas
Média de participantes e taxa de ocupação
Horários de maior utilização
Indicadores adicionais

Utilizar gráficos modernos, responsivos e coerentes com o design existente.

Manter a identidade visual atual do sistema, incluindo a paleta baseada em tons de carmim, verde e teal, além do fundo claro e tipografia Inter.

Os novos gráficos devem utilizar os dados das reservas já existentes no sistema, considerando informações como sala, data, horário de início e fim e quantidade de pessoas.

Importante: não remover a visualização semanal existente. Apenas adicionar a possibilidade de alternar entre a análise semanal e a nova visualização mensal, além de expandir o dashboard com os novos indicadores e gráficos.