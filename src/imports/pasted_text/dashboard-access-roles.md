Perfeito. Aqui vai um prompt para o **Figma Make implementar as regras de acesso e personalizar o Dashboard conforme o cargo do usuário**, sem remover o que já foi criado:

---

## Prompt

**Atualize o Dashboard existente do Sistema de Gestão de Ambientes para implementar controle de acesso baseado no cargo do usuário e exibir informações diferentes para Coordenadores, Administradores e Professores.**

**Não remova nenhuma funcionalidade existente. Mantenha o design, identidade visual, componentes, paleta de cores e estrutura atual do sistema.**

O sistema possui os cargos:

* Aluno
* Professor
* Coordenador
* Administrador

A página de Dashboard já possui controle de acesso por permissões e identificação do cargo do usuário. 

---

# 1. Regras de acesso ao Dashboard Analítico

A nova área avançada de análise criada anteriormente deve ficar disponível **somente para os cargos:**

### Coordenador

### Administrador

Esses usuários podem visualizar:

* Visualização de reservas **Semanal e Mensal**;
* Mapa mensal de utilização dos ambientes;
* Gráfico das salas mais utilizadas;
* Média de alunos/pessoas por sala;
* Taxa de ocupação dos ambientes;
* Horários de maior utilização;
* Total de horas reservadas;
* Taxa geral de ocupação;
* Sala mais utilizada;
* Horário de pico;
* Todos os filtros globais;
* Dados gerais de todas as salas e reservas do sistema.

O Dashboard deve calcular e exibir esses dados considerando **todas as reservas do sistema**.

As reservas já possuem dados como sala, data, horário de início e término, quantidade de pessoas, solicitante e status, portanto esses dados devem ser utilizados para alimentar os indicadores. 

---

# 2. Dashboard específico para Professor

Quando o usuário logado possuir o cargo:

### Professor

**Não exibir o Dashboard Analítico geral.**

Em vez disso, exibir um **Dashboard pessoal do professor**, contendo apenas informações relacionadas às reservas realizadas por ele.

O sistema deve filtrar os dados utilizando o usuário atualmente logado.

O título da página pode ser:

## Meu Dashboard

Subtítulo:

> Acompanhe suas reservas, utilização dos ambientes e principais indicadores.

---

# 3. Cards principais do Professor

Exibir cards com indicadores personalizados.

### Total de reservas

Mostrar:

**12 Reservas**

Texto complementar:

> Reservas realizadas no período selecionado.

---

### Sala mais utilizada

Mostrar o ambiente que o professor mais utilizou.

Exemplo:

**Lab. de Informática**

> 8 reservas realizadas.

---

### Média de participantes

Calcular a média de alunos/pessoas das reservas realizadas pelo professor.

Exemplo:

**28 alunos**

> Média de participantes por reserva.

---

### Total de horas utilizadas

Calcular o tempo total reservado pelo professor.

Exemplo:

**34h 30min**

> Tempo total de utilização dos ambientes.

---

# 4. Gráfico: Ambientes mais utilizados pelo professor

Adicionar um gráfico mostrando exclusivamente as salas utilizadas pelo professor logado.

Exemplo:

| Ambiente            | Reservas |
| ------------------- | -------: |
| Lab. de Informática |        8 |
| Sala Multimídia     |        5 |
| Sala de Estudos     |        3 |
| Auditório Central   |        1 |

O gráfico pode ser de barras.

Adicionar um seletor para analisar:

* Última semana;
* Último mês;
* Últimos 3 meses;
* Todo o período.

---

# 5. Gráfico: Média de alunos por sala

Criar um gráfico mostrando a média de participantes em cada ambiente utilizado pelo professor.

Exemplo:

**Lab. de Informática**
Média: 32 alunos

**Sala Multimídia**
Média: 26 alunos

**Sala de Estudos**
Média: 15 alunos

Também mostrar a relação entre:

**Média de participantes × Capacidade da sala**

Exemplo:

> Lab. de Informática
> 32 alunos em média
> Capacidade: 45
> Ocupação média: 71%

---

# 6. Horários mais utilizados pelo professor

Adicionar um gráfico ou card mostrando os horários em que o professor mais realiza reservas.

Exemplo:

### Horário preferido

**14:00 às 16:00**

> Horário utilizado em 42% das suas reservas.

