import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useReservas, Solicitacao } from "@/context/ReservasContext";

/* ── Types ── */
export interface Sala {
  id: number;
  nome: string;
  bloco: string;
  numero: string;
  tipo: string;
  capacidade: number;
  recursos: string[];
  exigeAutorizacao?: boolean;
  status: "Disponível" | "Manutenção" | "Inativa";
}

const initialSalas: Sala[] = [
  { id: 1, nome: "Lab. de Informática", bloco: "Bloco B", numero: "102", tipo: "Laboratório", capacidade: 45, recursos: ["Projetor", "Ar-cond.", "Computadores"], status: "Disponível" },
  { id: 2, nome: "Sala de Reuniões", bloco: "Bloco A", numero: "201", tipo: "Reunião", capacidade: 15, recursos: ["TV", "Quadro branco"], status: "Disponível" },
  { id: 3, nome: "Auditório Central", bloco: "Bloco C", numero: "Térreo", tipo: "Auditório", capacidade: 200, recursos: ["Projetor", "Som", "Ar-cond."], exigeAutorizacao: true, status: "Disponível" },
  { id: 4, nome: "Lab. de Química", bloco: "Bloco D", numero: "104", tipo: "Laboratório", capacidade: 30, recursos: ["Capelas", "Bancadas"], status: "Manutenção" },
  { id: 5, nome: "Sala Multimídia", bloco: "Bloco B", numero: "305", tipo: "Aula", capacidade: 40, recursos: ["Projetor", "Ar-cond."], status: "Disponível" },
  { id: 6, nome: "Sala de Estudos", bloco: "Biblioteca", numero: "2º andar", tipo: "Estudo", capacidade: 20, recursos: ["Wi-Fi", "Tomadas"], status: "Disponível" },
];

const statusSalaStyle: Record<Sala["status"], { bg: string; text: string; dot: string }> = {
  "Disponível": { bg: "#EAF5EA", text: "#2B5E2B", dot: "#4A9A4A" },
  "Manutenção": { bg: "#FFF8E6", text: "#805B00", dot: "#B08A00" },
  "Inativa":    { bg: "#F5F2EB", text: "#776D5B", dot: "#A8A09A" },
};

const statusSolStyle: Record<string, { bg: string; text: string; dot: string }> = {
  Pendente:     { bg: "#FFF8E6", text: "#805B00", dot: "#B08A00" },
  "Em análise": { bg: "#E3ECEE", text: "#1E5E60", dot: "#1E5E60" },
  Aprovado:     { bg: "#EAF5EA", text: "#2B5E2B", dot: "#4A9A4A" },
  Recusado:     { bg: "#FDF0F2", text: "#991B1B", dot: "#C0303F" },
  Cancelado:    { bg: "#F5F2EB", text: "#776D5B", dot: "#A8A09A" },
};

const tipoOptions = ["Laboratório", "Reunião", "Auditório", "Aula", "Estudo", "Outro"];
const recursoOptions = ["Projetor", "Ar-condicionado", "Computadores", "TV", "Quadro branco", "Som", "Wi-Fi", "Tomadas", "Capelas", "Bancadas"];
const PROFESSORS = ["Prof. André Lemos", "Dra. Fátima Ramos", "Mariana Costa", "Ana Santos"];

/* ── Input helpers ── */
const iStyle = { backgroundColor: "#F5F2EB", border: "1px solid #E7E0D5", color: "#1E1B15" } as const;
const iCls = "w-full px-3.5 py-2.5 text-sm rounded-xl outline-none";
const fIn = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor = "#8B0019";
  e.target.style.boxShadow = "0 0 0 3px rgba(139,0,25,0.08)";
};
const fOut = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor = "#E7E0D5";
  e.target.style.boxShadow = "none";
};
const errStyle = { backgroundColor: "#FDF0F2", border: "1px solid #F5C2C8", color: "#991B1B" } as const;

