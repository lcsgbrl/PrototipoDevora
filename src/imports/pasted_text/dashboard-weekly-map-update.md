Faça **SOMENTE** as alterações descritas neste prompt no sistema atual.

## ⚠️ REGRA ABSOLUTA — NÃO ALTERAR OS DASHBOARDS

**NÃO altere nenhuma outra parte dos Dashboards de nenhum perfil.**

Não modificar:

* Cards;
* Indicadores;
* Gráficos;
* Textos;
* Botões;
* Menus;
* Atalhos;
* Layout;
* Espaçamentos;
* Cores;
* Componentes;
* Ordem dos elementos;
* Informações exibidas;
* Estrutura das páginas.

**A ÚNICA alteração permitida nos Dashboards é a correção do componente que atualmente mostra o Mapa Semanal de Reservas.**

Não redesenhe o Dashboard.

Não crie um novo Dashboard.

Não reorganize o Dashboard.

Não substitua o conteúdo existente.

Apenas altere o **Mapa Semanal de Reservas**.

---

# 1. Alterar SOMENTE o Mapa Semanal dos Dashboards

Nos Dashboards de:

* ADM;
* Coordenador;
* Professor;
* Aluno;

localize o componente existente de **Mapa Semanal de Reservas**.

**Altere somente esse componente.**

O restante de cada Dashboard deve permanecer exatamente como está.

---

# 2. Fazer o Mapa Semanal ficar igual ao Mapa Mensal

O Mapa Semanal deve utilizar **o mesmo padrão visual, estrutura, organização e comportamento do Mapa Mensal já existente no sistema**.

Não criar um design novo para o mapa semanal.

O objetivo é que o usuário reconheça imediatamente que o Mapa Semanal e o Mapa Mensal fazem parte da mesma funcionalidade.

Reutilize, sempre que possível, os mesmos:

* componentes;
* estilos;
* organização visual;
* indicadores de reservas;
* identificação das salas;
* cores/status;
* filtros;
* informações exibidas;
* lógica de visualização.

A única diferença principal deve ser o **período de visualização**.

---

# 3. O Mapa Semanal deve mostrar SOMENTE a semana atual

O Mapa Semanal do Dashboard deve mostrar exclusivamente a **semana em que a data atual está inserida**.

A semana deve ser calculada automaticamente com base na **data atual do sistema**.

Por exemplo, se a data atual estiver entre:

**07/09/2026 e 13/09/2026**

o mapa deve mostrar somente:

**Semana: 07/09/2026 — 13/09/2026**

Quando a data mudar para uma nova semana, o mapa deve automaticamente mudar para a nova semana.

### Importante

Não deixar uma semana fixa no código.

Não deixar a semana de exemplo permanentemente exibida.

O período deve ser **dinâmico**.

---

# 4. Atualização automática conforme a data

O sistema deve calcular:

**Data atual → semana correspondente → reservas daquela semana**

Exemplo:

Se hoje for:

**10/09/2026**

mostrar:

**07/09/2026 — 13/09/2026**

Quando chegar:

**14/09/2026**

o mapa deve automaticamente mostrar:

**14/09/2026 — 20/09/2026**

E assim sucessivamente.

Não é necessário que o usuário altere manualmente a semana para acompanhar a passagem do tempo.

---

# 5. Mostrar os dias da semana

O mapa deve apresentar os dias pertencentes à semana atual.

Exemplo:

| Horário | Seg 07 | Ter 08 | Qua 09 | Qui 10 | Sex 11 | Sáb 12 | Dom 13 |
| ------- | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| 07:00   |        |        |        |        |        |        |        |
| 08:00   |        |        |        |        |        |        |        |
| 09:00   |        |        |        |        |        |        |        |
| 10:00   |        |        |        |        |        |        |        |

Utilize o mesmo padrão visual do Mapa Mensal existente.

---

# 6. Mostrar múltiplas salas simultaneamente

O Mapa Semanal deve manter a regra de que **várias salas podem possuir reservas no mesmo horário**.

Exemplo:

**Segunda-feira — 08:00**

* Sala 01 → Reservada
* Sala 02 → Reservada
* Sala 03 → Reservada
* Sala 04 → Disponível

Todas devem aparecer simultaneamente.

Uma reserva de uma sala nunca pode substituir, esconder ou sobrescrever uma reserva de outra sala.

Essa regra deve funcionar para todos os dias da semana.

---

# 7. Respeitar as permissões existentes

Não alterar as regras de acesso já implementadas.

O mapa deve apenas utilizar as permissões que o sistema já possui.

### ADM

Visualização global.

### Coordenador

Visualização conforme seu Núcleo.

### Professor

Visualização conforme seu Núcleo e as relações com suas disciplinas/turmas.

### Aluno

Visualização conforme seu Núcleo e as disciplinas/turmas às quais possui acesso.

**Não alterar essas regras.**

---

# 8. Não alterar o Mapa Mensal

O **Mapa Mensal existente deve permanecer como está**.

