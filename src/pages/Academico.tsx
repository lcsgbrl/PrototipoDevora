import { useState } from "react";
import { useAcademic, NucleoAcad, Curso, Turma, Disciplina, TURNOS } from "@/context/AcademicContext";
import { useMembers } from "@/context/MembersContext";
import { useAuth } from "@/context/AuthContext";

// ── Shared styles ─────────────────────────────────────────────────────────────
const iStyle = { backgroundColor: "#F5F2EB", border: "1px solid #E7E0D5", color: "#1E1B15" } as const;
const iCls   = "w-full px-3.5 py-2.5 text-sm rounded-xl outline-none";
const fIn    = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { e.target.style.borderColor = "#8B0019"; e.target.style.boxShadow = "0 0 0 3px rgba(139,0,25,0.08)"; };
const fOut   = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { e.target.style.borderColor = "#E7E0D5"; e.target.style.boxShadow = "none"; };

// ── Modal shell ───────────────────────────────────────────────────────────────
function ModalShell({ title, sub, onClose, children }: { title: string; sub?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(14,12,9,0.55)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5", boxShadow: "0 24px 60px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}>
        <div className="px-6 py-5 flex items-center justify-between sticky top-0 z-10" style={{ borderBottom: "1px solid #F3EFEA", backgroundColor: "#FFF" }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: "#1E1B15" }}>{title}</h2>
            {sub && <p className="text-xs mt-0.5" style={{ color: "#776D5B" }}>{sub}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "#776D5B", backgroundColor: "#F5F2EB" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Delete confirmation modal ─────────────────────────────────────────────────
function DeleteConfirm({ title, impacts, onConfirmDeactivate, onConfirmDelete, onCancel }: {
  title: string;
  impacts: string[];
  onConfirmDeactivate?: () => void;
  onConfirmDelete: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(14,12,9,0.65)" }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5", boxShadow: "0 24px 60px rgba(0,0,0,0.22)" }}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: "#FDF0F2" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#991B1B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h3 className="text-sm font-bold mb-1" style={{ color: "#1E1B15" }}>{title}</h3>
        {impacts.length > 0 && (
          <div className="mt-3 mb-4 p-3 rounded-xl text-xs space-y-1" style={{ backgroundColor: "#FFF8E6", border: "1px solid #FFE19A", color: "#805B00" }}>
            <div className="font-semibold mb-1">Impacto da ação:</div>
            {impacts.map((imp, i) => <div key={i}>• {imp}</div>)}
          </div>
        )}
        <div className="flex flex-col gap-2 mt-4">
          {onConfirmDeactivate && (
            <button onClick={onConfirmDeactivate} className="w-full py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: "#FFF8E6", color: "#805B00", border: "1px solid #FFE19A" }}>
              Desativar (recomendado)
            </button>
          )}
          <button onClick={onConfirmDelete} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#991B1B" }}>
            Excluir permanentemente
          </button>
          <button onClick={onCancel} className="w-full py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F5F2EB", color: "#776D5B", border: "1px solid #E7E0D5" }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className="w-10 h-5 rounded-full transition-all flex-shrink-0 relative"
      style={{ backgroundColor: value ? "#8B0019" : "#D1CBC2" }}>
      <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all" style={{ left: value ? "calc(100% - 18px)" : "2px" }} />
    </button>
  );
}

