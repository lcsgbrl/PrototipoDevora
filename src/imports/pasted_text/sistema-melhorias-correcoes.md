Faça as seguintes melhorias e correções no sistema atual, **sem recriar o projeto do zero, sem alterar desnecessariamente o layout existente e mantendo a identidade visual, componentes, navegação e funcionalidades que já estão funcionando**.

## 1. Melhorar filtros do mapa mensal de salas

Na tela de **Mapa Mensal de Salas**, adicione filtros de visualização que permitam ao usuário encontrar rapidamente as reservas desejadas.

Adicionar filtros para:

* **Núcleo**
* **Sala/Ambiente**
* **Status da reserva**: Disponível, Reservada, Pendente, Cancelada
* **Tipo de ambiente**, caso essa informação já exista no sistema
* **Período/horário**, permitindo visualizar apenas determinados horários
* Manter a navegação entre os meses já existente.

Os filtros devem funcionar de forma combinada. Por exemplo, o usuário pode selecionar:
**Núcleo = Engenharia + Sala = Laboratório 01 + Status = Reservada**.

Adicionar também uma opção **"Limpar filtros"**.

O mapa deve atualizar os resultados imediatamente após a aplicação dos filtros, mantendo o visual limpo e organizado.

---

## 2. Corrigir o mapa de salas para permitir múltiplas salas no mesmo horário

Corrija o funcionamento do **Mapa de Salas**.

Atualmente, quando existem reservas no mesmo horário, o sistema não representa corretamente múltiplas salas simultaneamente. Isso deve ser corrigido.

O mapa deve representar cada **sala/ambiente de forma independente**.

Exemplo:

| Horário       | Sala 01    | Sala 02    | Sala 03       | Sala 04       |
| ------------- | ---------- | ---------- | ------------- | ------------- |
| 08:00 - 10:00 | Engenharia | Disponível | Administração | Disponível    |
| 10:00 - 12:00 | Disponível | Engenharia | Engenharia    | Administração |
| 14:00 - 16:00 | Engenharia | Disponível | Disponível    | Engenharia    |

Se duas ou mais salas estiverem reservadas no mesmo horário, **todas devem aparecer simultaneamente no mapa**.

Não substituir uma reserva por outra e não agrupar reservas de salas diferentes como se fossem uma única reserva.

A estrutura deve funcionar tanto para:

* várias salas reservadas no mesmo horário;
* uma mesma sala com reservas em horários diferentes;
* diferentes núcleos utilizando salas diferentes simultaneamente.

Manter a diferenciação visual dos status das reservas já utilizada pelo sistema.

---

## 3. Adicionar tabela de horários disponíveis durante a reserva de sala

Na tela/modal de **Reservar Sala/Ambiente**, adicione uma seção de **"Horários disponíveis"**.

Essa seção deve aparecer durante o processo de reserva e facilitar a escolha do horário.

Criar uma tabela semelhante a:

| Horário       | Sala    | Status     | Ação         |
| ------------- | ------- | ---------- | ------------ |
| 08:00 - 09:00 | Sala 01 | Disponível | Selecionar   |
| 08:00 - 09:00 | Sala 02 | Ocupada    | Indisponível |
| 09:00 - 10:00 | Sala 01 | Disponível | Selecionar   |
| 09:00 - 10:00 | Sala 02 | Disponível | Selecionar   |

A tabela deve considerar as reservas já existentes no sistema.

Regras:

* Horários ocupados devem aparecer claramente como **Ocupados/Indisponíveis**.
* Horários livres devem permitir seleção.
* O usuário não pode selecionar um horário que já esteja reservado.
* Ao selecionar um horário, destacar visualmente a opção escolhida.
* Se possível, permitir filtrar rapidamente por sala.
* A disponibilidade deve ser atualizada de acordo com a **data selecionada**.
* Evitar que o usuário precise tentar reservar para descobrir que o horário está ocupado.

Manter o fluxo de reserva atual e apenas melhorar a etapa de seleção de data, sala e horário.

---

# 4. Corrigir regras de acesso por Núcleo

Essa é uma alteração importante de **permissão e escopo de dados**.

Cada usuário deve possuir um **Núcleo** associado ao seu perfil.

Exemplos de núcleos:

* Engenharia
* Administração
* Computação
* Direito
* etc.

O sistema deve utilizar o núcleo do usuário para determinar quais turmas, solicitações e informações ele pode visualizar e com quais pode interagir.

## Coordenador

Um coordenador deve estar associado a um núcleo específico.

Exemplo:

**Coordenador → Núcleo Engenharia**

Esse coordenador deve:

* receber solicitações apenas de usuários/turmas do **Núcleo Engenharia**;
* visualizar apenas solicitações relacionadas ao Núcleo Engenharia;
* gerenciar/acompanhar as reservas e solicitações do próprio núcleo;
* não receber solicitações de outros núcleos.

Exemplo:

Se um aluno de Engenharia solicitar uma sala:
→ solicitação aparece para o Coordenador de Engenharia.

