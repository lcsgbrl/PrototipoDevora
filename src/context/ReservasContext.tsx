import { createContext, useContext, useState, ReactNode } from "react";

export type StatusSolicitacao = "Pendente" | "Aprovado" | "Recusado" | "Em análise" | "Cancelado";
export type TipoSolicitacao = "aluno_para_professor" | "auth_required" | "direta";

export interface Solicitacao {
  id: number;
  tipo: TipoSolicitacao;
  sala: string;
  bloco: string;
  data: string;
  inicio: string;
  fim: string;
  pessoas: number;
  solicitante: string;
  solicitanteRole: string;
  nucleoSolicitante?: string;
  professorResponsavel?: string;
  status: StatusSolicitacao;
  motivo?: string;
  aprovadoPor?: string;
  dataAprovacao?: string;
  observacao?: string;
  createdAt: string;
}

const initialSolicitacoes: Solicitacao[] = [
  // ── Núcleo Engenharia ─────────────────────────────────────────────────────
  {
    id: 1, tipo: "aluno_para_professor",
    sala: "Lab. de Informática", bloco: "Bloco B — 102",
    data: "26/08/2026", inicio: "14:00", fim: "16:00", pessoas: 25,
    solicitante: "João Pedro", solicitanteRole: "Aluno", nucleoSolicitante: "Engenharia",
    professorResponsavel: "Prof. André Lemos",
    status: "Pendente", createdAt: "25/08/2026 09:30",
  },
  {
    id: 5, tipo: "direta",
    sala: "Sala de Reuniões", bloco: "Bloco A — 201",
    data: "26/08/2026", inicio: "09:00", fim: "10:30", pessoas: 10,
    solicitante: "Prof. André Lemos", solicitanteRole: "Professor", nucleoSolicitante: "Engenharia",
    status: "Aprovado", createdAt: "24/08/2026 08:00",
  },
  {
    id: 6, tipo: "aluno_para_professor",
    sala: "Lab. de Química", bloco: "Bloco D — 104",
    data: "29/08/2026", inicio: "08:00", fim: "10:00", pessoas: 18,
    solicitante: "João Pedro", solicitanteRole: "Aluno", nucleoSolicitante: "Engenharia",
    professorResponsavel: "Prof. André Lemos",
    status: "Recusado", aprovadoPor: "Prof. André Lemos", dataAprovacao: "25/08/2026 15:00",
    observacao: "Conflito de horário com outra turma.",
    createdAt: "23/08/2026 14:00",
  },
  {
    id: 3, tipo: "auth_required",
    sala: "Auditório Central", bloco: "Bloco C — Térreo",
    data: "28/08/2026", inicio: "08:00", fim: "12:00", pessoas: 150,
    solicitante: "Prof. André Lemos", solicitanteRole: "Professor", nucleoSolicitante: "Engenharia",
    status: "Em análise", createdAt: "25/08/2026 11:00",
  },
  {
    id: 7, tipo: "aluno_para_professor",
    sala: "Sala Multimídia", bloco: "Bloco B — 305",
    data: "27/08/2026", inicio: "10:00", fim: "12:00", pessoas: 30,
    solicitante: "João Pedro", solicitanteRole: "Aluno", nucleoSolicitante: "Engenharia",
    professorResponsavel: "Prof. André Lemos",
    status: "Aprovado", aprovadoPor: "Prof. André Lemos", dataAprovacao: "25/08/2026 10:15",
    createdAt: "24/08/2026 16:00",
  },
  // ── Núcleo Computação ─────────────────────────────────────────────────────
  {
    id: 2, tipo: "aluno_para_professor",
    sala: "Lab. de Informática", bloco: "Bloco B — 102",
    data: "27/08/2026", inicio: "14:00", fim: "16:00", pessoas: 20,
    solicitante: "Maria Clara", solicitanteRole: "Aluno", nucleoSolicitante: "Computação",
    professorResponsavel: "Prof. Carlos Silva",
    status: "Pendente", createdAt: "25/08/2026 10:00",
  },
  {
    id: 8, tipo: "direta",
    sala: "Sala de Estudos", bloco: "Bloco A — 103",
    data: "26/08/2026", inicio: "16:00", fim: "18:00", pessoas: 15,
    solicitante: "Prof. Carlos Silva", solicitanteRole: "Professor", nucleoSolicitante: "Computação",
    status: "Aprovado", createdAt: "24/08/2026 12:00",
  },
  {
    id: 9, tipo: "auth_required",
    sala: "Auditório Central", bloco: "Bloco C — Térreo",
    data: "02/09/2026", inicio: "14:00", fim: "18:00", pessoas: 200,
    solicitante: "Mariana Costa", solicitanteRole: "Coordenador", nucleoSolicitante: "Computação",
    status: "Aprovado", aprovadoPor: "Ana Santos", dataAprovacao: "25/08/2026 14:30",
    createdAt: "24/08/2026 09:00",
  },
  {
    id: 10, tipo: "auth_required",
    sala: "Auditório Central", bloco: "Bloco C — Térreo",
    data: "10/09/2026", inicio: "09:00", fim: "12:00", pessoas: 180,
    solicitante: "Prof. Carlos Silva", solicitanteRole: "Professor", nucleoSolicitante: "Computação",
    status: "Em análise", createdAt: "26/08/2026 08:00",
  },
  {
    id: 4, tipo: "aluno_para_professor",
    sala: "Sala Multimídia", bloco: "Bloco B — 305",
    data: "03/09/2026", inicio: "10:00", fim: "12:00", pessoas: 35,
    solicitante: "Maria Clara", solicitanteRole: "Aluno", nucleoSolicitante: "Computação",
    professorResponsavel: "Prof. Carlos Silva",
    status: "Pendente", createdAt: "25/08/2026 14:00",
  },
];

