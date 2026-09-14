import { createContext, useContext, useState, ReactNode } from "react";

export interface Member {
  id: number;
  nome: string;
  email: string;
  cpf?: string;
  funcao: string;
  depto: string;
  nucleo?: string;
  curso?: string;
  turno?: string;
  turma?: string;
  disciplinas?: string[];
  status: "Ativo" | "Inativo" | "Pendente" | "Aguardando Correção";
  initials: string;
  source: "existing" | "request";
  motivoRejeicao?: string;
  motivoCorrecao?: string;
}

const initialMembers: Member[] = [
  { id: 1,  nome: "Ana Santos",         email: "ana.santos@inst.edu.br",          funcao: "Administrador", depto: "TI",           nucleo: undefined,       status: "Ativo",               initials: "AS", source: "existing" },
  { id: 2,  nome: "Prof. André Lemos",  email: "andre.lemos@inst.edu.br",         funcao: "Professor",     depto: "Física",       nucleo: "Engenharia",    curso: "Engenharia Civil",       turno: "Noturno",    turma: "ENG-CIVIL-01", disciplinas: ["Cálculo II","Resistência dos Materiais","Desenho Técnico"],          status: "Ativo",               initials: "AL", source: "existing" },
  { id: 3,  nome: "Dra. Fátima Ramos",  email: "fatima.ramos@inst.edu.br",        funcao: "Coordenador",   depto: "Engenharia",   nucleo: "Engenharia",    status: "Ativo",               initials: "FR", source: "existing" },
  { id: 4,  nome: "Mariana Costa",      email: "mariana.costa@inst.edu.br",       funcao: "Coordenador",   depto: "Computação",   nucleo: "Computação",    status: "Ativo",               initials: "MC", source: "existing" },
  { id: 5,  nome: "Prof. Carlos Silva", email: "carlos.silva@inst.edu.br",        funcao: "Professor",     depto: "Computação",   nucleo: "Computação",    curso: "Sistemas de Informação", turno: "Noturno",    turma: "SI-04",        disciplinas: ["Programação","Banco de Dados","Cálculo II"],                        status: "Ativo",               initials: "CS", source: "existing" },
  { id: 6,  nome: "Beatriz Souza",      email: "beatriz.souza@inst.edu.br",       funcao: "Professor",     depto: "Matemática",   nucleo: "Saúde",         curso: "Enfermagem",             turno: "Matutino",   turma: "ENF-01",       disciplinas: ["Anatomia","Fisiologia"],                                            status: "Ativo",               initials: "BS", source: "existing" },
  { id: 7,  nome: "João Pedro",         email: "joao.pedro@aluno.inst.edu.br",    funcao: "Aluno",         depto: "Engenharia",   nucleo: "Engenharia",    curso: "Engenharia Civil",       turno: "Noturno",    turma: "ENG-CIVIL-01", disciplinas: ["Resistência dos Materiais","Cálculo II","Desenho Técnico"],          status: "Ativo",               initials: "JP", source: "existing" },
  { id: 8,  nome: "Maria Clara",        email: "maria.clara@aluno.inst.edu.br",   funcao: "Aluno",         depto: "Computação",   nucleo: "Computação",    curso: "Sistemas de Informação", turno: "Noturno",    turma: "SI-04",        disciplinas: ["Programação","Banco de Dados","Cálculo II"],                        status: "Ativo",               initials: "MC", source: "existing" },
  { id: 9,  nome: "Carlos Mendes",      email: "carlos.mendes@inst.edu.br",       funcao: "Aluno",         depto: "Administração",nucleo: "Administração", curso: "Administração",          turno: "Noturno",    turma: "ADM-01",       disciplinas: ["Gestão Empresarial","Finanças Corporativas"],                       status: "Inativo",             initials: "CM", source: "existing" },
  { id: 10, nome: "Rafael Oliveira",    email: "rafael.oliveira@inst.edu.br",     funcao: "Aluno",         depto: "Computação",   nucleo: "Computação",    curso: "Ciências da Computação", turno: "Vespertino", turma: "CC-01",        disciplinas: ["Programação","Banco de Dados"],                                     status: "Pendente",            initials: "RO", source: "existing" },
  { id: 11, nome: "Lucas Silva",        email: "lucas.silva@inst.edu.br",         funcao: "Professor",     depto: "Ciências",     nucleo: "Administração", curso: "Administração",          turno: "Noturno",    turma: "ADM-01",       disciplinas: ["Gestão Empresarial","Finanças Corporativas","Recursos Humanos"],   status: "Ativo",               initials: "LS", source: "existing" },
  { id: 12, nome: "Dr. João Paulo",     email: "joao.paulo@inst.edu.br",          funcao: "Coordenador",   depto: "Saúde",        nucleo: "Saúde",         status: "Ativo",               initials: "JP", source: "existing" },
  { id: 13, nome: "Lucas Ferreira",     email: "lucas.ferreira@aluno.inst.edu.br",funcao: "Aluno",         depto: "Computação",   nucleo: "Computação",    curso: "Sistemas de Informação", turno: "Noturno",    turma: "SI-04",        disciplinas: ["Programação","Banco de Dados","Cálculo II"],                        status: "Ativo",               initials: "LF", source: "existing" },
  { id: 14, nome: "Fernanda Lima",      email: "fernanda.lima@aluno.inst.edu.br", cpf: "123.456.789-01",  funcao: "Aluno",         depto: "Saúde",        nucleo: "Saúde",         curso: "Enfermagem",             turno: "Matutino",   turma: "ENF-01",       disciplinas: ["Anatomia","Fisiologia"],                                            status: "Pendente",            initials: "FL", source: "request" },
  { id: 15, nome: "Pedro Alves",        email: "pedro.alves@inst.edu.br",         cpf: "987.654.321-00",  funcao: "Professor",     depto: "Engenharia",   nucleo: "Saúde",         curso: "Engenharia Civil",       turno: "Noturno",    turma: "ENG-CIVIL-01", disciplinas: ["Cálculo II"],                                                        status: "Pendente",            initials: "PA", source: "request" },
  { id: 16, nome: "Amanda Rocha",       email: "amanda.rocha@aluno.inst.edu.br",  cpf: "456.123.789-55",  funcao: "Aluno",         depto: "Direito",      nucleo: "Direito",       curso: "Direito",                turno: "Vespertino", turma: "DIR-01",        disciplinas: ["Direito Constitucional","Direito Civil"],                           status: "Aguardando Correção", initials: "AR", source: "request", motivoCorrecao: "Confirme sua turma e núcleo corretos antes de prosseguir." },
];

