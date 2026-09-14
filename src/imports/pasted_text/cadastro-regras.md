Faça as seguintes alterações no sistema atual, **sem recriar o projeto do zero e sem remover funcionalidades já existentes**. Integre as novas regras às telas, componentes e fluxos atuais.

O objetivo é garantir que os cadastros tenham **dados válidos e vinculados às informações realmente existentes no sistema**, além de permitir que administradores e coordenadores mantenham a estrutura acadêmica atualizada.

---

# 1. Remover "Departamento" do cadastro de novas contas

No formulário de criação de novas contas, **remova completamente o campo Departamento**.

O novo usuário NÃO deve precisar selecionar ou informar um departamento durante o cadastro.

Não deixar o campo escondido, desabilitado ou apenas visualmente removido: ele não deve fazer parte do formulário de cadastro.

A estrutura de cadastro deve utilizar:

* Nome
* E-mail
* CPF
* Senha
* Cargo/Perfil
* Núcleo
* Curso
* Turno
* Turma
* Matérias/Disciplinas

O campo **Núcleo** deve ser utilizado no lugar do antigo Departamento.

---

# 2. Núcleos disponíveis no cadastro devem ser dinâmicos

O cadastro de usuário deve buscar os Núcleos existentes no sistema.

Não utilizar uma lista fixa escrita diretamente no formulário.

Se o ADM criar um novo Núcleo, ele deve aparecer automaticamente na lista de Núcleos disponíveis para novos cadastros.

Exemplo:

ADM cria:

**Núcleo de Tecnologia**

A partir desse momento, o cadastro deve apresentar:

* Saúde
* Engenharia
* Computação
* Tecnologia
* etc.

Se o ADM editar o nome de um Núcleo, o novo nome deve aparecer no cadastro.

Se um Núcleo for desativado, ele não deve aparecer para novos cadastros, mas os usuários e registros antigos vinculados a ele não devem ser apagados automaticamente.

---

# 3. Núcleo deve ser selecionado antes do Curso

O formulário deve utilizar campos dependentes.

Fluxo:

**Núcleo → Curso → Turno → Turma → Matérias**

Exemplo:

Usuário seleciona:

**Núcleo: Engenharia**

O campo Curso deve apresentar somente cursos pertencentes ao Núcleo de Engenharia.

Se selecionar:

**Curso: Engenharia Civil**

O campo Turma deve apresentar somente turmas relacionadas a Engenharia Civil.

Isso deve impedir combinações inválidas.

---

# 4. Cursos criados pelos Coordenadores

Permitir que os **Coordenadores criem novos Cursos dentro do seu próprio Núcleo**.

Exemplo:

João Paulo:

**Cargo:** Coordenador
**Núcleo:** Saúde

João pode criar:

**Curso: Nutrição**

Esse curso ficará automaticamente vinculado ao:

**Núcleo da Saúde**

O coordenador não deve conseguir criar um curso pertencente a outro Núcleo.

Ao criar um curso, permitir informar:

* Nome do curso
* Código do curso, se utilizado pelo sistema
* Descrição, se aplicável
* Turnos disponíveis
* Status: Ativo/Inativo

Depois de criado, o curso deve ficar imediatamente disponível nos locais apropriados do sistema, inclusive no **cadastro de novos usuários**.

---

# 5. Coordenadores podem criar Turmas

Permitir que o Coordenador crie novas Turmas dentro dos cursos pertencentes ao seu Núcleo.

Exemplo:

**Coordenador:** João Paulo
**Núcleo:** Saúde

Curso:

**Enfermagem**

João pode criar:

**Turma: ENF-2027-01**

A turma deve receber automaticamente a relação:

**Turma → Curso → Núcleo**

Não permitir que o coordenador crie uma turma para um curso de outro Núcleo.

Ao criar uma turma, permitir definir:

* Nome/identificador da turma
* Curso
* Turno
* Período/semestre
* Ano
* Status
* Disciplinas relacionadas

---

# 6. Coordenadores podem criar Matérias/Disciplinas

Permitir que os Coordenadores criem novas Matérias/Disciplinas relacionadas aos cursos e turmas do seu Núcleo.

Exemplo:

Coordenador do Núcleo de Saúde cria:

**Anatomia Humana**

A matéria deve ficar vinculada ao Núcleo da Saúde.

Permitir informar:

* Nome da disciplina
* Código
* Curso
* Carga horária, se utilizada
* Professor responsável
* Turma(s)
* Horário(s)
* Status

O coordenador não deve conseguir criar uma disciplina diretamente em outro Núcleo.

---

# 7. Cursos, Turmas e Matérias criados devem aparecer no cadastro