interface ReservasContextValue {
  solicitacoes: Solicitacao[];
  addSolicitacao: (s: Omit<Solicitacao, "id" | "createdAt">) => void;
  aprovarSolicitacao: (id: number, aprovadoPor: string, obs?: string) => void;
  recusarSolicitacao: (id: number, aprovadoPor: string, obs: string) => void;
  cancelarSolicitacao: (id: number) => void;
}

const ReservasContext = createContext<ReservasContextValue | null>(null);

export function ReservasProvider({ children }: { children: ReactNode }) {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(initialSolicitacoes);
  const [nextId, setNextId] = useState(100);

  const now = () => {
    const d = new Date();
    return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const addSolicitacao = (s: Omit<Solicitacao, "id" | "createdAt">) => {
    setSolicitacoes((prev) => [...prev, { ...s, id: nextId, createdAt: now() }]);
    setNextId((n) => n + 1);
  };

  const aprovarSolicitacao = (id: number, aprovadoPor: string, obs?: string) =>
    setSolicitacoes((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: "Aprovado", aprovadoPor, dataAprovacao: now(), observacao: obs } : s)
    );

  const recusarSolicitacao = (id: number, aprovadoPor: string, obs: string) =>
    setSolicitacoes((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: "Recusado", aprovadoPor, dataAprovacao: now(), observacao: obs } : s)
    );

  const cancelarSolicitacao = (id: number) =>
    setSolicitacoes((prev) => prev.map((s) => (s.id === id ? { ...s, status: "Cancelado" } : s)));

  return (
    <ReservasContext.Provider value={{ solicitacoes, addSolicitacao, aprovarSolicitacao, recusarSolicitacao, cancelarSolicitacao }}>
      {children}
    </ReservasContext.Provider>
  );
}

export function useReservas() {
  const ctx = useContext(ReservasContext);
  if (!ctx) throw new Error("useReservas must be used inside ReservasProvider");
  return ctx;
}
