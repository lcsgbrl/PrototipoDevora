import { useState } from "react";
import { useMembers, Member } from "@/context/MembersContext";
import { useAuth, NUCLEOS } from "@/context/AuthContext";
import { useAcademic, TURNOS } from "@/context/AcademicContext";

const funcaoBadge: Record<string, { bg: string; text: string }> = {
  Administrador: { bg: "#FFF0F2", text: "#8B0019" },
  Professor:     { bg: "#E8EFE2", text: "#3C5E53" },
  Coordenador:  { bg: "#E3ECEE", text: "#154749" },
  Aluno:        { bg: "#EAF5EA", text: "#2B5E2B" },
};

const statusBadge: Record<string, { bg: string; text: string; dot: string }> = {
  Ativo:                { bg: "#EAF5EA", text: "#2B5E2B", dot: "#4A9A4A" },
  Inativo:              { bg: "#F5F2EB", text: "#776D5B", dot: "#A8A09A" },
  Pendente:             { bg: "#FFF8E6", text: "#805B00", dot: "#B08A00" },
  "Aguardando Correção":{ bg: "#FDF0F2", text: "#991B1B", dot: "#C0303F" },
};

const FUNCOES = ["Administrador", "Professor", "Coordenador", "Aluno"];
const DEPTOS = ["TI", "Ciências", "Matemática", "Física", "Química", "Pedagogia", "Administração", "Computação", "Engenharia", "Outros"];

const departamentos = [
  { nome: "Tecnologia", color: "#8B0019", bg: "#FFF0F2" },
  { nome: "Administração", color: "#1E5E60", bg: "#E3ECEE" },
  { nome: "Coordenação", color: "#3C5E53", bg: "#E8EFE2" },
  { nome: "Professores", color: "#B82E3E", bg: "#FFF0F2" },
  { nome: "Outros", color: "#776D5B", bg: "#F5F2EB" },
];

const avatarColors = ["#8B0019", "#1E5E60", "#3C5E53", "#B82E3E", "#700010", "#154749", "#54000B"];
function getAvatarColor(id: number) { return avatarColors[id % avatarColors.length]; }

const iStyle = { backgroundColor: "#F5F2EB", border: "1px solid #E7E0D5", color: "#1E1B15" } as const;
const iCls = "w-full px-3.5 py-2.5 text-sm rounded-xl outline-none";
const fIn = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = "#8B0019"; e.target.style.boxShadow = "0 0 0 3px rgba(139,0,25,0.08)";
};
const fOut = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = "#E7E0D5"; e.target.style.boxShadow = "none";
};