/* ── Recusar modal ── */
function RecusarModal({ s, onRecusar, onClose }: { s: Solicitacao; onRecusar: (obs: string) => void; onClose: () => void }) {
  const [obs, setObs] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(14,12,9,0.6)" }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
        <div className="px-6 py-5" style={{ borderBottom: "1px solid #F3EFEA" }}>
          <h2 className="text-base font-bold" style={{ color: "#1E1B15" }}>Recusar solicitação</h2>
          <p className="text-xs mt-0.5" style={{ color: "#776D5B" }}>{s.sala} · {s.data} · {s.inicio}–{s.fim}</p>
        </div>
        <div className="p-6">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Motivo da recusa <span style={{ color: "#8B0019" }}>*</span></label>
          <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={3} placeholder="Informe o motivo…"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none resize-none" style={iStyle} onFocus={fIn} onBlur={fOut} />
        </div>
        <div className="px-6 py-4 flex gap-3 justify-end" style={{ borderTop: "1px solid #F3EFEA" }}>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F5F2EB", color: "#776D5B", border: "1px solid #E7E0D5" }}>Cancelar</button>
          <button onClick={() => obs.trim() && onRecusar(obs)} disabled={!obs.trim()}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
            style={{ backgroundColor: "#991B1B" }}>
            Confirmar recusa
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Add / Edit Sala Modal (Admin only) ── */
function SalaModal({
  onClose, onSave, sala,
}: {
  onClose: () => void;
  onSave: (s: Omit<Sala, "id">) => void;
  sala?: Sala;
}) {
  const editing = !!sala;
  const [form, setForm] = useState({
    nome: sala?.nome ?? "",
    bloco: sala?.bloco ?? "",
    numero: sala?.numero ?? "",
    tipo: sala?.tipo ?? "Aula",
    capacidade: sala?.capacidade?.toString() ?? "",
    exigeAutorizacao: sala?.exigeAutorizacao ?? false,
    status: sala?.status ?? ("Disponível" as Sala["status"]),
  });
  const [recursos, setRecursos] = useState<string[]>(sala?.recursos ?? []);
  const [novoRecurso, setNovoRecurso] = useState("");
  const [error, setError] = useState("");

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const toggleRecurso = (r: string) =>
    setRecursos((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.bloco || !form.numero) { setError("Preencha todos os campos obrigatórios."); return; }
    const cap = parseInt(form.capacidade);
    if (!cap || cap < 1) { setError("Informe uma capacidade válida (mínimo 1 pessoa)."); return; }
    onSave({ nome: form.nome, bloco: form.bloco, numero: form.numero, tipo: form.tipo, capacidade: cap, recursos, exigeAutorizacao: form.exigeAutorizacao, status: form.status });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(14,12,9,0.55)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid #F3EFEA" }}>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: "#FFF0F2", color: "#8B0019" }}>ADM</span>
              <h2 className="text-base font-bold" style={{ color: "#1E1B15" }}>{editing ? "Editar Sala" : "Adicionar Sala"}</h2>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "#776D5B" }}>{editing ? `Editando: ${sala!.nome}` : "Cadastre um novo ambiente no sistema"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "#776D5B", backgroundColor: "#F5F2EB" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Nome da sala <span style={{ color: "#8B0019" }}>*</span></label>
              <input name="nome" value={form.nome} onChange={handle} placeholder="Ex: Lab. de Informática" className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Bloco <span style={{ color: "#8B0019" }}>*</span></label>
              <input name="bloco" value={form.bloco} onChange={handle} placeholder="Ex: Bloco B" className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Localização <span style={{ color: "#8B0019" }}>*</span></label>
              <input name="numero" value={form.numero} onChange={handle} placeholder="Ex: 102" className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Tipo</label>
              <select name="tipo" value={form.tipo} onChange={handle} className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut}>
                {tipoOptions.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Capacidade (pessoas) <span style={{ color: "#8B0019" }}>*</span></label>
              <input name="capacidade" type="number" min="1" value={form.capacidade} onChange={handle} placeholder="Ex: 45" className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut} />
            </div>
            {editing && (
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Status da sala</label>
                <div className="flex gap-2">
                  {(["Disponível", "Manutenção", "Inativa"] as Sala["status"][]).map((s) => {
                    const st = statusSalaStyle[s];
                    const active = form.status === s;
                    return (
                      <button key={s} type="button" onClick={() => setForm({ ...form, status: s })}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{ backgroundColor: active ? st.bg : "#F5F2EB", color: active ? st.text : "#776D5B", border: `1px solid ${active ? st.dot : "#E7E0D5"}` }}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "#3D382E" }}>Recursos disponíveis</label>
            {/* Preset resource toggles */}
            <div className="flex flex-wrap gap-2 mb-3">
              {recursoOptions.map((r) => {
                const active = recursos.includes(r);
                return (
                  <button key={r} type="button" onClick={() => toggleRecurso(r)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                    style={{ backgroundColor: active ? "#FFF0F2" : "#F5F2EB", color: active ? "#8B0019" : "#776D5B", border: `1px solid ${active ? "#FFD6D9" : "#E7E0D5"}` }}>
                    {active && "✓ "}{r}
                  </button>
                );
              })}
            </div>
            {/* Custom resources added by admin */}
            {recursos.filter((r) => !recursoOptions.includes(r)).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {recursos.filter((r) => !recursoOptions.includes(r)).map((r) => (
                  <span key={r} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: "#FFF0F2", color: "#8B0019", border: "1px solid #FFD6D9" }}>
                    {r}
                    <button type="button" onClick={() => setRecursos((p) => p.filter((x) => x !== r))}
                      className="hover:opacity-60 transition-opacity" aria-label={`Remover ${r}`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
            {/* Add custom resource input */}
            <div className="flex gap-2">
              <input
                value={novoRecurso}
                onChange={(e) => setNovoRecurso(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const v = novoRecurso.trim();
                    if (v && !recursos.includes(v)) { setRecursos((p) => [...p, v]); }
                    setNovoRecurso("");
                  }
                }}
                placeholder="Adicionar recurso personalizado…"
                className="flex-1 px-3 py-2 text-xs rounded-xl outline-none"
                style={{ backgroundColor: "#F5F2EB", border: "1px solid #E7E0D5", color: "#1E1B15" }}
                onFocus={(e) => { e.target.style.borderColor = "#8B0019"; e.target.style.boxShadow = "0 0 0 3px rgba(139,0,25,0.08)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#E7E0D5"; e.target.style.boxShadow = "none"; }}
              />
              <button
                type="button"
                onClick={() => {
                  const v = novoRecurso.trim();
                  if (v && !recursos.includes(v)) { setRecursos((p) => [...p, v]); }
                  setNovoRecurso("");
                }}
                disabled={!novoRecurso.trim()}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
                style={{ backgroundColor: "#FFF0F2", color: "#8B0019", border: "1px solid #FFD6D9" }}>
                + Adicionar
              </button>
            </div>
            <p className="text-xs mt-1.5" style={{ color: "#A8A09A" }}>Digite o nome e clique em Adicionar ou pressione Enter.</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.exigeAutorizacao} onChange={(e) => setForm({ ...form, exigeAutorizacao: e.target.checked })} className="w-4 h-4 rounded" style={{ accentColor: "#8B0019" }} />
            <span className="text-xs font-medium" style={{ color: "#3D382E" }}>Exige autorização do coordenador para reserva</span>
          </label>
          {error && <div className="px-4 py-3 rounded-xl text-xs" style={errStyle}>{error}</div>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F5F2EB", color: "#776D5B", border: "1px solid #E7E0D5" }}>Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#8B0019" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#700010")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8B0019")}>
              {editing ? "Salvar alterações" : "Cadastrar Sala"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Availability table helper ── */
function AvailabilityTable({
  salas, solicitacoes, data, selectedSalaId, onSelect,
}: {
  salas: Sala[];
  solicitacoes: any[];
  data: string;
  selectedSalaId: string;
  onSelect: (inicio: string, fim: string, salaId: string) => void;
}) {
  const SLOTS = [
    { inicio: "08:00", fim: "10:00" }, { inicio: "10:00", fim: "12:00" },
    { inicio: "12:00", fim: "14:00" }, { inicio: "14:00", fim: "16:00" },
    { inicio: "16:00", fim: "18:00" }, { inicio: "18:00", fim: "20:00" },
  ];
  const dataPtBr = data
    ? new Date(data).toLocaleDateString("pt-BR")
    : "";

  const availSalas = selectedSalaId
    ? salas.filter(s => s.id === Number(selectedSalaId) && s.status === "Disponível")
    : salas.filter(s => s.status === "Disponível");

  const isOccupied = (salaName: string, inicio: string) => {
    return solicitacoes.some(s =>
      s.sala === salaName &&
      s.data === dataPtBr &&
      s.status !== "Cancelado" &&
      s.status !== "Recusado" &&
      s.inicio === inicio
    );
  };

  const getOccupant = (salaName: string, inicio: string) => {
    return solicitacoes.find(s =>
      s.sala === salaName && s.data === dataPtBr && s.status !== "Cancelado" && s.status !== "Recusado" && s.inicio === inicio
    );
  };

  if (!data || availSalas.length === 0) return null;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3EFEA" }}>
      <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor: "#FAF9F6", borderBottom: "1px solid #F3EFEA" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B0019" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span className="text-xs font-semibold" style={{ color: "#1E1B15" }}>Disponibilidade em {dataPtBr}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ backgroundColor: "#FAF9F6" }}>
              <th className="px-3 py-2 text-left font-semibold" style={{ color: "#776D5B", borderBottom: "1px solid #F3EFEA" }}>Horário</th>
              <th className="px-3 py-2 text-left font-semibold" style={{ color: "#776D5B", borderBottom: "1px solid #F3EFEA" }}>Sala</th>
              <th className="px-3 py-2 text-left font-semibold" style={{ color: "#776D5B", borderBottom: "1px solid #F3EFEA" }}>Status</th>
              <th className="px-3 py-2 text-left font-semibold" style={{ color: "#776D5B", borderBottom: "1px solid #F3EFEA" }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {SLOTS.map(slot =>
              availSalas.map((sala, si) => {
                const occ = isOccupied(sala.nome, slot.inicio);
                const occupant = occ ? getOccupant(sala.nome, slot.inicio) : null;
                const isFirst = si === 0;
                return (
                  <tr key={`${slot.inicio}-${sala.id}`}
                    style={{ borderTop: isFirst ? "1px solid #F3EFEA" : undefined }}
                    className="hover:bg-neutral-50 transition-colors">
                    {isFirst && (
                      <td className="px-3 py-2 font-semibold" rowSpan={availSalas.length} style={{ color: "#3D382E", verticalAlign: "middle", borderRight: "1px solid #F3EFEA" }}>
                        {slot.inicio}–{slot.fim}
                      </td>
                    )}
                    <td className="px-3 py-2" style={{ color: "#3D382E" }}>{sala.nome}</td>
                    <td className="px-3 py-2">
                      {occ ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "#FDF0F2", color: "#991B1B" }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#C0303F" }}/>
                          Ocupado{occupant ? ` · ${occupant.solicitante}` : ""}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "#EAF5EA", color: "#2B5E2B" }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#4A9A4A" }}/>
                          Disponível
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {!occ ? (
                        <button
                          type="button"
                          onClick={() => onSelect(slot.inicio, slot.fim, String(sala.id))}
                          className="px-2.5 py-1 rounded-lg font-semibold transition-colors"
                          style={{ backgroundColor: "#FFF0F2", color: "#8B0019", border: "1px solid #FFD6D9" }}>
                          Selecionar
                        </button>
                      ) : (
                        <span style={{ color: "#A8A09A" }}>Indisponível</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Solicitar / Nova Reserva Modal ── */
function SolicitacaoModal({
  salas, onClose, isAluno, isProfessor,
}: {
  salas: Sala[];
  onClose: () => void;
  isAluno: boolean;
  isProfessor: boolean;
}) {
  const { addSolicitacao, solicitacoes } = useReservas();
  const { user } = useAuth();
  const [form, setForm] = useState({ salaId: "", data: "", inicio: "", fim: "", pessoas: "", professor: "", obs: "" });
  const [showAvailability, setShowAvailability] = useState(false);
  const [capacityError, setCapacityError] = useState("");
  const [timeError, setTimeError] = useState("");
  const [pessoasError, setPessoasError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  const validateTime = (data: string, inicio: string, fim: string) => {
    if (!inicio || !fim) { setTimeError(""); return; }
    if (fim <= inicio) {
      setTimeError("O horário de término deve ser posterior ao de início.");
      return;
    }
    // If today, check start is not in the past
    if (data === todayStr) {
      const now = new Date();
      const [h, m] = inicio.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(h, m, 0, 0);
      if (startDate < now) {
        setTimeError("O horário de início já passou. Escolha um horário futuro.");
        return;
      }
    }
    setTimeError("");
  };

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);

    // Capacity check
    if (name === "pessoas" || name === "salaId") {
      const salaId = name === "salaId" ? value : form.salaId;
      const pessoas = name === "pessoas" ? value : form.pessoas;
      const sala = salas.find((s) => s.id === Number(salaId));
      if (name === "pessoas") {
        if (!value || value === "0") {
          setPessoasError("Informe a quantidade de pessoas que utilizarão a sala.");
        } else if (sala) {
          const n = parseInt(value);
          if (n < 1) {
            setPessoasError("O número de participantes deve ser pelo menos 1.");
          } else if (n > sala.capacidade) {
            setPessoasError("");
            setCapacityError(`A capacidade máxima desta sala é de ${sala.capacidade} pessoas. Você informou ${n} — reduza o número de participantes ou escolha um ambiente maior.`);
          } else {
            setPessoasError("");
            setCapacityError("");
          }
        } else {
          setPessoasError("");
          setCapacityError("");
        }
      } else if (name === "salaId") {
        const sala2 = salas.find((s) => s.id === Number(value));
        if (sala2 && pessoas) {
          const n = parseInt(pessoas);
          if (n > sala2.capacidade) {
            setCapacityError(`A capacidade máxima desta sala é de ${sala2.capacidade} pessoas.`);
          } else {
            setCapacityError("");
          }
        } else {
          setCapacityError("");
        }
      }
    }

    // Time validation
    const newData = name === "data" ? value : updated.data;
    const newInicio = name === "inicio" ? value : updated.inicio;
    const newFim = name === "fim" ? value : updated.fim;
    if (name === "data" || name === "inicio" || name === "fim") {
      validateTime(newData, newInicio, newFim);
    }
  };

  const availableSalas = salas.filter((s) => s.status === "Disponível");
  const selectedSala = availableSalas.find((s) => s.id === Number(form.salaId));
  const needsAuth = selectedSala?.exigeAutorizacao && !isAluno;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate pessoas required
    if (!form.pessoas || parseInt(form.pessoas) < 1) {
      setPessoasError("Informe a quantidade de pessoas que utilizarão a sala.");
      return;
    }
    if (capacityError || timeError || pessoasError) return;
    if (!form.salaId || !form.data || !form.inicio || !form.fim) return;

    const n = parseInt(form.pessoas);
    addSolicitacao({
      tipo: isAluno ? "aluno_para_professor" : needsAuth ? "auth_required" : "direta",
      sala: selectedSala!.nome,
      bloco: `${selectedSala!.bloco} — ${selectedSala!.numero}`,
      data: new Date(form.data).toLocaleDateString("pt-BR"),
      inicio: form.inicio,
      fim: form.fim,
      pessoas: n,
      solicitante: user.nome,
      solicitanteRole: user.role,
      nucleoSolicitante: user.nucleo,
      professorResponsavel: isAluno ? form.professor : undefined,
      status: isAluno ? "Pendente" : needsAuth ? "Em análise" : "Aprovado",
      motivo: form.obs,
    });
    setSubmitted(true);
  };

  const title = isAluno ? "Solicitar Reserva" : "Nova Reserva";
  const btnLabel = isAluno ? "Enviar Solicitação" : needsAuth ? "Solicitar Autorização" : "Confirmar Reserva";
  const canSubmit =
    !capacityError && !timeError && !pessoasError &&
    form.salaId && form.data && form.inicio && form.fim &&
    form.pessoas && parseInt(form.pessoas) >= 1;

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(14,12,9,0.55)" }}>
        <div className="w-full max-w-sm rounded-2xl p-8 text-center" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "#EAF5EA" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2B5E2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h3 className="text-base font-bold mb-2" style={{ color: "#1E1B15" }}>
            {isAluno ? "Solicitação enviada!" : needsAuth ? "Aguardando autorização" : "Reserva confirmada!"}
          </h3>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "#776D5B" }}>
            {isAluno
              ? "Sua solicitação foi enviada ao professor responsável e aguarda aprovação."
              : needsAuth
              ? "Sua solicitação foi encaminhada ao coordenador para autorização."
              : "Sua reserva foi registrada com sucesso no sistema."}
          </p>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#8B0019" }}>Fechar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(14,12,9,0.55)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid #F3EFEA" }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: "#1E1B15" }}>{title}</h2>
            {isAluno && <p className="text-xs mt-0.5" style={{ color: "#805B00" }}>Necessita aprovação do professor responsável</p>}
            {needsAuth && <p className="text-xs mt-0.5" style={{ color: "#1E5E60" }}>Este ambiente exige autorização do coordenador</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "#776D5B", backgroundColor: "#F5F2EB" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {/* Sala select */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>
              Sala <span style={{ color: "#8B0019" }}>*</span>
            </label>
            <select name="salaId" value={form.salaId} onChange={handle} required className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut}>
              <option value="">Selecionar sala disponível…</option>
              {availableSalas.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} — {s.bloco} {s.numero} · cap. {s.capacidade} pessoas{s.exigeAutorizacao ? " ⚠ Autorização" : ""}
                </option>
              ))}
            </select>
            {salas.some((s) => s.status !== "Disponível") && (
              <p className="text-xs mt-1" style={{ color: "#776D5B" }}>
                {salas.filter((s) => s.status !== "Disponível").length} sala(s) indisponível(eis) oculta(s).
              </p>
            )}
          </div>

          {/* Sala info + capacity indicator */}
          {selectedSala && (
            <div className="rounded-xl p-3" style={{ backgroundColor: "#FAF9F6", border: "1px solid #F3EFEA" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: "#1E1B15" }}>{selectedSala.nome}</span>
                <span className="text-xs font-bold flex items-center gap-1" style={{ color: "#3C5E53" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Capacidade: {selectedSala.capacidade} pessoas
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedSala.recursos.map((r) => (
                  <span key={r} className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: "#F5F2EB", color: "#776D5B" }}>{r}</span>
                ))}
                {selectedSala.exigeAutorizacao && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "#FFF8E6", color: "#805B00" }}>⚠ Exige autorização</span>
                )}
              </div>
            </div>
          )}

          {/* Availability table — shown when date is selected */}
          {form.data && showAvailability && (
            <AvailabilityTable
              salas={salas}
              solicitacoes={solicitacoes}
              data={form.data}
              selectedSalaId={form.salaId}
              onSelect={(inicio, fim, salaId) => {
                setForm(f => ({ ...f, inicio, fim, salaId }));
                setShowAvailability(false);
              }}
            />
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Data <span style={{ color: "#8B0019" }}>*</span></label>
              <input type="date" name="data" value={form.data} onChange={e => { handle(e); setShowAvailability(true); }} required min={todayStr}
                className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut} />
              <button type="button" onClick={() => setShowAvailability(v => !v)}
                className="text-xs mt-1 font-medium"
                style={{ color: form.data ? "#8B0019" : "#A8A09A" }}>
                {form.data ? (showAvailability ? "▲ Ocultar disponibilidade" : "▼ Ver horários disponíveis") : "Selecione uma data para ver a disponibilidade"}
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Início <span style={{ color: "#8B0019" }}>*</span></label>
              <input type="time" name="inicio" value={form.inicio} onChange={handle} required
                className={iCls}
                style={{ ...iStyle, borderColor: timeError ? "#F5C2C8" : "#E7E0D5" }}
                onFocus={fIn} onBlur={fOut} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Término <span style={{ color: "#8B0019" }}>*</span></label>
              <input type="time" name="fim" value={form.fim} onChange={handle} required
                className={iCls}
                style={{ ...iStyle, borderColor: timeError ? "#F5C2C8" : "#E7E0D5" }}
                onFocus={fIn} onBlur={fOut} />
            </div>
          </div>
          {timeError && (
            <div className="px-4 py-3 rounded-xl flex items-start gap-3 text-xs" style={errStyle}>
              <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div><strong className="block font-semibold mb-0.5">Horário inválido</strong>{timeError}</div>
            </div>
          )}

          {/* Participants with capacity validation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>
                Nº de participantes <span style={{ color: "#8B0019" }}>*</span>
                {selectedSala && <span className="font-normal ml-1" style={{ color: "#776D5B" }}>(máx. {selectedSala.capacidade})</span>}
              </label>
              <input type="number" min="1" max={selectedSala?.capacidade} name="pessoas" value={form.pessoas} onChange={handle}
                required
                placeholder={selectedSala ? `1 – ${selectedSala.capacidade}` : "Obrigatório"}
                className={iCls}
                style={{
                  ...iStyle,
                  borderColor: pessoasError || capacityError ? "#F5C2C8" : "#E7E0D5",
                  boxShadow: pessoasError || capacityError ? "0 0 0 3px rgba(249,194,200,0.3)" : "none",
                }}
                onFocus={fIn} onBlur={(e) => {
                  fOut(e);
                  if (!form.pessoas || parseInt(form.pessoas) < 1)
                    setPessoasError("Informe a quantidade de pessoas que utilizarão a sala.");
                }} />
              {pessoasError && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#991B1B" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {pessoasError}
                </p>
              )}

              {/* Capacity progress bar */}
              {selectedSala && form.pessoas && !isNaN(parseInt(form.pessoas)) && parseInt(form.pessoas) >= 1 && (
                <div className="mt-2">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F3EFEA" }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (parseInt(form.pessoas) / selectedSala.capacidade) * 100)}%`,
                        backgroundColor: parseInt(form.pessoas) > selectedSala.capacidade ? "#991B1B" : parseInt(form.pessoas) / selectedSala.capacidade > 0.8 ? "#805B00" : "#2B5E2B",
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-0.5" style={{ color: "#776D5B" }}>
                    <span>{form.pessoas} participantes</span>
                    <span>{selectedSala.capacidade} vagas</span>
                  </div>
                </div>
              )}
            </div>

            {isAluno && (
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Professor responsável <span style={{ color: "#8B0019" }}>*</span></label>
                <select name="professor" value={form.professor} onChange={handle} required className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut}>
                  <option value="">Selecionar…</option>
                  {PROFESSORS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Capacity error message */}
          {capacityError && (
            <div className="px-4 py-3 rounded-xl flex items-start gap-3 text-xs" style={errStyle}>
              <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <strong className="block font-semibold mb-0.5">Capacidade excedida</strong>
                {capacityError}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>{isAluno ? "Motivo / Justificativa" : "Observações"}</label>
            <textarea name="obs" value={form.obs} onChange={handle} rows={2}
              placeholder={isAluno ? "Descreva o motivo da solicitação…" : "Informações adicionais…"}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none resize-none" style={iStyle} onFocus={fIn} onBlur={fOut} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F5F2EB", color: "#776D5B", border: "1px solid #E7E0D5" }}>Cancelar</button>
            <button type="submit" disabled={!canSubmit}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#8B0019" }}
              onMouseEnter={(e) => { if (canSubmit) e.currentTarget.style.backgroundColor = "#700010"; }}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8B0019")}>
              {btnLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Solicitação card ── */
function SolicitacaoCard({ s, canApprove, canReject, canCancel, onApprove, onReject, onCancel, currentUser }: {
  s: Solicitacao;
  canApprove: boolean;
  canReject: boolean;
  canCancel: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  currentUser: string;
}) {
  const st = statusSolStyle[s.status] ?? statusSolStyle["Pendente"];
  const isPending = s.status === "Pendente" || s.status === "Em análise";
  const isOwn = s.solicitante === currentUser;

  return (
    <div className="rounded-2xl p-5 transition-all" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="text-sm font-bold" style={{ color: "#1E1B15" }}>{s.sala}</div>
          <div className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#776D5B" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            {s.bloco}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: st.bg, color: st.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: st.dot }} />{s.status}
          </span>
          {s.tipo === "auth_required" && (
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "#E3ECEE", color: "#1E5E60" }}>Exige autorização</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 rounded-xl p-3 mb-4 text-xs" style={{ backgroundColor: "#FAF9F6" }}>
        <div><span style={{ color: "#776D5B" }}>Data</span><div className="font-semibold mt-0.5" style={{ color: "#1E1B15" }}>{s.data}</div></div>
        <div><span style={{ color: "#776D5B" }}>Horário</span><div className="font-semibold mt-0.5" style={{ color: "#1E1B15" }}>{s.inicio}–{s.fim}</div></div>
        <div><span style={{ color: "#776D5B" }}>Solicitante</span><div className="font-semibold mt-0.5" style={{ color: "#1E1B15" }}>{s.solicitante}</div></div>
        <div><span style={{ color: "#776D5B" }}>Pessoas</span><div className="font-semibold mt-0.5" style={{ color: "#1E1B15" }}>{s.pessoas}</div></div>
        {s.professorResponsavel && <div><span style={{ color: "#776D5B" }}>Professor</span><div className="font-semibold mt-0.5" style={{ color: "#1E1B15" }}>{s.professorResponsavel}</div></div>}
        {s.aprovadoPor && <div className="col-span-2"><span style={{ color: "#776D5B" }}>Decisão por</span><div className="font-semibold mt-0.5" style={{ color: "#1E1B15" }}>{s.aprovadoPor} · {s.dataAprovacao}</div></div>}
        {s.observacao && <div className="col-span-2"><span style={{ color: "#776D5B" }}>Observação</span><div className="mt-0.5 italic" style={{ color: "#3D382E" }}>{s.observacao}</div></div>}
      </div>
      <div className="flex gap-2">
        {isPending && canApprove && onApprove && (
          <button onClick={onApprove} className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ backgroundColor: "#2B5E2B" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1E4A1E")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2B5E2B")}>
            Aprovar
          </button>
        )}
        {isPending && canReject && onReject && (
          <button onClick={onReject} className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: "#FDF0F2", color: "#991B1B", border: "1px solid #F5C2C8" }}>
            Recusar
          </button>
        )}
        {canCancel && s.status !== "Cancelado" && onCancel && (
          <button onClick={onCancel} className="py-1.5 px-3 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: "#FFF8E6", color: "#805B00", border: "1px solid #FFE19A" }}>
            {isPending && isOwn ? "Cancelar" : "✕ Cancelar"}
          </button>
        )}
        {!isPending && !canCancel && (
          <div className="text-xs py-1.5" style={{ color: "#776D5B" }}>Criado em {s.createdAt}</div>
        )}
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function Reservas() {
  const { user, permissions, isAdmin } = useAuth();
  const { solicitacoes, aprovarSolicitacao, recusarSolicitacao, cancelarSolicitacao } = useReservas();

  const [salas, setSalas] = useState<Sala[]>(initialSalas);
  const [modalReserva, setModalReserva] = useState(false);
  const [modalSala, setModalSala] = useState<"add" | Sala | null>(null);
  const [recusarTarget, setRecusarTarget] = useState<Solicitacao | null>(null);
  const [salaToast, setSalaToast] = useState<string | null>(null);
  const [tab, setTab] = useState<"ambientes" | "minhas" | "aprovacoes">("ambientes");

  const isAluno = user.role === "Aluno";
  const isProfessor = user.role === "Professor";
  const isCoordenador = user.role === "Coordenador";

  const minhasSolicitacoes = solicitacoes.filter((s) => s.solicitante === user.nome);
  const pendentesParaProfessor = solicitacoes.filter((s) =>
    s.tipo === "aluno_para_professor" &&
    s.professorResponsavel === user.nome &&
    (s.status === "Pendente" || s.status === "Em análise")
  );
  // Coordenador only sees auth_required from their own nucleo (or all if no nucleo)
  const coordNucleo = user.nucleo;
  const pendentesParaCoordenador = solicitacoes.filter((s) =>
    s.tipo === "auth_required" &&
    (s.status === "Em análise" || s.status === "Pendente") &&
    (!coordNucleo || !s.nucleoSolicitante || s.nucleoSolicitante === coordNucleo)
  );
  // All auth_required visible to coordenador (for the full list tab) — filtered by nucleo
  const todasAuthCoordenador = solicitacoes.filter((s) =>
    s.tipo === "auth_required" &&
    (!coordNucleo || !s.nucleoSolicitante || s.nucleoSolicitante === coordNucleo)
  );

  const handleSaveSala = (data: Omit<Sala, "id">) => {
    if (modalSala === "add") {
      setSalas((p) => [...p, { ...data, id: Date.now() }]);
      setSalaToast(`Sala "${data.nome}" cadastrada!`);
    } else if (modalSala && typeof modalSala !== "string") {
      setSalas((p) => p.map((s) => s.id === (modalSala as Sala).id ? { ...data, id: s.id } : s));
      setSalaToast(`Sala "${data.nome}" atualizada!`);
    }
    setModalSala(null);
    setTimeout(() => setSalaToast(null), 4000);
  };

  const toggleMaintenance = (sala: Sala) => {
    setSalas((p) =>
      p.map((s) => s.id === sala.id ? { ...s, status: s.status === "Manutenção" ? "Disponível" : "Manutenção" } : s)
    );
  };

  // Pending count drives the red urgency badge (Professor / Coordenador)
  const pendingCount = isProfessor
    ? pendentesParaProfessor.length
    : isCoordenador
    ? pendentesParaCoordenador.length
    : 0;

  // Total count shown on the Admin "Todas as Reservas" tab
  // Only count active reservations (exclude cancelled) so the badge decreases when admin cancels
  const totalCount = solicitacoes.filter((s) => s.status !== "Cancelado").length;

  const tabs = [
    { key: "ambientes", label: "Ambientes", show: true, count: null as number | null, urgent: false },
    { key: "minhas", label: isAluno ? "Minhas Solicitações" : "Minhas Reservas", show: true, count: minhasSolicitacoes.length, urgent: false },
    {
      key: "aprovacoes",
      label: isProfessor ? "Solicitações de Alunos" : isCoordenador ? "Autorizações" : "Todas as Reservas",
      show: permissions.canApproveStudentRequests || permissions.canApproveAuthRequests || permissions.canViewAllReservas,
      count: isAdmin ? totalCount : pendingCount,
      urgent: !isAdmin && pendingCount > 0,
    },
  ].filter((t) => t.show);

  return (
    <>
      {modalReserva && (
        <SolicitacaoModal salas={salas} onClose={() => setModalReserva(false)} isAluno={isAluno} isProfessor={isProfessor} />
      )}
      {modalSala && (
        <SalaModal
          onClose={() => setModalSala(null)}
          onSave={handleSaveSala}
          sala={modalSala === "add" ? undefined : (modalSala as Sala)}
        />
      )}
      {recusarTarget && (
        <RecusarModal
          s={recusarTarget}
          onRecusar={(obs) => { recusarSolicitacao(recusarTarget.id, user.nome, obs); setRecusarTarget(null); }}
          onClose={() => setRecusarTarget(null)}
        />
      )}

      {salaToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium"
          style={{ backgroundColor: "#EAF5EA", border: "1px solid #C2E2C2", color: "#2B5E2B" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          {salaToast}
        </div>
      )}

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "#8B0019", letterSpacing: "0.08em" }}>GESTÃO</p>
            <h1 className="text-2xl font-bold" style={{ color: "#1E1B15" }}>{isAluno ? "Ambientes e Solicitações" : "Reservas"}</h1>
            <p className="text-sm mt-1" style={{ color: "#776D5B" }}>
              {isAluno ? "Consulte os ambientes disponíveis e envie solicitações de reserva." : "Consulte a disponibilidade dos ambientes e gerencie suas reservas."}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            {isAdmin && (
              <button onClick={() => setModalSala("add")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ backgroundColor: "#F5F2EB", color: "#3D382E", border: "1px solid #E7E0D5" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#EDE8DF"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F5F2EB"; }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                </svg>
                Adicionar Sala
                <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: "#FFF0F2", color: "#8B0019" }}>ADM</span>
              </button>
            )}
            {(permissions.canRequestReserva || permissions.canMakeDirectReserva) && (
              <button onClick={() => setModalReserva(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: "#8B0019" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#700010")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8B0019")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                {isAluno ? "Solicitar Reserva" : "Nova Reserva"}
              </button>
            )}
          </div>
        </div>

        {isAluno && (
          <div className="mb-5 px-4 py-3 rounded-xl flex items-center gap-3 text-xs" style={{ backgroundColor: "#E3ECEE", border: "1px solid #B0CDD2", color: "#1E5E60" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <span>Como <strong>Aluno</strong>, você pode consultar salas e enviar solicitações. As reservas precisam ser aprovadas pelo professor responsável.</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ backgroundColor: "#F3EFEA" }}>
          {tabs.map((t) => {
            const isActive = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ backgroundColor: isActive ? "#FFF" : "transparent", color: isActive ? "#1E1B15" : "#776D5B", boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
                {t.label}
                {t.count !== null && (
                  t.urgent ? (
                    /* Pending items — red urgent pill */
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: "#8B0019", minWidth: "20px", justifyContent: "center" }}>
                      {t.count}
                    </span>
                  ) : (
                    /* Informational count — soft neutral pill */
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: isActive ? "#F3EFEA" : "rgba(0,0,0,0.06)", color: isActive ? "#776D5B" : "#999", minWidth: "20px", justifyContent: "center" }}>
                      {t.count}
                    </span>
                  )
                )}
              </button>
            );
          })}
        </div>

        {/* ── Ambientes tab ── */}
        {tab === "ambientes" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {salas.map((s) => {
              const sst = statusSalaStyle[s.status];
              const unavailable = s.status !== "Disponível";
              return (
                <div key={s.id}
                  className="rounded-2xl p-5 transition-all"
                  style={{ backgroundColor: unavailable ? "#FAF9F6" : "#FFF", border: `1px solid ${unavailable ? "#E7E0D5" : "#E7E0D5"}`, opacity: unavailable ? 0.85 : 1 }}
                  onMouseEnter={(e) => { if (!unavailable) e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"; }}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-bold" style={{ color: "#1E1B15" }}>{s.nome}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#776D5B" }}>{s.bloco} — {s.numero}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: sst.bg, color: sst.text }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sst.dot }} />{s.status}
                      </span>
                      {s.exigeAutorizacao && <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ backgroundColor: "#FFF8E6", color: "#805B00" }}>⚠ Autorização</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#776D5B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    </svg>
                    <span className="text-xs" style={{ color: "#776D5B" }}>Capacidade: <strong style={{ color: "#1E1B15" }}>{s.capacidade} pessoas</strong></span>
                    <span className="ml-1 text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "#F5F2EB", color: "#776D5B" }}>{s.tipo}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {s.recursos.map((r) => (
                      <span key={r} className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: "#F5F2EB", color: "#776D5B" }}>{r}</span>
                    ))}
                  </div>

                  {/* Maintenance message */}
                  {unavailable && (
                    <div className="mb-3 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: sst.bg, color: sst.text }}>
                      {s.status === "Manutenção" ? "Esta sala está em manutenção e não pode ser reservada." : "Esta sala está inativa."}
                    </div>
                  )}

                  {/* Actions */}
                  {!unavailable && (permissions.canRequestReserva || permissions.canMakeDirectReserva) && (
                    <button onClick={() => setModalReserva(true)}
                      className="w-full py-2 rounded-xl text-xs font-semibold transition-colors"
                      style={{ backgroundColor: "#FFF0F2", color: "#8B0019", border: "1px solid #FFD6D9" }}>
                      {isAluno ? "Solicitar esta sala" : "Reservar"}
                    </button>
                  )}

                  {isAdmin && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => setModalSala(s)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{ backgroundColor: "#F5F2EB", color: "#3D382E", border: "1px solid #E7E0D5" }}>
                        ✏ Editar
                      </button>
                      <button onClick={() => toggleMaintenance(s)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: s.status === "Manutenção" ? "#EAF5EA" : "#FFF8E6",
                          color: s.status === "Manutenção" ? "#2B5E2B" : "#805B00",
                          border: `1px solid ${s.status === "Manutenção" ? "#C2E2C2" : "#FFE19A"}`,
                        }}>
                        {s.status === "Manutenção" ? "✓ Reativar" : "⚠ Manutenção"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {isAdmin && (
              <button onClick={() => setModalSala("add")}
                className="rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all"
                style={{ backgroundColor: "#FAF9F6", border: "2px dashed #E7E0D5", minHeight: "200px" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#8B0019"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E7E0D5"; }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FFF0F2" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B0019" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </div>
                <span className="text-sm font-semibold" style={{ color: "#8B0019" }}>Nova Sala</span>
              </button>
            )}
          </div>
        )}

        {/* ── Minhas reservas tab ── */}
        {tab === "minhas" && (
          <>
            {minhasSolicitacoes.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#F5F2EB", color: "#776D5B" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                </div>
                <div className="text-sm font-semibold mb-1" style={{ color: "#3D382E" }}>Nenhuma {isAluno ? "solicitação" : "reserva"} encontrada</div>
                <div className="text-xs" style={{ color: "#776D5B" }}>
                  {isAluno ? 'Clique em "Solicitar Reserva" para enviar uma solicitação.' : 'Clique em "Nova Reserva" para criar uma reserva.'}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {minhasSolicitacoes.map((s) => (
                  <SolicitacaoCard key={s.id} s={s}
                    canApprove={false} canReject={false}
                    canCancel={s.status !== "Cancelado" && s.status !== "Recusado"}
                    onCancel={() => cancelarSolicitacao(s.id)}
                    currentUser={user.nome} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Aprovações / Todas tab ── */}
        {tab === "aprovacoes" && (
          <div>
            {permissions.canViewAllReservas && !isProfessor && !isCoordenador ? (
              /* Admin: all reservas with cancel */
              <>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-sm font-bold" style={{ color: "#1E1B15" }}>Todas as Reservas e Solicitações</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#FFF0F2", color: "#8B0019" }}>{solicitacoes.length} total</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {solicitacoes.map((s) => (
                    <SolicitacaoCard key={s.id} s={s}
                      canApprove={false} canReject={false}
                      canCancel={isAdmin && s.status !== "Cancelado"}
                      onCancel={() => cancelarSolicitacao(s.id)}
                      currentUser={user.nome} />
                  ))}
                </div>
              </>
            ) : isProfessor ? (
              /* Professor: student requests */
              <>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-sm font-bold" style={{ color: "#1E1B15" }}>Solicitações de Alunos</h2>
                  {pendentesParaProfessor.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: "#8B0019" }}>{pendentesParaProfessor.length} pendente{pendentesParaProfessor.length > 1 ? "s" : ""}</span>
                  )}
                </div>
                {solicitacoes.filter((s) => s.professorResponsavel === user.nome).length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-sm font-semibold mb-1" style={{ color: "#3D382E" }}>Nenhuma solicitação recebida</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {solicitacoes.filter((s) => s.professorResponsavel === user.nome).map((s) => (
                      <SolicitacaoCard key={s.id} s={s}
                        canApprove={permissions.canApproveStudentRequests && (s.status === "Pendente" || s.status === "Em análise")}
                        canReject={permissions.canApproveStudentRequests && (s.status === "Pendente" || s.status === "Em análise")}
                        canCancel={false}
                        onApprove={() => aprovarSolicitacao(s.id, user.nome)}
                        onReject={() => setRecusarTarget(s)}
                        currentUser={user.nome} />
                    ))}
                  </div>
                )}
              </>
            ) : isCoordenador ? (
              /* Coordenador: auth requests — filtered by own nucleo */
              <>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <h2 className="text-sm font-bold" style={{ color: "#1E1B15" }}>Solicitações que exigem autorização</h2>
                  {coordNucleo && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#E3ECEE", color: "#1E5E60" }}>
                      Núcleo {coordNucleo}
                    </span>
                  )}
                  {pendentesParaCoordenador.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: "#8B0019" }}>{pendentesParaCoordenador.length} aguardando</span>
                  )}
                </div>
                {todasAuthCoordenador.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-sm font-semibold mb-1" style={{ color: "#3D382E" }}>Nenhuma solicitação de autorização{coordNucleo ? ` para o Núcleo ${coordNucleo}` : ""}</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {todasAuthCoordenador.map((s) => (
                      <SolicitacaoCard key={s.id} s={s}
                        canApprove={s.status === "Pendente" || s.status === "Em análise"}
                        canReject={s.status === "Pendente" || s.status === "Em análise"}
                        canCancel={false}
                        onApprove={() => aprovarSolicitacao(s.id, user.nome)}
                        onReject={() => setRecusarTarget(s)}
                        currentUser={user.nome} />
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}