Também criar uma distribuição por períodos:

* Manhã — 08:00 às 12:00;
* Tarde — 12:00 às 18:00;
* Noite — 18:00 às 22:00.

Mostrar a quantidade ou percentual de reservas em cada período.

---

# 7. Reservas recentes

Adicionar uma seção chamada:

## Minhas Reservas Recentes

Exibir as últimas reservas do professor em formato de lista ou tabela.

Cada reserva deve mostrar:

* Nome da sala;
* Bloco;
* Data;
* Horário;
* Quantidade de participantes;
* Status.

Exemplo:

**Lab. de Informática**
Bloco B — 102
26 Ago 2026 • 14:00–16:00
25 participantes
**Aprovada**

Adicionar um botão:

### Ver todas as reservas

Esse botão deve direcionar o usuário para a página de reservas.

---

# 8. Próxima reserva

Adicionar um card de destaque mostrando a próxima reserva do professor.

Exemplo:

## Próxima reserva

**Sala Multimídia**

📅 28 Ago 2026
🕒 10:00–12:00
👥 30 participantes

Também exibir:

> Faltam 2 dias

Caso não exista nenhuma reserva futura, mostrar:

> Você não possui reservas futuras.

---

# 9. Insights automáticos

Adicionar uma seção chamada:

## Insights sobre suas reservas

Gerar insights simples baseados nos dados reais do professor.

Exemplos:

* **Você utiliza mais o Lab. de Informática.**
* **Suas reservas acontecem principalmente no período da tarde.**
* **A média de participantes aumentou 15% em relação ao período anterior.**
* **A Sala Multimídia possui a maior taxa média de ocupação nas suas reservas.**
* **Você realizou mais reservas neste mês do que no mês anterior.**

Esses insights devem ser calculados dinamicamente de acordo com os dados disponíveis.

---

# 10. Regras para Coordenador e Administrador

Para usuários com cargo:

### Coordenador

### Administrador

Exibir o **Dashboard Analítico Completo**.

Esses usuários devem visualizar dados de todos os usuários e todas as salas.

A estrutura deve conter:

### Visão geral

* Reservas hoje;
* Ambientes disponíveis;
* Total de reservas;
* Total de horas reservadas;
* Taxa geral de ocupação.

### Análise de reservas

* Alternância **Semanal | Mensal**;
* Mapa mensal de ocupação;
* Navegação entre meses.

### Análise de utilização

* Salas mais utilizadas;
* Média de participantes por sala;
* Taxa de ocupação;
* Horários de maior utilização;
* Sala mais utilizada;
* Horário de pico.

---

# 11. Regras para Aluno

Usuários com o cargo:

### Aluno

Não devem ter acesso ao Dashboard.

Caso tentem acessar diretamente a rota `/dashboard`, manter ou utilizar a página de:

## Acesso não autorizado

Com uma mensagem informando que o perfil não possui permissão para acessar essa área.

O sistema já trabalha com uma página de acesso não autorizado baseada no cargo do usuário. 

---

# 12. Lógica de acesso

Implementar a seguinte regra:

```text
SE cargo = "Administrador"
    Exibir Dashboard Analítico Completo

SE cargo = "Coordenador"
    Exibir Dashboard Analítico Completo

SE cargo = "Professor"
    Exibir Dashboard Pessoal do Professor
    Filtrar dados apenas pelas reservas do usuário logado

SE cargo = "Aluno"
    Bloquear acesso ao Dashboard
    Redirecionar para página de acesso não autorizado
```

---

# 13. Comportamento dos dados

Todos os indicadores do Professor devem ser calculados dinamicamente utilizando apenas as reservas onde o professor logado é o solicitante/responsável pela reserva.

Os indicadores gerais de Coordenadores e Administradores devem considerar todas as reservas do sistema.

Considerar principalmente reservas aprovadas ou válidas para os cálculos de utilização, evitando que reservas recusadas ou canceladas distorçam os indicadores.

---

## Importante

**Não criar uma nova página separada para o Dashboard do Professor.**

Utilizar a mesma rota `/dashboard`, mas alterar dinamicamente o conteúdo exibido conforme o cargo do usuário logado.

Manter o Dashboard atual para Coordenadores e Administradores e criar uma experiência personalizada para Professores. Os cargos existentes no sistema já incluem Aluno, Professor, Coordenador e Administrador. 