interface MembersContextValue {
  members: Member[];
  addPendingMember: (m: Omit<Member, "id" | "status" | "initials" | "source">) => void;
  addMemberDirectly: (m: Omit<Member, "id" | "initials" | "source">) => void;
  approveMember: (id: number) => void;
  rejectMember: (id: number, motivo?: string) => void;
  solicitarCorrecao: (id: number, motivo: string) => void;
  removeMember: (id: number) => void;
  toggleMemberStatus: (id: number) => void;
  updateMember: (id: number, data: Partial<Pick<Member, "nome" | "email" | "cpf" | "funcao" | "depto" | "nucleo" | "curso" | "turno" | "turma" | "disciplinas" | "status">>) => void;
}

export const MembersContext = createContext<MembersContextValue | null>(null);

export function MembersProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [nextId, setNextId] = useState(200);

  const makeInitials = (nome: string) =>
    nome.split(" ").filter(w => /^[A-Za-zÀ-ÖØ-öø-ÿ]/.test(w)).slice(0, 2).map(w => w[0]).join("").toUpperCase();

  const addPendingMember = (m: Omit<Member, "id" | "status" | "initials" | "source">) => {
    setMembers(prev => [...prev, { ...m, id: nextId, status: "Pendente", initials: makeInitials(m.nome), source: "request" }]);
    setNextId(n => n + 1);
  };

  const addMemberDirectly = (m: Omit<Member, "id" | "initials" | "source">) => {
    setMembers(prev => [...prev, { ...m, id: nextId, initials: makeInitials(m.nome), source: "existing" }]);
    setNextId(n => n + 1);
  };

  const approveMember = (id: number) =>
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: "Ativo", motivoRejeicao: undefined, motivoCorrecao: undefined } : m));

  const rejectMember = (id: number, _motivo?: string) =>
    setMembers(prev => prev.filter(m => m.id !== id));

  const solicitarCorrecao = (id: number, motivo: string) =>
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: "Aguardando Correção", motivoCorrecao: motivo } : m));

  const removeMember = (id: number) =>
    setMembers(prev => prev.filter(m => m.id !== id));

  const toggleMemberStatus = (id: number) =>
    setMembers(prev =>
      prev.map(m => m.id === id ? { ...m, status: m.status === "Ativo" ? "Inativo" : "Ativo" } : m)
    );

  const updateMember = (id: number, data: Partial<Pick<Member, "nome" | "email" | "cpf" | "funcao" | "depto" | "nucleo" | "curso" | "turno" | "turma" | "disciplinas" | "status">>) =>
    setMembers(prev => prev.map(m =>
      m.id === id ? { ...m, ...data, initials: data.nome ? makeInitials(data.nome) : m.initials } : m
    ));

  return (
    <MembersContext.Provider value={{ members, addPendingMember, addMemberDirectly, approveMember, rejectMember, solicitarCorrecao, removeMember, toggleMemberStatus, updateMember }}>
      {children}
    </MembersContext.Provider>
  );
}

export function useMembers() {
  const ctx = useContext(MembersContext);
  if (!ctx) throw new Error("useMembers must be used inside MembersProvider");
  return ctx;
}