/* ── Add / Edit Member Modal ── */
function MemberModal({
  onClose, onSave, member,
}: {
  onClose: () => void;
  onSave: (data: { nome: string; email: string; funcao: string; depto: string; nucleo?: string; status: Member["status"] }) => void;
  member?: Member;
}) {
  const editing = !!member;
  const { nucleos: acadNucleos } = useAcademic();
  const [form, setForm] = useState({
    nome: member?.nome ?? "",
    email: member?.email ?? "",
    funcao: member?.funcao ?? "Aluno",
    depto: member?.depto ?? "TI",
    nucleo: member?.nucleo ?? "",
    status: (member?.status ?? "Ativo") as Member["status"],
  });
  const [error, setError] = useState("");

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) { setError("O nome é obrigatório."); return; }
    if (!form.email.trim() || !form.email.includes("@")) { setError("Informe um e-mail válido."); return; }
    onSave({ ...form, nucleo: form.nucleo || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(14,12,9,0.55)" }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid #F3EFEA" }}>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: "#FFF0F2", color: "#8B0019" }}>ADM</span>
              <h2 className="text-base font-bold" style={{ color: "#1E1B15" }}>{editing ? "Editar Membro" : "Adicionar Membro"}</h2>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "#776D5B" }}>{editing ? `Editando: ${member!.nome}` : "Cadastre um novo membro manualmente"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "#776D5B", backgroundColor: "#F5F2EB" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Nome completo <span style={{ color: "#8B0019" }}>*</span></label>
            <input name="nome" value={form.nome} onChange={handle} placeholder="Ex: Maria Oliveira" className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>E-mail <span style={{ color: "#8B0019" }}>*</span></label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="nome@inst.edu.br" className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Função</label>
              <select name="funcao" value={form.funcao} onChange={handle} className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut}>
                {FUNCOES.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Departamento</label>
              <select name="depto" value={form.depto} onChange={handle} className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut}>
                {DEPTOS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>
                Núcleo
                <span className="font-normal ml-1" style={{ color: "#A8A09A" }}>(deixe em branco para acesso global)</span>
              </label>
              <select name="nucleo" value={form.nucleo} onChange={handle} className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut}>
                <option value="">— Global (sem restrição) —</option>
                {acadNucleos.filter(n => n.ativo).map(n => <option key={n.id} value={n.nome}>{n.nome}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Status</label>
            <div className="flex gap-2">
              {(["Ativo", "Inativo"] as Member["status"][]).map((s) => {
                const st = statusBadge[s];
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
          {error && (
            <div className="px-4 py-3 rounded-xl text-xs" style={{ backgroundColor: "#FDF0F2", border: "1px solid #F5C2C8", color: "#991B1B" }}>{error}</div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F5F2EB", color: "#776D5B", border: "1px solid #E7E0D5" }}>Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#8B0019" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#700010")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8B0019")}>
              {editing ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Confirm Delete Dialog ── */
function ConfirmDeleteModal({ member, onConfirm, onClose }: { member: Member; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(14,12,9,0.55)" }}>
      <div className="w-full max-w-sm rounded-2xl p-6 text-center" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#FDF0F2" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#991B1B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
          </svg>
        </div>
        <h3 className="text-base font-bold mb-2" style={{ color: "#1E1B15" }}>Remover membro?</h3>
        <p className="text-sm leading-relaxed mb-6" style={{ color: "#776D5B" }}>
          <strong style={{ color: "#1E1B15" }}>{member.nome}</strong> será removido permanentemente do sistema. Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F5F2EB", color: "#776D5B", border: "1px solid #E7E0D5" }}>Cancelar</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#991B1B" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#7A1010")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#991B1B")}>
            Remover
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Registration Review Modal (Admin edit + action) ── */
function RegistrationReviewModal({ member, onClose, onApprove, onReject, onCorrecao, onSave }: {
  member: Member;
  onClose: () => void;
  onApprove: () => void;
  onReject: (motivo: string) => void;
  onCorrecao: (motivo: string) => void;
  onSave: (data: Partial<Member>) => void;
}) {
  const { nucleos, getCursosByNucleo, getTurmasByCurso, getDisciplinasByTurma } = useAcademic();
  const [editing, setEditing] = useState(false);
  const [action, setAction] = useState<"" | "reject" | "correcao">("");
  const [motivo, setMotivo] = useState("");
  const [form, setForm] = useState({
    nome: member.nome, email: member.email, cpf: member.cpf ?? "",
    funcao: member.funcao, nucleo: member.nucleo ?? "", curso: member.curso ?? "",
    turno: member.turno ?? "", turma: member.turma ?? "",
    disciplinas: member.disciplinas ?? [],
  });

  const nucleoObj = nucleos.find(n => n.nome === form.nucleo);
  const cursoList = nucleoObj ? getCursosByNucleo(nucleoObj.id) : [];
  const cursoObj = cursoList.find(c => c.nome === form.curso);
  const turmaList = cursoObj ? getTurmasByCurso(cursoObj.id) : [];
  const turmaObj = turmaList.find(t => t.nome === form.turma);
  const discList = turmaObj ? getDisciplinasByTurma(turmaObj.id) : [];

  const handleForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === "nucleo") { next.curso = ""; next.turma = ""; next.disciplinas = []; }
      if (name === "curso")  { next.turma = ""; next.disciplinas = []; }
      if (name === "turma")  { next.disciplinas = []; }
      return next;
    });
  };
  const toggleDisc = (nome: string) =>
    setForm(prev => ({ ...prev, disciplinas: prev.disciplinas.includes(nome) ? prev.disciplinas.filter(d => d !== nome) : [...prev.disciplinas, nome] }));

  const iStyle2 = { backgroundColor: "#F5F2EB", border: "1px solid #E7E0D5", color: "#1E1B15" } as const;
  const iCls2 = "w-full px-3 py-2 text-sm rounded-xl outline-none";

  const saveEdit = () => {
    onSave({ nome: form.nome, email: form.email, cpf: form.cpf, funcao: form.funcao, nucleo: form.nucleo || undefined, curso: form.curso || undefined, turno: form.turno || undefined, turma: form.turma || undefined, disciplinas: form.disciplinas.length ? form.disciplinas : undefined });
    setEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(14,12,9,0.55)" }}>
      <div className="w-full max-w-xl rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5", boxShadow: "0 24px 60px rgba(0,0,0,0.18)", maxHeight: "92vh", overflowY: "auto" }}>
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between sticky top-0 z-10" style={{ borderBottom: "1px solid #F3EFEA", backgroundColor: "#FFF" }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: "#1E1B15" }}>Analisar Solicitação de Cadastro</h2>
            <p className="text-xs mt-0.5" style={{ color: "#776D5B" }}>{member.nome}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "#776D5B", backgroundColor: "#F5F2EB" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Correction message if any */}
          {member.motivoCorrecao && (
            <div className="px-4 py-3 rounded-xl text-xs" style={{ backgroundColor: "#FDF0F2", border: "1px solid #F5C2C8", color: "#991B1B" }}>
              <strong>Motivo da correção solicitada:</strong> {member.motivoCorrecao}
            </div>
          )}

          {editing ? (
            /* Edit form */
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="block text-xs font-semibold mb-1" style={{ color: "#3D382E" }}>Nome</label><input name="nome" value={form.nome} onChange={handleForm} className={iCls2} style={iStyle2} /></div>
                <div><label className="block text-xs font-semibold mb-1" style={{ color: "#3D382E" }}>E-mail</label><input name="email" value={form.email} onChange={handleForm} className={iCls2} style={iStyle2} /></div>
                <div><label className="block text-xs font-semibold mb-1" style={{ color: "#3D382E" }}>CPF</label><input name="cpf" value={form.cpf} onChange={handleForm} className={iCls2} style={iStyle2} /></div>
                <div><label className="block text-xs font-semibold mb-1" style={{ color: "#3D382E" }}>Perfil</label>
                  <select name="funcao" value={form.funcao} onChange={handleForm} className={iCls2} style={iStyle2}>
                    {["Aluno","Professor","Coordenador"].map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-semibold mb-1" style={{ color: "#3D382E" }}>Núcleo</label>
                  <select name="nucleo" value={form.nucleo} onChange={handleForm} className={iCls2} style={iStyle2}>
                    <option value="">— Global —</option>
                    {nucleos.filter(n => n.ativo).map(n => <option key={n.id} value={n.nome}>{n.nome}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-semibold mb-1" style={{ color: "#3D382E" }}>Curso</label>
                  <select name="curso" value={form.curso} onChange={handleForm} disabled={!form.nucleo} className={iCls2} style={{ ...iStyle2, opacity: form.nucleo ? 1 : 0.5 }}>
                    <option value="">— Selecione —</option>
                    {cursoList.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-semibold mb-1" style={{ color: "#3D382E" }}>Turno</label>
                  <select name="turno" value={form.turno} onChange={handleForm} className={iCls2} style={iStyle2}>
                    <option value="">— Selecione —</option>
                    {TURNOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-semibold mb-1" style={{ color: "#3D382E" }}>Turma</label>
                  <select name="turma" value={form.turma} onChange={handleForm} disabled={!form.curso} className={iCls2} style={{ ...iStyle2, opacity: form.curso ? 1 : 0.5 }}>
                    <option value="">— Selecione —</option>
                    {turmaList.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
                  </select>
                </div>
              </div>
              {discList.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: "#3D382E" }}>Disciplinas</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {discList.map(d => {
                      const sel = form.disciplinas.includes(d.nome);
                      return (
                        <button key={d.id} type="button" onClick={() => toggleDisc(d.nome)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left"
                          style={{ backgroundColor: sel ? "#FFF0F2" : "#F5F2EB", color: sel ? "#8B0019" : "#776D5B", border: `1px solid ${sel ? "#FFD6D9" : "#E7E0D5"}` }}>
                          <span className="w-3 h-3 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: sel ? "#8B0019" : "#E7E0D5" }}>
                            {sel && <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                          </span>
                          <span className="truncate">{d.nome}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F5F2EB", color: "#776D5B", border: "1px solid #E7E0D5" }}>Cancelar</button>
                <button onClick={saveEdit} className="flex-1 py-2 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#8B0019" }}>Salvar edição</button>
              </div>
            </div>
          ) : (
            /* View mode */
            <>
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl text-xs" style={{ backgroundColor: "#FAF9F6", border: "1px solid #F3EFEA" }}>
                {[
                  ["Nome", form.nome], ["E-mail", form.email],
                  ["CPF/ID", form.cpf || "—"], ["Perfil", form.funcao],
                  ["Núcleo", form.nucleo || "Global"], ["Curso", form.curso || "—"],
                  ["Turno", form.turno || "—"], ["Turma", form.turma || "—"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ color: "#776D5B" }}>{label}</div>
                    <div className="font-semibold mt-0.5" style={{ color: "#1E1B15" }}>{value}</div>
                  </div>
                ))}
                {form.disciplinas.length > 0 && (
                  <div className="col-span-2">
                    <div style={{ color: "#776D5B" }}>Disciplinas</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {form.disciplinas.map(d => (
                        <span key={d} className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#E3ECEE", color: "#1E5E60" }}>{d}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action form: reject or correction */}
              {action !== "" && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold" style={{ color: "#3D382E" }}>
                    {action === "reject" ? "Motivo da rejeição" : "Mensagem de correção"} <span style={{ color: "#8B0019" }}>*</span>
                  </label>
                  <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={3} placeholder={action === "reject" ? "Explique o motivo da rejeição..." : "Descreva o que precisa ser corrigido..."}
                    className="w-full px-3 py-2 text-sm rounded-xl outline-none resize-none"
                    style={{ backgroundColor: "#F5F2EB", border: "1px solid #E7E0D5", color: "#1E1B15" }} />
                  <div className="flex gap-2">
                    <button onClick={() => { setAction(""); setMotivo(""); }} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F5F2EB", color: "#776D5B", border: "1px solid #E7E0D5" }}>Cancelar</button>
                    <button onClick={() => { if (!motivo.trim()) return; action === "reject" ? onReject(motivo) : onCorrecao(motivo); }}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
                      style={{ backgroundColor: action === "reject" ? "#991B1B" : "#805B00" }}>
                      {action === "reject" ? "Confirmar rejeição" : "Enviar solicitação"}
                    </button>
                  </div>
                </div>
              )}

              {/* Main action buttons */}
              {action === "" && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button onClick={() => setEditing(true)} className="col-span-2 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F5F2EB", color: "#776D5B", border: "1px solid #E7E0D5" }}>
                    ✏️ Editar dados antes de aprovar
                  </button>
                  <button onClick={() => setAction("reject")} className="py-2 rounded-xl text-sm font-semibold" style={{ backgroundColor: "#FDF0F2", color: "#991B1B", border: "1px solid #F5C2C8" }}>
                    Rejeitar
                  </button>
                  <button onClick={() => setAction("correcao")} className="py-2 rounded-xl text-sm font-semibold" style={{ backgroundColor: "#FFF8E6", color: "#805B00", border: "1px solid #FFE19A" }}>
                    Solicitar correção
                  </button>
                  <button onClick={onApprove} className="col-span-2 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#2B5E2B" }}>
                    ✓ Aprovar cadastro
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function Membros() {
  const { members, approveMember, rejectMember, solicitarCorrecao, removeMember, addMemberDirectly, updateMember, toggleMemberStatus } = useMembers();
  const { isAdmin, user: authUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"membros" | "cadastros">("membros");
  const [search, setSearch] = useState("");
  const [filterFuncao, setFilterFuncao] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterNucleo, setFilterNucleo] = useState("Todos");
  const [addModal, setAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [reviewTarget, setReviewTarget] = useState<Member | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [toastOk, setToastOk] = useState(true);

  const showToast = (msg: string, ok = true) => { setToast(msg); setToastOk(ok); setTimeout(() => setToast(null), 3500); };

  const pendingRequests = members.filter(m => m.source === "request" && (m.status === "Pendente" || m.status === "Aguardando Correção"));

  const filtered = members.filter((m) => {
    if (!isAdmin && authUser.nucleo) {
      if (m.nucleo && m.nucleo !== authUser.nucleo) return false;
    }
    // Exclude pending requests from the Membros tab
    if (activeTab === "membros" && m.source === "request" && (m.status === "Pendente" || m.status === "Aguardando Correção")) return false;
    const q = search.toLowerCase();
    if (q && !m.nome.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q)) return false;
    if (filterFuncao !== "Todos" && m.funcao !== filterFuncao) return false;
    if (filterStatus !== "Todos" && m.status !== filterStatus) return false;
    if (filterNucleo !== "Todos" && (m.nucleo ?? "Global") !== filterNucleo) return false;
    return true;
  });

  const deptoCounts = departamentos.map((d) => ({
    ...d,
    count: members.filter((m) => m.status === "Ativo" && m.depto.toLowerCase().includes(d.nome.slice(0, 4).toLowerCase())).length || Math.floor(Math.random() * 20 + 5),
  }));

  return (
    <>
      {addModal && (
        <MemberModal
          onClose={() => setAddModal(false)}
          onSave={(data) => {
            addMemberDirectly({ ...data, status: data.status as Member["status"] });
            setAddModal(false);
            showToast(`${data.nome} adicionado(a) com sucesso!`);
          }}
        />
      )}
      {editTarget && (
        <MemberModal
          member={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={(data) => {
            updateMember(editTarget.id, data);
            setEditTarget(null);
            showToast("Membro atualizado com sucesso!");
          }}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          member={deleteTarget}
          onConfirm={() => {
            removeMember(deleteTarget.id);
            setDeleteTarget(null);
            showToast("Membro removido.");
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {reviewTarget && (
        <RegistrationReviewModal
          member={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onApprove={() => { approveMember(reviewTarget.id); setReviewTarget(null); showToast(`${reviewTarget.nome} aprovado(a)!`); }}
          onReject={(motivo) => { rejectMember(reviewTarget.id, motivo); setReviewTarget(null); showToast("Cadastro rejeitado.", false); }}
          onCorrecao={(motivo) => { solicitarCorrecao(reviewTarget.id, motivo); setReviewTarget(null); showToast("Correção solicitada."); }}
          onSave={(data) => { updateMember(reviewTarget.id, data); setReviewTarget({ ...reviewTarget, ...data } as Member); showToast("Dados atualizados."); }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium"
          style={{ backgroundColor: toastOk ? "#EAF5EA" : "#FDF0F2", border: `1px solid ${toastOk ? "#C2E2C2" : "#F5C2C8"}`, color: toastOk ? "#2B5E2B" : "#991B1B" }}>
          {toastOk
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
          {toast}
        </div>
      )}

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "#8B0019", letterSpacing: "0.08em" }}>EQUIPE</p>
            <h1 className="text-2xl font-bold" style={{ color: "#1E1B15" }}>Organização de Membros</h1>
            <p className="text-sm mt-1" style={{ color: "#776D5B" }}>Gerencie os membros e organize as informações da equipe.</p>
          </div>
          {isAdmin && activeTab === "membros" && (
            <button onClick={() => setAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white whitespace-nowrap"
              style={{ backgroundColor: "#8B0019" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#700010")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#8B0019")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Adicionar Membro
            </button>
          )}
        </div>

        {/* Tabs — admin only sees Solicitações de Cadastro */}
        {isAdmin && (
          <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ backgroundColor: "#F3EFEA" }}>
            {([
              { key: "membros",   label: "Membros",               count: null },
              { key: "cadastros", label: "Solicitações de Cadastro", count: pendingRequests.length },
            ] as const).map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ backgroundColor: activeTab === t.key ? "#FFF" : "transparent", color: activeTab === t.key ? "#1E1B15" : "#776D5B", boxShadow: activeTab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
                {t.label}
                {t.count !== null && t.count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: "#8B0019", minWidth: 20, textAlign: "center" }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── CADASTROS TAB ── */}
        {activeTab === "cadastros" && isAdmin && (
          <div>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "#EAF5EA" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2B5E2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="text-base font-bold mb-1" style={{ color: "#1E1B15" }}>Nenhuma solicitação pendente</div>
                <div className="text-sm" style={{ color: "#776D5B" }}>Todas as solicitações de cadastro foram processadas.</div>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map(m => {
                  const s = statusBadge[m.status] ?? statusBadge["Pendente"];
                  const f = funcaoBadge[m.funcao] ?? { bg: "#F3EFEA", text: "#776D5B" };
                  return (
                    <div key={m.id} className="rounded-2xl p-5" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ backgroundColor: getAvatarColor(m.id) }}>
                            {m.initials}
                          </div>
                          <div>
                            <div className="text-sm font-bold" style={{ color: "#1E1B15" }}>{m.nome}</div>
                            <div className="text-xs mt-0.5" style={{ color: "#776D5B" }}>{m.email}</div>
                            {m.cpf && <div className="text-xs mt-0.5" style={{ color: "#A8A09A" }}>CPF: {m.cpf}</div>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.text }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />{m.status}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: f.bg, color: f.text }}>{m.funcao}</span>
                        </div>
                      </div>

                      {/* Academic info grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl mb-4 text-xs" style={{ backgroundColor: "#FAF9F6" }}>
                        {[["Núcleo", m.nucleo || "—"], ["Curso", m.curso || "—"], ["Turno", m.turno || "—"], ["Turma", m.turma || "—"]].map(([label, val]) => (
                          <div key={label}>
                            <div style={{ color: "#776D5B" }}>{label}</div>
                            <div className="font-semibold mt-0.5" style={{ color: "#1E1B15" }}>{val}</div>
                          </div>
                        ))}
                        {m.disciplinas && m.disciplinas.length > 0 && (
                          <div className="col-span-2 sm:col-span-4">
                            <div style={{ color: "#776D5B" }}>Disciplinas</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {m.disciplinas.map(d => (
                                <span key={d} className="px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#E3ECEE", color: "#1E5E60" }}>{d}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Correction note */}
                      {m.motivoCorrecao && (
                        <div className="px-3 py-2 rounded-lg text-xs mb-4" style={{ backgroundColor: "#FDF0F2", border: "1px solid #F5C2C8", color: "#991B1B" }}>
                          <strong>Correção solicitada:</strong> {m.motivoCorrecao}
                        </div>
                      )}

                      <button onClick={() => setReviewTarget(m)}
                        className="w-full py-2 rounded-xl text-sm font-semibold"
                        style={{ backgroundColor: "#FFF0F2", color: "#8B0019", border: "1px solid #FFD6D9" }}>
                        Analisar solicitação →
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── MEMBROS TAB ── */}
        {activeTab === "membros" && (
          <>
            {/* Department cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
              {deptoCounts.map((d) => (
                <div key={d.nome} className="rounded-2xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E0D5" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: d.bg, color: d.color }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div className="text-xl font-extrabold" style={{ color: d.color }}>{d.count}</div>
                  <div className="text-xs font-medium mt-0.5" style={{ color: "#776D5B" }}>{d.nome}</div>
                </div>
              ))}
            </div>

            {/* Search and filters */}
            <div className="p-4 rounded-2xl mb-5 flex flex-wrap gap-3 items-end" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E0D5" }}>
              <div className="flex-1 min-w-48">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Pesquisar</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#776D5B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nome ou e-mail…"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl outline-none"
                    style={{ backgroundColor: "#F5F2EB", border: "1px solid #E7E0D5", color: "#1E1B15" }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Função</label>
                <select value={filterFuncao} onChange={(e) => setFilterFuncao(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl outline-none"
                  style={{ backgroundColor: "#F5F2EB", border: "1px solid #E7E0D5", color: "#1E1B15" }}>
                  {["Todos", "Administrador", "Professor", "Coordenador", "Aluno"].map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Status</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl outline-none"
                  style={{ backgroundColor: "#F5F2EB", border: "1px solid #E7E0D5", color: "#1E1B15" }}>
                  {["Todos", "Ativo", "Inativo", "Pendente"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              {isAdmin && (
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Núcleo</label>
                  <select value={filterNucleo} onChange={(e) => setFilterNucleo(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl outline-none"
                    style={{ backgroundColor: "#F5F2EB", border: "1px solid #E7E0D5", color: "#1E1B15" }}>
                    {["Todos", "Global", ...NUCLEOS].map((n) => <option key={n}>{n}</option>)}
                  </select>
                </div>
              )}
              <div className="ml-auto text-xs" style={{ color: "#776D5B" }}>{filtered.length} membro{filtered.length !== 1 ? "s" : ""}</div>
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E0D5" }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "#FAF9F6", borderBottom: "1px solid #F3EFEA" }}>
                      {["Membro", "E-mail", "Função", "Núcleo", "Turma", "Status", "Ações"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold" style={{ color: "#776D5B" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m, i) => {
                      const f = funcaoBadge[m.funcao] ?? { bg: "#F3EFEA", text: "#776D5B" };
                      const s = statusBadge[m.status] ?? statusBadge["Pendente"];
                      return (
                        <tr key={m.id} className="hover:bg-neutral-50 transition-colors"
                          style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F3EFEA" : "none" }}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: getAvatarColor(m.id) }}>
                                {m.initials}
                              </div>
                              <div>
                                <div className="text-xs font-semibold" style={{ color: "#1E1B15" }}>{m.nome}</div>
                                {m.curso && <div className="text-xs mt-0.5" style={{ color: "#776D5B" }}>{m.curso}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs" style={{ color: "#776D5B" }}>{m.email}</td>
                          <td className="px-5 py-3.5">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: f.bg, color: f.text }}>{m.funcao}</span>
                          </td>
                          <td className="px-5 py-3.5 text-xs">
                            {m.nucleo
                              ? <span className="px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#E3ECEE", color: "#1E5E60" }}>{m.nucleo}</span>
                              : <span style={{ color: "#A8A09A" }}>Global</span>}
                          </td>
                          <td className="px-5 py-3.5 text-xs" style={{ color: "#776D5B" }}>{m.turma || "—"}</td>
                          <td className="px-5 py-3.5">
                            {isAdmin ? (
                              <button onClick={() => toggleMemberStatus(m.id)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer"
                                style={{ backgroundColor: s.bg, color: s.text }}
                                title="Clique para alternar status"
                                onMouseEnter={e => { e.currentTarget.style.opacity = "0.75"; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
                                {m.status}
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.text }}>
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
                                {m.status}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              {isAdmin ? (
                                <>
                                  <button onClick={() => setEditTarget(m)} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: "#FFF0F2", color: "#8B0019", border: "1px solid #FFD6D9" }}>Editar</button>
                                  <button onClick={() => setDeleteTarget(m)} className="p-1.5 rounded-lg" style={{ backgroundColor: "#FDF0F2", color: "#991B1B" }} title="Remover">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                                      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                                    </svg>
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs" style={{ color: "#A8A09A" }}>—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filtered.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "#F5F2EB", color: "#776D5B" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                    <div className="text-sm font-semibold mb-1" style={{ color: "#3D382E" }}>Nenhum membro encontrado</div>
                    <div className="text-xs" style={{ color: "#776D5B" }}>Tente ajustar os filtros de busca</div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