Não redesenhar.

Não modificar.

Não remover funcionalidades.

Use-o somente como referência visual e estrutural para corrigir o Mapa Semanal.

---

# 9. Núcleos novos devem aparecer em perfis existentes

Além da alteração do Mapa Semanal, faça uma segunda alteração independente:

Todos os **Núcleos criados pelos administradores** devem aparecer automaticamente também na **edição de usuários que já existem no sistema**.

Exemplo:

Usuário existente:

**João Paulo**

* Cargo: Professor
* Núcleo: Saúde

O ADM cria posteriormente:

**Núcleo: Tecnologia**

Ao acessar:

**Editar usuário → Núcleo**

a opção:

**Tecnologia**

deve estar disponível.

O usuário não precisa ser recriado para que o novo Núcleo apareça.

---

# 10. Atualização dinâmica de todos os campos de Núcleo

Qualquer novo Núcleo criado pelo ADM deve aparecer automaticamente em **TODAS as funcionalidades que exibem ou utilizam Núcleos**.

Isso inclui, mas não se limita a:

* Cadastro de novos usuários;
* Edição de usuários existentes;
* Perfil de usuários;
* Gerenciamento de usuários;
* Filtros;
* Reservas;
* Mapa Semanal;
* Mapa Mensal;
* Solicitações;
* Turmas;
* Cursos;
* Matérias;
* Dashboards;
* Formulários;
* Modais;
* Seletores/dropdowns;
* Relatórios, caso existam.

Não criar listas separadas e fixas de Núcleos.

Todas essas funcionalidades devem utilizar os **Núcleos atualmente cadastrados no sistema**.

---

# 11. Novos Cursos, Turmas e Matérias

Aplicar a mesma regra para:

* Cursos;
* Turmas;
* Matérias/Disciplinas.

Quando um Coordenador ou ADM criar um novo:

**Curso**

ele deve aparecer automaticamente nas funcionalidades que utilizam Cursos.

Quando criar:

**Turma**

ela deve aparecer automaticamente nas funcionalidades relacionadas ao Curso correspondente.

Quando criar:

**Matéria/Disciplina**

ela deve aparecer automaticamente nas funcionalidades relacionadas ao Curso/Turma correspondente.

---

# 12. Não utilizar dados fixos

Verifique o sistema e elimine qualquer dependência de listas fixas quando já existir um cadastro correspondente.

Por exemplo, se atualmente existir algo semelhante a:

**Núcleos:**

* Saúde
* Engenharia
* Computação

essa lista não deve continuar fixa se o sistema permite que o ADM crie novos Núcleos.

Se o ADM adicionar:

**Tecnologia**

o sistema deve automaticamente passar a reconhecer:

* Saúde;
* Engenharia;
* Computação;
* Tecnologia.

---

# 13. Preservar dados existentes

Ao adicionar novos Núcleos, Cursos, Turmas ou Matérias:

* não apagar registros existentes;
* não substituir registros antigos;
* não quebrar vínculos;
* não alterar usuários existentes sem ação do ADM;
* não modificar permissões existentes.

Apenas tornar os novos registros disponíveis onde forem aplicáveis.

---

# 14. TESTE FINAL OBRIGATÓRIO

Depois de implementar, verificar:

### Dashboard

Para cada perfil:

**ADM → Dashboard**
→ somente o Mapa Semanal foi alterado.

**Coordenador → Dashboard**
→ somente o Mapa Semanal foi alterado.

**Professor → Dashboard**
→ somente o Mapa Semanal foi alterado.

**Aluno → Dashboard**
→ somente o Mapa Semanal foi alterado.

Todo o restante deve permanecer exatamente como estava.

### Mapa Semanal

Verificar:

* visual semelhante ao Mapa Mensal;
* mostra somente a semana atual;
* semana calculada pela data atual;
* mudança automática quando a semana mudar;
* dias corretos;
* reservas corretas;
* múltiplas salas no mesmo horário;
* permissões preservadas.

### Núcleos

Criar um novo Núcleo como ADM.

Depois verificar:

* Cadastro de novo usuário;
* Edição de usuário existente;
* Filtros;
* Reservas;
* Mapas;
* Turmas;
* Cursos;
* Matérias;
* Solicitações;
* demais campos relacionados.

O novo Núcleo deve aparecer automaticamente onde for aplicável.

---

# REGRA FINAL

**FAÇA SOMENTE DUAS COISAS:**

### 1.

Corrigir o **Mapa Semanal de Reservas existente nos Dashboards**, fazendo-o visualmente igual ao Mapa Mensal e limitando-o dinamicamente à semana atual.

### 2.

Garantir que **novos Núcleos, Cursos, Turmas e Matérias sejam automaticamente disponibilizados em todas as funções correspondentes**, incluindo a edição de perfis de usuários já existentes.

**NÃO ALTERE MAIS NADA NOS DASHBOARDS.**

Se uma alteração não estiver diretamente relacionada a esses dois objetivos, **não faça essa alteração**.