// ── Núcleos tab (Admin only) ──────────────────────────────────────────────────
function NucleosTab({ showToast }: { showToast: (m: string) => void }) {
  const { nucleos, cursos, addNucleo, updateNucleo, deleteNucleo } = useAcademic();
  const { members } = useMembers();
  const [modal, setModal] = useState<null | "add" | NucleoAcad>(null);
  const [delTarget, setDelTarget] = useState<NucleoAcad | null>(null);
  const [form, setForm] = useState({ nome: "", descricao: "", ativo: true });
  const [formErr, setFormErr] = useState("");

  const openAdd  = () => { setForm({ nome: "", descricao: "", ativo: true }); setFormErr(""); setModal("add"); };
  const openEdit = (n: NucleoAcad) => { setForm({ nome: n.nome, descricao: n.descricao, ativo: n.ativo }); setFormErr(""); setModal(n); };

  const save = () => {
    if (!form.nome.trim()) { setFormErr("Informe o nome do núcleo."); return; }
    if (modal === "add") {
      // Duplicate check
      if (nucleos.some(n => n.nome.toLowerCase() === form.nome.trim().toLowerCase())) {
        setFormErr("Já existe um núcleo com esse nome."); return;
      }
      addNucleo({ nome: form.nome.trim(), descricao: form.descricao, cursosIds: [], coordenadoresIds: [], ativo: form.ativo });
    } else if (modal && typeof modal === "object") {
      updateNucleo(modal.id, { nome: form.nome.trim(), descricao: form.descricao, ativo: form.ativo });
    }
    setModal(null);
    showToast(modal === "add" ? "Núcleo criado!" : "Núcleo atualizado!");
  };

  const handleDelete = (n: NucleoAcad) => setDelTarget(n);

  const impacts = (n: NucleoAcad): string[] => {
    const nCursos = cursos.filter(c => c.nucleoId === n.id);
    const usersCount = members.filter(m => m.nucleo === n.nome && m.status !== "Inativo").length;
    const res: string[] = [];
    if (nCursos.length) res.push(`${nCursos.length} curso(s) vinculado(s)`);
    if (usersCount) res.push(`${usersCount} membro(s) vinculado(s)`);
    return res;
  };

  return (
    <>
      {delTarget && (
        <DeleteConfirm
          title={`Remover núcleo "${delTarget.nome}"?`}
          impacts={impacts(delTarget)}
          onConfirmDeactivate={impacts(delTarget).length ? () => { updateNucleo(delTarget.id, { ativo: false }); setDelTarget(null); showToast("Núcleo desativado."); } : undefined}
          onConfirmDelete={() => { deleteNucleo(delTarget.id); setDelTarget(null); showToast("Núcleo excluído."); }}
          onCancel={() => setDelTarget(null)}
        />
      )}

      {modal !== null && (
        <ModalShell title={modal === "add" ? "Novo Núcleo" : "Editar Núcleo"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Nome <span style={{ color: "#8B0019" }}>*</span></label>
              <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Saúde" className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Descrição</label>
              <textarea value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} placeholder="Breve descrição do núcleo..." rows={2}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none resize-none" style={iStyle} onFocus={fIn} onBlur={fOut} />
            </div>
            <div className="flex items-center gap-2"><Toggle value={form.ativo} onChange={v => setForm(p => ({ ...p, ativo: v }))} /><span className="text-sm" style={{ color: "#3D382E" }}>Núcleo ativo</span></div>
            {formErr && <div className="px-3 py-2 rounded-xl text-xs" style={{ backgroundColor: "#FDF0F2", border: "1px solid #F5C2C8", color: "#991B1B" }}>{formErr}</div>}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F5F2EB", color: "#776D5B", border: "1px solid #E7E0D5" }}>Cancelar</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#8B0019" }}>Salvar</button>
            </div>
          </div>
        </ModalShell>
      )}

      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold" style={{ color: "#1E1B15" }}>{nucleos.length} núcleo{nucleos.length !== 1 ? "s" : ""}</h3>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: "#8B0019" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Núcleo
        </button>
      </div>

      <div className="space-y-3">
        {nucleos.map(n => {
          const nCursos = cursos.filter(c => c.nucleoId === n.id);
          const profs   = members.filter(m => m.nucleo === n.nome && m.funcao === "Professor");
          const alunos  = members.filter(m => m.nucleo === n.nome && m.funcao === "Aluno");
          return (
            <div key={n.id} className="rounded-2xl p-5" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: "#1E1B15" }}>{n.nome}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: n.ativo ? "#EAF5EA" : "#F5F2EB", color: n.ativo ? "#2B5E2B" : "#776D5B" }}>
                      {n.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  {n.descricao && <p className="text-xs mt-0.5" style={{ color: "#776D5B" }}>{n.descricao}</p>}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => openEdit(n)} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: "#FFF0F2", color: "#8B0019", border: "1px solid #FFD6D9" }}>Editar</button>
                  <button onClick={() => handleDelete(n)} className="p-1.5 rounded-lg" style={{ backgroundColor: "#FDF0F2", color: "#991B1B" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                {([["Cursos", nCursos.length], ["Professores", profs.length], ["Alunos", alunos.length]] as [string, number][]).map(([label, count]) => (
                  <div key={label} className="rounded-xl p-2.5" style={{ backgroundColor: "#FAF9F6" }}>
                    <div className="text-base font-extrabold" style={{ color: "#8B0019" }}>{count}</div>
                    <div style={{ color: "#776D5B" }}>{label}</div>
                  </div>
                ))}
              </div>
              {nCursos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {nCursos.map(c => (
                    <span key={c.id} className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#E3ECEE", color: "#1E5E60" }}>{c.nome}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Cursos tab ────────────────────────────────────────────────────────────────
function CursosTab({ scopedNucleoId, showToast }: { scopedNucleoId?: number; showToast: (m: string) => void }) {
  const { nucleos, cursos, turmas, addCurso, updateCurso, deleteCurso } = useAcademic();
  const { members } = useMembers();
  const [modal, setModal] = useState<null | "add" | Curso>(null);
  const [delTarget, setDelTarget] = useState<Curso | null>(null);
  const [form, setForm] = useState({ nome: "", nucleoId: scopedNucleoId ?? 0, ativo: true });
  const [formErr, setFormErr] = useState("");

  // If scoped, only show cursos for that nucleo
  const visibleCursos = scopedNucleoId ? cursos.filter(c => c.nucleoId === scopedNucleoId) : cursos;
  const availableNucleos = scopedNucleoId ? nucleos.filter(n => n.id === scopedNucleoId) : nucleos.filter(n => n.ativo);

  const openAdd  = () => { setForm({ nome: "", nucleoId: scopedNucleoId ?? (availableNucleos[0]?.id ?? 0), ativo: true }); setFormErr(""); setModal("add"); };
  const openEdit = (c: Curso) => { setForm({ nome: c.nome, nucleoId: c.nucleoId, ativo: c.ativo }); setFormErr(""); setModal(c); };

  const save = () => {
    if (!form.nome.trim()) { setFormErr("Informe o nome do curso."); return; }
    if (!form.nucleoId) { setFormErr("Selecione o Núcleo."); return; }
    if (modal === "add") {
      if (cursos.some(c => c.nucleoId === form.nucleoId && c.nome.toLowerCase() === form.nome.trim().toLowerCase())) {
        setFormErr("Já existe um curso com esse nome neste Núcleo."); return;
      }
      addCurso({ nome: form.nome.trim(), nucleoId: form.nucleoId, turmasIds: [], ativo: form.ativo });
    } else if (modal && typeof modal === "object") {
      updateCurso(modal.id, { nome: form.nome.trim(), nucleoId: form.nucleoId, ativo: form.ativo });
    }
    setModal(null);
    showToast(modal === "add" ? "Curso criado!" : "Curso atualizado!");
  };

  const impacts = (c: Curso): string[] => {
    const nTurmas = turmas.filter(t => t.cursoId === c.id);
    const usersCount = members.filter(m => m.curso === c.nome && m.status !== "Inativo").length;
    const res: string[] = [];
    if (nTurmas.length) res.push(`${nTurmas.length} turma(s) vinculada(s)`);
    if (usersCount) res.push(`${usersCount} membro(s) vinculado(s)`);
    return res;
  };

  return (
    <>
      {delTarget && (
        <DeleteConfirm
          title={`Remover curso "${delTarget.nome}"?`}
          impacts={impacts(delTarget)}
          onConfirmDeactivate={impacts(delTarget).length ? () => { updateCurso(delTarget.id, { ativo: false }); setDelTarget(null); showToast("Curso desativado."); } : undefined}
          onConfirmDelete={() => { deleteCurso(delTarget.id); setDelTarget(null); showToast("Curso excluído."); }}
          onCancel={() => setDelTarget(null)}
        />
      )}

      {modal !== null && (
        <ModalShell title={modal === "add" ? "Novo Curso" : "Editar Curso"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Nome do Curso <span style={{ color: "#8B0019" }}>*</span></label>
              <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Enfermagem" className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Núcleo <span style={{ color: "#8B0019" }}>*</span></label>
              {scopedNucleoId ? (
                <div className="px-3.5 py-2.5 text-sm rounded-xl" style={{ ...iStyle, opacity: 0.7 }}>
                  {nucleos.find(n => n.id === scopedNucleoId)?.nome ?? "—"}
                </div>
              ) : (
                <select value={form.nucleoId} onChange={e => setForm(p => ({ ...p, nucleoId: Number(e.target.value) }))} className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut}>
                  <option value={0}>— Selecione —</option>
                  {availableNucleos.map(n => <option key={n.id} value={n.id}>{n.nome}</option>)}
                </select>
              )}
            </div>
            <div className="flex items-center gap-2"><Toggle value={form.ativo} onChange={v => setForm(p => ({ ...p, ativo: v }))} /><span className="text-sm" style={{ color: "#3D382E" }}>Curso ativo</span></div>
            {formErr && <div className="px-3 py-2 rounded-xl text-xs" style={{ backgroundColor: "#FDF0F2", border: "1px solid #F5C2C8", color: "#991B1B" }}>{formErr}</div>}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F5F2EB", color: "#776D5B", border: "1px solid #E7E0D5" }}>Cancelar</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#8B0019" }}>Salvar</button>
            </div>
          </div>
        </ModalShell>
      )}

      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold" style={{ color: "#1E1B15" }}>{visibleCursos.length} curso{visibleCursos.length !== 1 ? "s" : ""}</h3>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: "#8B0019" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Curso
        </button>
      </div>

      <div className="space-y-2">
        {visibleCursos.map(c => {
          const nucleo  = nucleos.find(n => n.id === c.nucleoId);
          const nTurmas = turmas.filter(t => t.cursoId === c.id);
          return (
            <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold" style={{ color: "#1E1B15" }}>{c.nome}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#E3ECEE", color: "#1E5E60" }}>{nucleo?.nome ?? "—"}</span>
                  {!c.ativo && <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#F5F2EB", color: "#776D5B" }}>Inativo</span>}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#776D5B" }}>{nTurmas.length} turma{nTurmas.length !== 1 ? "s" : ""}</div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => openEdit(c)} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: "#FFF0F2", color: "#8B0019", border: "1px solid #FFD6D9" }}>Editar</button>
                <button onClick={() => setDelTarget(c)} className="p-1.5 rounded-lg" style={{ backgroundColor: "#FDF0F2", color: "#991B1B" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </div>
          );
        })}
        {visibleCursos.length === 0 && <p className="text-sm text-center py-8" style={{ color: "#776D5B" }}>Nenhum curso cadastrado.</p>}
      </div>
    </>
  );
}

// ── Turmas tab ────────────────────────────────────────────────────────────────
function TurmasTab({ scopedNucleoId, showToast }: { scopedNucleoId?: number; showToast: (m: string) => void }) {
  const { nucleos, cursos, turmas, disciplinas, getCursosByNucleo, addTurma, updateTurma, deleteTurma, getDisciplinasByTurma } = useAcademic();
  const { members } = useMembers();
  const [modal, setModal] = useState<null | "add" | Turma>(null);
  const [delTarget, setDelTarget] = useState<Turma | null>(null);
  const [form, setForm] = useState({ nome: "", nucleoId: scopedNucleoId ?? 0, cursoId: 0, turno: "Matutino", ativo: true, disciplinasIds: [] as number[] });
  const [formErr, setFormErr] = useState("");

  const visibleTurmas    = scopedNucleoId ? turmas.filter(t => t.nucleoId === scopedNucleoId) : turmas;
  const availableNucleos = scopedNucleoId ? nucleos.filter(n => n.id === scopedNucleoId) : nucleos.filter(n => n.ativo);
  const cursoList        = form.nucleoId ? getCursosByNucleo(form.nucleoId) : [];
  const disciplinaOptions = disciplinas.filter(d => d.nucleoId === (form.nucleoId || 0));

  const openAdd  = () => { setForm({ nome: "", nucleoId: scopedNucleoId ?? (availableNucleos[0]?.id ?? 0), cursoId: 0, turno: "Matutino", ativo: true, disciplinasIds: [] }); setFormErr(""); setModal("add"); };
  const openEdit = (t: Turma) => { setForm({ nome: t.nome, nucleoId: t.nucleoId, cursoId: t.cursoId, turno: t.turno, ativo: t.ativo, disciplinasIds: t.disciplinasIds }); setFormErr(""); setModal(t); };

  const toggleDisc = (id: number) => setForm(p => ({ ...p, disciplinasIds: p.disciplinasIds.includes(id) ? p.disciplinasIds.filter(d => d !== id) : [...p.disciplinasIds, id] }));

  const save = () => {
    if (!form.nome.trim()) { setFormErr("Informe o nome/identificador da turma."); return; }
    if (!form.cursoId) { setFormErr("Selecione o Curso."); return; }
    const curso = cursos.find(c => c.id === form.cursoId);
    if (curso && curso.nucleoId !== form.nucleoId) { setFormErr("O curso não pertence ao núcleo selecionado."); return; }
    if (modal === "add") {
      if (turmas.some(t => t.cursoId === form.cursoId && t.nome.toLowerCase() === form.nome.trim().toLowerCase())) {
        setFormErr("Já existe uma turma com esse identificador neste curso."); return;
      }
      addTurma({ nome: form.nome.trim(), cursoId: form.cursoId, nucleoId: form.nucleoId, turno: form.turno, alunosIds: [], professoresIds: [], disciplinasIds: form.disciplinasIds, ativo: form.ativo });
    } else if (modal && typeof modal === "object") {
      updateTurma(modal.id, { nome: form.nome.trim(), cursoId: form.cursoId, nucleoId: form.nucleoId, turno: form.turno, ativo: form.ativo, disciplinasIds: form.disciplinasIds });
    }
    setModal(null);
    showToast(modal === "add" ? "Turma criada!" : "Turma atualizada!");
  };

  const impacts = (t: Turma): string[] => {
    const alunosCount = members.filter(m => m.turma === t.nome && m.funcao === "Aluno").length;
    const profsCount  = members.filter(m => m.turma === t.nome && m.funcao === "Professor").length;
    const res: string[] = [];
    if (alunosCount) res.push(`${alunosCount} aluno(s) matriculado(s)`);
    if (profsCount) res.push(`${profsCount} professor(es) vinculado(s)`);
    return res;
  };

  return (
    <>
      {delTarget && (
        <DeleteConfirm
          title={`Remover turma "${delTarget.nome}"?`}
          impacts={impacts(delTarget)}
          onConfirmDeactivate={impacts(delTarget).length ? () => { updateTurma(delTarget.id, { ativo: false }); setDelTarget(null); showToast("Turma desativada."); } : undefined}
          onConfirmDelete={() => { deleteTurma(delTarget.id); setDelTarget(null); showToast("Turma excluída."); }}
          onCancel={() => setDelTarget(null)}
        />
      )}

      {modal !== null && (
        <ModalShell title={modal === "add" ? "Nova Turma" : "Editar Turma"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Nome/Identificador da Turma <span style={{ color: "#8B0019" }}>*</span></label>
              <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: ENF-2027-01" className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Núcleo <span style={{ color: "#8B0019" }}>*</span></label>
                {scopedNucleoId ? (
                  <div className="px-3.5 py-2.5 text-sm rounded-xl" style={{ ...iStyle, opacity: 0.7 }}>
                    {nucleos.find(n => n.id === scopedNucleoId)?.nome ?? "—"}
                  </div>
                ) : (
                  <select value={form.nucleoId} onChange={e => setForm(p => ({ ...p, nucleoId: Number(e.target.value), cursoId: 0, disciplinasIds: [] }))} className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut}>
                    <option value={0}>— Selecione —</option>
                    {availableNucleos.map(n => <option key={n.id} value={n.id}>{n.nome}</option>)}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Curso <span style={{ color: "#8B0019" }}>*</span></label>
                <select value={form.cursoId} onChange={e => setForm(p => ({ ...p, cursoId: Number(e.target.value) }))} disabled={!form.nucleoId} className={iCls} style={{ ...iStyle, opacity: form.nucleoId ? 1 : 0.5 }} onFocus={fIn} onBlur={fOut}>
                  <option value={0}>— Selecione —</option>
                  {cursoList.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Turno <span style={{ color: "#8B0019" }}>*</span></label>
                <select value={form.turno} onChange={e => setForm(p => ({ ...p, turno: e.target.value }))} className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut}>
                  {TURNOS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col justify-end">
                <div className="flex items-center gap-2 pb-2.5">
                  <Toggle value={form.ativo} onChange={v => setForm(p => ({ ...p, ativo: v }))} />
                  <span className="text-sm" style={{ color: "#3D382E" }}>Ativa</span>
                </div>
              </div>
            </div>
            {/* Disciplinas */}
            {disciplinaOptions.length > 0 && (
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#3D382E" }}>Disciplinas vinculadas</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {disciplinaOptions.map(d => {
                    const sel = form.disciplinasIds.includes(d.id);
                    return (
                      <button key={d.id} type="button" onClick={() => toggleDisc(d.id)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left"
                        style={{ backgroundColor: sel ? "#FFF0F2" : "#F5F2EB", color: sel ? "#8B0019" : "#776D5B", border: `1px solid ${sel ? "#FFD6D9" : "#E7E0D5"}` }}>
                        <span className="w-3 h-3 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: sel ? "#8B0019" : "#E7E0D5" }}>
                          {sel && <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        </span>
                        <span className="truncate">{d.nome}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {formErr && <div className="px-3 py-2 rounded-xl text-xs" style={{ backgroundColor: "#FDF0F2", border: "1px solid #F5C2C8", color: "#991B1B" }}>{formErr}</div>}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F5F2EB", color: "#776D5B", border: "1px solid #E7E0D5" }}>Cancelar</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#8B0019" }}>Salvar</button>
            </div>
          </div>
        </ModalShell>
      )}

      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold" style={{ color: "#1E1B15" }}>{visibleTurmas.length} turma{visibleTurmas.length !== 1 ? "s" : ""}</h3>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: "#8B0019" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova Turma
        </button>
      </div>

      <div className="space-y-2">
        {visibleTurmas.map(t => {
          const curso  = cursos.find(c => c.id === t.cursoId);
          const nucleo = nucleos.find(n => n.id === t.nucleoId);
          const discs  = getDisciplinasByTurma(t.id);
          const alunosCount = members.filter(m => m.turma === t.nome && m.funcao === "Aluno").length;
          return (
            <div key={t.id} className="p-4 rounded-xl" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold" style={{ color: "#1E1B15" }}>{t.nome}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#E3ECEE", color: "#1E5E60" }}>{nucleo?.nome ?? "—"}</span>
                    <span className="text-xs" style={{ color: "#776D5B" }}>{t.turno}</span>
                    {!t.ativo && <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#F5F2EB", color: "#776D5B" }}>Inativa</span>}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#776D5B" }}>{curso?.nome ?? "—"} · {alunosCount} aluno{alunosCount !== 1 ? "s" : ""} · {discs.length} disciplina{discs.length !== 1 ? "s" : ""}</div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => openEdit(t)} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: "#FFF0F2", color: "#8B0019", border: "1px solid #FFD6D9" }}>Editar</button>
                  <button onClick={() => setDelTarget(t)} className="p-1.5 rounded-lg" style={{ backgroundColor: "#FDF0F2", color: "#991B1B" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </div>
              </div>
              {discs.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {discs.map(d => <span key={d.id} className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "#F5F2EB", color: "#776D5B" }}>{d.nome}</span>)}
                </div>
              )}
            </div>
          );
        })}
        {visibleTurmas.length === 0 && <p className="text-sm text-center py-8" style={{ color: "#776D5B" }}>Nenhuma turma cadastrada.</p>}
      </div>
    </>
  );
}

// ── Disciplinas tab ───────────────────────────────────────────────────────────
function DisciplinasTab({ scopedNucleoId, showToast }: { scopedNucleoId?: number; showToast: (m: string) => void }) {
  const { nucleos, disciplinas, addDisciplina, updateDisciplina, deleteDisciplina } = useAcademic();
  const [modal, setModal] = useState<null | "add" | Disciplina>(null);
  const [delTarget, setDelTarget] = useState<Disciplina | null>(null);
  const [form, setForm] = useState({ nome: "", codigo: "", nucleoId: scopedNucleoId ?? 0, cargaHoraria: 60 });
  const [formErr, setFormErr] = useState("");

  const visibleDiscs     = scopedNucleoId ? disciplinas.filter(d => d.nucleoId === scopedNucleoId) : disciplinas;
  const availableNucleos = scopedNucleoId ? nucleos.filter(n => n.id === scopedNucleoId) : nucleos.filter(n => n.ativo);

  const openAdd  = () => { setForm({ nome: "", codigo: "", nucleoId: scopedNucleoId ?? (availableNucleos[0]?.id ?? 0), cargaHoraria: 60 }); setFormErr(""); setModal("add"); };
  const openEdit = (d: Disciplina) => { setForm({ nome: d.nome, codigo: d.codigo, nucleoId: d.nucleoId, cargaHoraria: d.cargaHoraria }); setFormErr(""); setModal(d); };

  const save = () => {
    if (!form.nome.trim()) { setFormErr("Informe o nome da disciplina."); return; }
    if (!form.nucleoId) { setFormErr("Selecione o Núcleo."); return; }
    if (modal === "add") {
      if (form.codigo && disciplinas.some(d => d.nucleoId === form.nucleoId && d.codigo.toLowerCase() === form.codigo.trim().toLowerCase())) {
        setFormErr("Já existe uma disciplina com esse código neste Núcleo."); return;
      }
      addDisciplina({ nome: form.nome.trim(), codigo: form.codigo.trim(), nucleoId: form.nucleoId, cargaHoraria: form.cargaHoraria, professoresIds: [], turmasIds: [] });
    } else if (modal && typeof modal === "object") {
      updateDisciplina(modal.id, { nome: form.nome.trim(), codigo: form.codigo.trim(), nucleoId: form.nucleoId, cargaHoraria: form.cargaHoraria });
    }
    setModal(null);
    showToast(modal === "add" ? "Disciplina criada!" : "Disciplina atualizada!");
  };

  const impacts = (d: Disciplina): string[] => {
    const res: string[] = [];
    if (d.turmasIds.length) res.push(`Vinculada a ${d.turmasIds.length} turma(s)`);
    if (d.professoresIds.length) res.push(`${d.professoresIds.length} professor(es) responsável(is)`);
    return res;
  };

  return (
    <>
      {delTarget && (
        <DeleteConfirm
          title={`Remover disciplina "${delTarget.nome}"?`}
          impacts={impacts(delTarget)}
          onConfirmDeactivate={undefined}
          onConfirmDelete={() => { deleteDisciplina(delTarget.id); setDelTarget(null); showToast("Disciplina excluída."); }}
          onCancel={() => setDelTarget(null)}
        />
      )}

      {modal !== null && (
        <ModalShell title={modal === "add" ? "Nova Disciplina" : "Editar Disciplina"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Nome <span style={{ color: "#8B0019" }}>*</span></label>
                <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Anatomia Humana" className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Código</label>
                <input value={form.codigo} onChange={e => setForm(p => ({ ...p, codigo: e.target.value }))} placeholder="Ex: SAU001" className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Carga horária (h)</label>
                <input type="number" min={1} value={form.cargaHoraria} onChange={e => setForm(p => ({ ...p, cargaHoraria: Number(e.target.value) }))} className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Núcleo <span style={{ color: "#8B0019" }}>*</span></label>
                {scopedNucleoId ? (
                  <div className="px-3.5 py-2.5 text-sm rounded-xl" style={{ ...iStyle, opacity: 0.7 }}>
                    {nucleos.find(n => n.id === scopedNucleoId)?.nome ?? "—"}
                  </div>
                ) : (
                  <select value={form.nucleoId} onChange={e => setForm(p => ({ ...p, nucleoId: Number(e.target.value) }))} className={iCls} style={iStyle} onFocus={fIn} onBlur={fOut}>
                    <option value={0}>— Selecione —</option>
                    {availableNucleos.map(n => <option key={n.id} value={n.id}>{n.nome}</option>)}
                  </select>
                )}
              </div>
            </div>
            {formErr && <div className="px-3 py-2 rounded-xl text-xs" style={{ backgroundColor: "#FDF0F2", border: "1px solid #F5C2C8", color: "#991B1B" }}>{formErr}</div>}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F5F2EB", color: "#776D5B", border: "1px solid #E7E0D5" }}>Cancelar</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#8B0019" }}>Salvar</button>
            </div>
          </div>
        </ModalShell>
      )}

      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold" style={{ color: "#1E1B15" }}>{visibleDiscs.length} disciplina{visibleDiscs.length !== 1 ? "s" : ""}</h3>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: "#8B0019" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova Disciplina
        </button>
      </div>

      <div className="space-y-2">
        {visibleDiscs.map(d => {
          const nucleo = nucleos.find(n => n.id === d.nucleoId);
          return (
            <div key={d.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {d.codigo && <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: "#F5F2EB", color: "#776D5B" }}>{d.codigo}</span>}
                  <span className="text-sm font-semibold" style={{ color: "#1E1B15" }}>{d.nome}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#E3ECEE", color: "#1E5E60" }}>{nucleo?.nome ?? "—"}</span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#776D5B" }}>{d.cargaHoraria}h · {d.turmasIds.length} turma{d.turmasIds.length !== 1 ? "s" : ""}</div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => openEdit(d)} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: "#FFF0F2", color: "#8B0019", border: "1px solid #FFD6D9" }}>Editar</button>
                <button onClick={() => setDelTarget(d)} className="p-1.5 rounded-lg" style={{ backgroundColor: "#FDF0F2", color: "#991B1B" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </div>
          );
        })}
        {visibleDiscs.length === 0 && <p className="text-sm text-center py-8" style={{ color: "#776D5B" }}>Nenhuma disciplina cadastrada.</p>}
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
type AcadTab = "nucleos" | "cursos" | "turmas" | "disciplinas";

export default function Academico() {
  const { user, isAdmin } = useAuth();
  const { nucleos } = useAcademic();
  const [tab, setTab] = useState<AcadTab>(isAdmin ? "nucleos" : "cursos");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // Coordenador: scoped to their own nucleo
  const scopedNucleo = !isAdmin && user.nucleo ? nucleos.find(n => n.nome === user.nucleo) : undefined;
  const scopedNucleoId = scopedNucleo?.id;

  const tabs: { key: AcadTab; label: string; adminOnly?: boolean }[] = [
    { key: "nucleos",     label: "Núcleos",    adminOnly: true },
    { key: "cursos",      label: "Cursos"      },
    { key: "turmas",      label: "Turmas"      },
    { key: "disciplinas", label: "Disciplinas" },
  ];

  const visibleTabs = tabs.filter(t => !t.adminOnly || isAdmin);

  return (
    <>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium"
          style={{ backgroundColor: "#EAF5EA", border: "1px solid #C2E2C2", color: "#2B5E2B" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {toast}
        </div>
      )}

      <div className="px-6 py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold mb-1" style={{ color: "#8B0019", letterSpacing: "0.08em" }}>GESTÃO ACADÊMICA</p>
          <h1 className="text-2xl font-bold" style={{ color: "#1E1B15" }}>Estrutura Acadêmica</h1>
          <p className="text-sm mt-1" style={{ color: "#776D5B" }}>
            {isAdmin
              ? "Gerencie núcleos, cursos, turmas e disciplinas da instituição."
              : `Gerencie cursos, turmas e disciplinas do Núcleo ${user.nucleo ?? ""}.`}
          </p>
          {!isAdmin && scopedNucleo && (
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#FFF8E6", border: "1px solid #FFE19A", color: "#805B00" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              Escopo: Núcleo {scopedNucleo.nome}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit" style={{ backgroundColor: "#F3EFEA" }}>
          {visibleTabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ backgroundColor: tab === t.key ? "#FFF" : "transparent", color: tab === t.key ? "#1E1B15" : "#776D5B", boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "nucleos"     && isAdmin && <NucleosTab showToast={showToast} />}
        {tab === "cursos"      && <CursosTab scopedNucleoId={scopedNucleoId} showToast={showToast} />}
        {tab === "turmas"      && <TurmasTab scopedNucleoId={scopedNucleoId} showToast={showToast} />}
        {tab === "disciplinas" && <DisciplinasTab scopedNucleoId={scopedNucleoId} showToast={showToast} />}
      </div>
    </>
  );
}