Essa regra é obrigatória.

Sempre que um Coordenador criar:

**Novo Curso**

→ o curso deve aparecer automaticamente no cadastro.

Sempre que criar:

**Nova Turma**

→ a turma deve aparecer automaticamente quando o usuário selecionar o curso correspondente.

Sempre que criar:

**Nova Matéria**

→ a matéria deve aparecer nas opções correspondentes ao curso/turma selecionados.

Não utilizar listas fixas/mockadas separadas para o cadastro.

O cadastro deve consultar os mesmos dados utilizados pelo gerenciamento acadêmico.

---

# 8. Validação rigorosa do E-mail

O sistema deve impedir cadastros com e-mails inválidos.

Validar:

* formato correto de e-mail;
* presença de `@`;
* domínio válido em formato adequado;
* impedir espaços;
* impedir caracteres claramente inválidos;
* impedir e-mails vazios;
* impedir cadastro duplicado com o mesmo e-mail.

Exemplo inválido:

`joao@`

`joao.com`

`joao email@gmail.com`

Exibir mensagem clara:

**"Informe um endereço de e-mail válido."**

Também verificar se o e-mail já pertence a uma conta existente ou a uma solicitação pendente.

---

# 9. Validação rigorosa do CPF

O CPF deve possuir validação real, não apenas verificar se existem 11 caracteres.

Implementar validação do CPF utilizando os **dígitos verificadores oficiais**.

Regras:

* aceitar CPF com ou sem máscara;
* normalizar o valor antes da validação;
* verificar se possui 11 dígitos;
* verificar os dígitos verificadores;
* rejeitar sequências inválidas, como:

  * 111.111.111-11
  * 000.000.000-00
  * 123.456.789-00
* impedir CPF duplicado.

Exibir:

**"CPF inválido. Verifique os dados informados."**

O CPF deve ser validado antes de permitir o envio da solicitação de cadastro.

---

# 10. Validação de Nome

Não permitir nomes vazios ou claramente inválidos.

O nome deve:

* possuir tamanho mínimo adequado;
* aceitar nomes compostos;
* aceitar acentos;
* aceitar espaços entre nomes;
* impedir valores compostos apenas por números;
* impedir caracteres aleatórios/inválidos.

Exemplo inválido:

`123456`

`@@@@`

`A`

Exemplo válido:

`João Paulo da Silva`

---

# 11. Validação de Cargo/Perfil

O usuário não deve conseguir inventar um cargo.

O campo deve apresentar somente os perfis existentes e permitidos:

* Aluno
* Professor
* Coordenador

O perfil **ADM não deve ser escolhido livremente durante o cadastro público**.

A criação/atribuição de uma conta ADM deve ser controlada exclusivamente pelo administrador.

---

# 12. Validação de Núcleo

O usuário não deve conseguir digitar manualmente um Núcleo.

Utilizar seleção baseada nos Núcleos existentes no sistema.

Não permitir:

* Núcleo inexistente;
* Núcleo digitado manualmente;
* combinação com curso de outro núcleo;
* utilização de Núcleo desativado.

---

# 13. Validação de Curso

O usuário não deve conseguir digitar um curso manualmente.

O curso deve ser selecionado entre os cursos cadastrados.

Depois de selecionar o Núcleo:

**Núcleo → filtrar Cursos**

Exemplo:

Núcleo = Saúde

Mostrar somente:

* Enfermagem
* Fisioterapia
* Medicina

Não mostrar:

* Engenharia Civil
* Sistemas de Informação
* Direito

---

# 14. Validação de Turma

A turma deve ser obrigatoriamente relacionada ao curso selecionado.

Se:

**Curso = Enfermagem**

Mostrar somente as turmas de Enfermagem.

Não permitir selecionar uma turma pertencente a outro curso.

Também validar o turno.

Exemplo:

Se uma turma estiver cadastrada como:

**ENF-01 → Noturno**

ela não deve ser apresentada como opção para:

**Turno = Matutino**

---

# 15. Validação das Matérias

As matérias também devem ser relacionadas à estrutura acadêmica.

O sistema deve verificar:

**Núcleo → Curso → Turma → Matéria**

O usuário não pode selecionar uma matéria inexistente.

Também não pode selecionar uma matéria que não esteja relacionada à sua turma/curso.

---

# 16. Consistência entre os dados

Antes de enviar o cadastro, validar toda a cadeia:

**Usuário**
↓
**Núcleo existente**
↓
**Curso pertencente ao Núcleo**
↓
**Turno compatível**
↓
**Turma pertencente ao Curso**
↓
**Matérias pertencentes à Turma/Curso**