Se um aluno de Direito solicitar uma sala:
→ essa solicitação **não deve aparecer** para o Coordenador de Engenharia.

Essa regra deve ser aplicada automaticamente com base no núcleo associado ao usuário.

---

## Professor

Professores também devem estar vinculados a um núcleo.

Um professor do Núcleo Engenharia deve:

* visualizar apenas informações/turmas relacionadas ao Núcleo Engenharia;
* interagir apenas com turmas e solicitações do próprio núcleo;
* solicitar reservas dentro das permissões do próprio núcleo;
* não visualizar ou gerenciar dados de outros núcleos quando isso não for permitido.

---

## Aluno

Alunos também devem possuir um núcleo associado.

Um aluno do Núcleo Engenharia deve:

* visualizar apenas turmas e informações relacionadas ao seu núcleo;
* solicitar ambientes de acordo com as regras do Núcleo Engenharia;
* interagir apenas com recursos permitidos ao seu núcleo;
* não visualizar turmas, solicitações ou informações restritas de outros núcleos.

---

# 5. Exceção: Administrador (ADM)

O perfil **ADM NÃO deve seguir essa restrição de núcleo**.

O administrador possui acesso global ao sistema.

O ADM deve poder:

* visualizar todos os núcleos;
* visualizar usuários de todos os núcleos;
* visualizar turmas de todos os núcleos;
* visualizar solicitações e reservas de todos os núcleos;
* editar o núcleo associado a qualquer usuário;
* alterar o núcleo de alunos;
* alterar o núcleo de professores;
* alterar o núcleo de coordenadores;
* cadastrar novos núcleos, caso essa funcionalidade já exista;
* administrar globalmente os dados do sistema.

Adicionar/garantir no gerenciamento de usuários um campo:

**Núcleo**
[Selecionar núcleo]

Exemplo:

**Usuário:** João Silva
**Perfil:** Professor
**Núcleo:** Engenharia

O ADM pode alterar:

**Núcleo:** [Engenharia ▼]

para outro núcleo.

Após a alteração, as permissões e visualizações desse usuário devem ser atualizadas automaticamente de acordo com o novo núcleo.

---

# 6. Regra geral de autorização

Implementar a seguinte lógica:

**ADM**
→ acesso global
→ pode visualizar e editar todos os núcleos
→ pode alterar o núcleo dos usuários.

**Coordenador**
→ acesso restrito ao próprio núcleo
→ recebe e gerencia solicitações apenas do próprio núcleo.

**Professor**
→ acesso restrito ao próprio núcleo
→ visualiza/interage apenas com informações permitidas do próprio núcleo.

**Aluno**
→ acesso restrito ao próprio núcleo
→ visualiza/interage/solicita apenas dentro do próprio núcleo.

A restrição deve ser aplicada **não apenas visualmente**, mas também na lógica das ações. Não adianta apenas esconder informações de outro núcleo; o usuário também não deve conseguir interagir com dados fora do seu escopo.

---

# 7. Consistência entre as telas

As regras de núcleo devem ser aplicadas de forma consistente em todas as áreas relevantes do sistema, principalmente:

* Dashboard
* Mapa de Salas
* Mapa Mensal
* Reservas
* Solicitações
* Turmas
* Usuários
* Professores
* Coordenadores
* Alunos

Não criar telas duplicadas para cada núcleo. Utilizar o núcleo associado ao usuário logado para determinar dinamicamente os dados exibidos.

---

# 8. Dados de demonstração

Atualize os dados mockados existentes para demonstrar claramente as regras.

Criar exemplos de usuários de diferentes núcleos, como:

* ADM — acesso global
* Coordenador de Engenharia
* Coordenador de Computação
* Professor de Engenharia
* Professor de Computação
* Aluno de Engenharia
* Aluno de Computação

Criar também reservas e solicitações de diferentes núcleos para permitir testar se o isolamento está funcionando corretamente.

## Critérios de validação

Verifique obrigatoriamente estes cenários:

1. Coordenador de Engenharia **não recebe** solicitação de Computação.
2. Coordenador de Engenharia **recebe** solicitação de Engenharia.
3. Professor de Engenharia não consegue interagir com dados restritos de Computação.
4. Aluno de Engenharia não visualiza turmas restritas de Computação.
5. ADM consegue visualizar Engenharia e Computação.
6. ADM consegue alterar o núcleo de um usuário.
7. Após alterar o núcleo de um usuário, suas permissões acompanham o novo núcleo.
8. Duas ou mais salas podem estar reservadas no mesmo horário sem que uma reserva sobrescreva a outra.
9. O mapa mensal consegue mostrar várias salas simultaneamente no mesmo horário.
10. Os filtros do mapa mensal funcionam combinados.
11. A tela de reserva mostra claramente os horários disponíveis e ocupados.
12. Um usuário não consegue reservar um horário que já esteja ocupado.

**Importante:** preserve o design atual do sistema e faça as alterações integradas às telas e componentes existentes. Priorize consistência visual, clareza das informações e funcionamento correto das regras de permissão.