Se qualquer relação for inválida, impedir o envio.

Mostrar uma mensagem explicando o problema.

Exemplo:

> "A turma selecionada não pertence ao curso informado."

---

# 17. Prevenir dados duplicados

Impedir duplicidade de:

* CPF;
* E-mail;
* cursos com mesmo identificador dentro do mesmo Núcleo;
* turmas com mesmo identificador dentro do mesmo curso;
* matérias com mesmo código dentro do mesmo contexto.

Antes de criar um novo registro, verificar se ele já existe.

---

# 18. Fluxo de solicitação de cadastro

O novo usuário envia:

**Solicitação de cadastro**

O sistema valida os dados automaticamente.

Se houver erro:

**Cadastro não enviado**
→ mostrar os campos que precisam ser corrigidos.

Se os dados forem válidos:

**Cadastro enviado**
→ **Aguardando aprovação do ADM**

O usuário ainda não recebe acesso completo ao sistema.

---

# 19. Validação automática + análise do ADM

A aprovação deve possuir duas etapas:

### Etapa 1 — Validação automática

O sistema verifica:

* E-mail;
* CPF;
* campos obrigatórios;
* Núcleo existente;
* Curso existente;
* Turma existente;
* relações entre os dados;
* duplicidades.

### Etapa 2 — Análise do ADM

Mesmo que os dados passem pela validação automática, o ADM deve analisar a solicitação antes de aprovar.

O ADM pode:

**Aprovar**

**Rejeitar**

**Solicitar correção**

**Editar os dados**

---

# 20. Permissões dos Coordenadores

O Coordenador pode gerenciar somente a estrutura acadêmica do seu próprio Núcleo.

Exemplo:

**João Paulo → Núcleo Saúde**

João pode:

* criar cursos da Saúde;
* editar cursos da Saúde;
* criar turmas dos cursos da Saúde;
* editar turmas da Saúde;
* criar matérias da Saúde;
* editar matérias da Saúde;
* visualizar alunos/professores/turmas relacionados à Saúde;
* gerenciar as informações dentro do escopo permitido.

João NÃO pode:

* criar curso em Engenharia;
* editar turma de Engenharia;
* criar matéria de Computação;
* alterar o Núcleo de outro coordenador.

---

# 21. Permissões do ADM

O ADM possui acesso global.

Pode:

* criar Núcleos;
* editar Núcleos;
* excluir/desativar Núcleos;
* criar cursos;
* editar cursos;
* excluir cursos;
* criar turmas;
* editar turmas;
* excluir turmas;
* criar matérias;
* editar matérias;
* excluir matérias;
* gerenciar usuários;
* alterar Núcleo de usuários;
* aprovar cadastros;
* rejeitar cadastros;
* solicitar correções;
* editar informações enviadas pelos usuários.

---

# 22. Regra para exclusão

Ao excluir Núcleos, Cursos, Turmas ou Matérias que possuam usuários ou registros relacionados, evitar exclusão destrutiva automática.

Preferir:

**Desativar**

quando houver dependências.

Exemplo:

Se um curso possui 100 alunos vinculados, o ADM não deve simplesmente apagar o curso e quebrar os vínculos existentes.

Mostrar confirmação e informar os impactos da ação.

---

# 23. Atualização dinâmica

Todas as telas devem utilizar os mesmos dados acadêmicos.

Quando um coordenador criar:

**Curso → Turma → Matéria**

essas informações devem aparecer automaticamente em:

* Cadastro de usuários;
* Gerenciamento de usuários;
* Turmas;
* Cursos;
* Matérias;
* Perfil dos usuários;
* Solicitações de cadastro;
* áreas relacionadas ao sistema acadêmico.

Evitar dados duplicados e listas estáticas independentes.

---

# 24. Regra final de integridade

O sistema deve sempre considerar que:

**Núcleos, Cursos, Turmas e Matérias são entidades relacionadas.**

Portanto, não permitir que o usuário crie ou selecione combinações impossíveis.

A estrutura deve seguir:

**NÚCLEO**
→ **CURSOS**
→ **TURMAS**
→ **MATÉRIAS**
→ **USUÁRIOS**

E as permissões devem seguir:

**ADM**
→ acesso global

**COORDENADOR**
→ seu Núcleo

**PROFESSOR**
→ seu Núcleo + disciplinas/turmas que ministra

**ALUNO**
→ seu Núcleo + disciplinas/turmas em que está matriculado.

Implementar essas regras tanto na interface quanto na lógica de validação, garantindo que informações inválidas não possam ser inseridas simplesmente manipulando campos ou ignorando etapas do formulário.
