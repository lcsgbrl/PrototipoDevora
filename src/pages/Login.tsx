import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoImg from "@/imports/image.png";
import { useAuth, DEMO_USERS, DemoUser, UserRole } from "@/context/AuthContext";
import { useMembers } from "@/context/MembersContext";
import { useAcademic, TURNOS } from "@/context/AcademicContext";

const inputStyle = { backgroundColor: "#F5F2EB", border: "1px solid #E7E0D5", color: "#1E1B15" } as const;
const focusIn  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.target.style.borderColor = "#8B0019"; e.target.style.boxShadow = "0 0 0 3px rgba(139,0,25,0.08)"; };
const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.target.style.borderColor = "#E7E0D5"; e.target.style.boxShadow = "none"; };

const roleColors: Record<UserRole, { bg: string; text: string; border: string; dot: string }> = {
  Aluno:         { bg: "#E3ECEE", text: "#1E5E60", border: "#B0CDD2", dot: "#1E5E60" },
  Professor:     { bg: "#E8EFE2", text: "#3C5E53", border: "#B0CEB8", dot: "#3C5E53" },
  Coordenador:   { bg: "#FFF8E6", text: "#805B00", border: "#FFE19A", dot: "#B08A00" },
  Administrador: { bg: "#FFF0F2", text: "#8B0019", border: "#FFD6D9", dot: "#8B0019" },
};

const roleDescriptions: Record<UserRole, string> = {
  Aluno: "Consulta salas e solicita reservas",
  Professor: "Realiza reservas e aprova solicitações de alunos",
  Coordenador: "Acompanha reservas e autoriza ambientes especiais",
  Administrador: "Gerencia usuários, salas e todo o sistema",
};

// ── Validation helpers ────────────────────────────────────────────────────────

function validateNome(nome: string): string {
  const t = nome.trim();
  if (!t) return "Informe seu nome completo.";
  if (t.length < 3) return "O nome deve ter ao menos 3 caracteres.";
  if (/^\d+$/.test(t)) return "O nome não pode conter apenas números.";
  if (!/[a-zA-ZÀ-ÿ]/.test(t)) return "O nome deve conter letras.";
  return "";
}

function validateEmail(email: string): string {
  const t = email.trim();
  if (!t) return "Informe seu e-mail.";
  if (/\s/.test(t)) return "O e-mail não pode conter espaços.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return "Informe um endereço de e-mail válido.";
  return "";
}

function validateCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  if (!digits) return "Informe seu CPF.";
  if (digits.length !== 11) return "CPF inválido. Verifique os dados informados.";
  if (/^(\d)\1{10}$/.test(digits)) return "CPF inválido. Verifique os dados informados.";

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(digits[i]) * (10 - i);
  let rem = (sum * 10) % 11;
  if (rem === 10 || rem === 11) rem = 0;
  if (rem !== Number(digits[9])) return "CPF inválido. Verifique os dados informados.";

  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(digits[i]) * (11 - i);
  rem = (sum * 10) % 11;
  if (rem === 10 || rem === 11) rem = 0;
  if (rem !== Number(digits[10])) return "CPF inválido. Verifique os dados informados.";

  return "";
}

// ── RegisterModal ─────────────────────────────────────────────────────────────

interface RegisterModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function RegisterModal({ onClose, onSuccess }: RegisterModalProps) {
  const { addPendingMember, members } = useMembers();
  const { nucleos, getCursosByNucleo, getTurmasByCurso, getDisciplinasByTurma } = useAcademic();

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    nome: "", email: "", cpf: "", funcao: "Aluno",
    nucleo: "", curso: "", turno: "", turma: "", senha: "", confirmar: "",
  });
  const [selectedDisciplinas, setSelectedDisciplinas] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Cascading lists
  const nucleoObj    = nucleos.find(n => n.nome === form.nucleo && n.ativo);
  const cursoList    = nucleoObj ? getCursosByNucleo(nucleoObj.id) : [];
  const cursoObj     = cursoList.find(c => c.nome === form.curso);
  const allTurmas    = cursoObj ? getTurmasByCurso(cursoObj.id) : [];
  const turmaList    = form.turno ? allTurmas.filter(t => t.turno === form.turno) : allTurmas;
  const turmaObj     = turmaList.find(t => t.nome === form.turma);
  const disciplinaList = turmaObj ? getDisciplinasByTurma(turmaObj.id) : [];

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === "nucleo") { next.curso = ""; next.turma = ""; setSelectedDisciplinas([]); }
      if (name === "curso")  { next.turma = "";              setSelectedDisciplinas([]); }
      if (name === "turno")  { next.turma = "";              setSelectedDisciplinas([]); }
      if (name === "turma")  {                               setSelectedDisciplinas([]); }
      return next;
    });
  };

  const toggleDisc = (nome: string) =>
    setSelectedDisciplinas(prev => prev.includes(nome) ? prev.filter(d => d !== nome) : [...prev, nome]);

  const validateStep1 = (): string => {
    const nomeErr = validateNome(form.nome);
    if (nomeErr) return nomeErr;

    const emailErr = validateEmail(form.email);
    if (emailErr) return emailErr;

    // Check duplicate email
    const emailLower = form.email.trim().toLowerCase();
    if (members.some(m => m.email.toLowerCase() === emailLower)) {
      return "Este e-mail já está cadastrado no sistema.";
    }

    const cpfErr = validateCPF(form.cpf);
    if (cpfErr) return cpfErr;

    // Check duplicate CPF
    const cpfDigits = form.cpf.replace(/\D/g, "");
    if (members.some(m => m.cpf && m.cpf.replace(/\D/g, "") === cpfDigits)) {
      return "Este CPF já está cadastrado no sistema.";
    }

    if (!form.senha) return "Informe uma senha.";
    if (form.senha.length < 6) return "A senha deve ter ao menos 6 caracteres.";
    if (form.senha !== form.confirmar) return "As senhas não coincidem.";
    return "";
  };

  const validateStep2 = (): string => {
    if (!form.nucleo) return "Selecione o Núcleo.";
    if (!nucleoObj) return "O Núcleo selecionado não está ativo.";
    if (!form.curso) return "Selecione o Curso.";
    if (!cursoObj) return "O Curso selecionado não pertence ao Núcleo informado.";
    if (!form.turno) return "Selecione o Turno.";
    if (!form.turma) return "Selecione a Turma.";
    if (!turmaObj) return "A turma selecionada não pertence ao Curso ou Turno informado.";
    if (turmaObj.cursoId !== cursoObj.id) return "A turma selecionada não pertence ao curso informado.";
    if (turmaObj.nucleoId !== nucleoObj.id) return "A turma selecionada não pertence ao núcleo informado.";
    return "";
  };

  const nextStep = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError("");
    setStep(2);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setError(err); return; }
    addPendingMember({
      nome: form.nome.trim(), email: form.email.trim(), cpf: form.cpf,
      funcao: form.funcao, depto: form.nucleo,
      nucleo: form.nucleo, curso: form.curso, turno: form.turno,
      turma: form.turma, disciplinas: selectedDisciplinas,
    });
    setSubmitted(true);
  };

  const inputCls = "w-full px-3.5 py-2.5 text-sm rounded-xl outline-none";

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(14,12,9,0.55)" }}>
        <div className="w-full max-w-sm rounded-2xl p-8 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E0D5", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "#EAF5EA" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2B5E2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: "#1E1B15" }}>Solicitação enviada!</h3>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "#776D5B" }}>
            Seu cadastro foi enviado para aprovação do administrador. Você receberá acesso assim que for aprovado.
          </p>
          <button onClick={onSuccess} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#8B0019" }}>Entendido</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(14,12,9,0.55)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E0D5", boxShadow: "0 24px 60px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}>
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between sticky top-0 z-10" style={{ borderBottom: "1px solid #F3EFEA", backgroundColor: "#FFFFFF" }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: "#1E1B15" }}>Criar conta</h2>
            <p className="text-xs mt-0.5" style={{ color: "#776D5B" }}>Etapa {step} de 2 — {step === 1 ? "Dados pessoais" : "Informações acadêmicas"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "#776D5B", backgroundColor: "#F5F2EB" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1" style={{ backgroundColor: "#F3EFEA" }}>
          <div className="h-1 transition-all duration-300" style={{ width: step === 1 ? "50%" : "100%", backgroundColor: "#8B0019" }} />
        </div>

        {/* Notice */}
        <div className="mx-6 mt-4 px-4 py-3 rounded-xl flex items-start gap-3 text-xs" style={{ backgroundColor: "#FFF8E6", border: "1px solid #FFE19A", color: "#805B00" }}>
          <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Seu cadastro ficará <strong className="font-semibold mx-1">pendente de aprovação</strong> pelo administrador antes do acesso ser liberado.
        </div>

        {step === 1 ? (
          /* ── Step 1: Dados pessoais ── */
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Nome completo <span style={{ color: "#8B0019" }}>*</span></label>
                <input name="nome" value={form.nome} onChange={handle} placeholder="João Paulo da Silva" className={inputCls} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>E-mail institucional <span style={{ color: "#8B0019" }}>*</span></label>
                <input name="email" type="text" value={form.email} onChange={handle} placeholder="seu@email.com" className={inputCls} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>CPF <span style={{ color: "#8B0019" }}>*</span></label>
                <input name="cpf" value={form.cpf} onChange={handle} placeholder="000.000.000-00" className={inputCls} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Perfil/Cargo <span style={{ color: "#8B0019" }}>*</span></label>
                <select name="funcao" value={form.funcao} onChange={handle} className={inputCls} style={inputStyle} onFocus={focusIn} onBlur={focusOut}>
                  {["Aluno", "Professor", "Coordenador"].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Senha <span style={{ color: "#8B0019" }}>*</span></label>
                <input name="senha" type="password" value={form.senha} onChange={handle} placeholder="••••••••" className={inputCls} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Confirmar senha <span style={{ color: "#8B0019" }}>*</span></label>
                <input name="confirmar" type="password" value={form.confirmar} onChange={handle} placeholder="••••••••" className={inputCls} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
            </div>
            {error && <div className="px-4 py-3 rounded-xl text-xs" style={{ backgroundColor: "#FDF0F2", border: "1px solid #F5C2C8", color: "#991B1B" }}>{error}</div>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F5F2EB", color: "#776D5B", border: "1px solid #E7E0D5" }}>Cancelar</button>
              <button type="button" onClick={nextStep} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#8B0019" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#700010")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#8B0019")}>
                Próximo →
              </button>
            </div>
          </div>
        ) : (
          /* ── Step 2: Informações acadêmicas ── */
          <form onSubmit={submit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Núcleo — dynamic from AcademicContext, only active ones */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Núcleo <span style={{ color: "#8B0019" }}>*</span></label>
                <select name="nucleo" value={form.nucleo} onChange={handle} className={inputCls} style={inputStyle} onFocus={focusIn} onBlur={focusOut}>
                  <option value="">— Selecione o Núcleo —</option>
                  {nucleos.filter(n => n.ativo).map(n => <option key={n.id} value={n.nome}>{n.nome}</option>)}
                </select>
              </div>

              {/* Curso — cascades from Núcleo */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Curso <span style={{ color: "#8B0019" }}>*</span></label>
                <select name="curso" value={form.curso} onChange={handle} disabled={!form.nucleo} className={inputCls} style={{ ...inputStyle, opacity: form.nucleo ? 1 : 0.5 }} onFocus={focusIn} onBlur={focusOut}>
                  <option value="">— Selecione o Curso —</option>
                  {cursoList.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                </select>
                {form.nucleo && cursoList.length === 0 && (
                  <p className="text-xs mt-1" style={{ color: "#776D5B" }}>Nenhum curso disponível para este núcleo.</p>
                )}
              </div>

              {/* Turno — independent but filters turmas */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Turno <span style={{ color: "#8B0019" }}>*</span></label>
                <select name="turno" value={form.turno} onChange={handle} disabled={!form.curso} className={inputCls} style={{ ...inputStyle, opacity: form.curso ? 1 : 0.5 }} onFocus={focusIn} onBlur={focusOut}>
                  <option value="">— Selecione —</option>
                  {/* Only show turnos that have at least one turma in selected curso */}
                  {TURNOS.filter(t => allTurmas.some(tm => tm.turno === t)).map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              {/* Turma — cascades from Curso AND Turno */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Turma <span style={{ color: "#8B0019" }}>*</span></label>
                <select name="turma" value={form.turma} onChange={handle} disabled={!form.curso || !form.turno} className={inputCls} style={{ ...inputStyle, opacity: (form.curso && form.turno) ? 1 : 0.5 }} onFocus={focusIn} onBlur={focusOut}>
                  <option value="">— Selecione a Turma —</option>
                  {turmaList.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
                </select>
                {form.curso && form.turno && turmaList.length === 0 && (
                  <p className="text-xs mt-1" style={{ color: "#776D5B" }}>Nenhuma turma no turno selecionado.</p>
                )}
              </div>
            </div>

            {/* Disciplinas — cascades from Turma */}
            {disciplinaList.length > 0 && (
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#3D382E" }}>
                  Matérias/Disciplinas
                  <span className="font-normal ml-1" style={{ color: "#A8A09A" }}>(selecione as que cursa/ministra)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {disciplinaList.map(d => {
                    const sel = selectedDisciplinas.includes(d.nome);
                    return (
                      <button key={d.id} type="button" onClick={() => toggleDisc(d.nome)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all"
                        style={{ backgroundColor: sel ? "#FFF0F2" : "#F5F2EB", color: sel ? "#8B0019" : "#776D5B", border: `1px solid ${sel ? "#FFD6D9" : "#E7E0D5"}` }}>
                        <span className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: sel ? "#8B0019" : "#E7E0D5" }}>
                          {sel && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        </span>
                        <span className="truncate">{d.nome}</span>
                        <span className="ml-auto text-xs opacity-60 flex-shrink-0">{d.codigo}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {error && <div className="px-4 py-3 rounded-xl text-xs" style={{ backgroundColor: "#FDF0F2", border: "1px solid #F5C2C8", color: "#991B1B" }}>{error}</div>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { setStep(1); setError(""); }} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F5F2EB", color: "#776D5B", border: "1px solid #E7E0D5" }}>← Voltar</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors" style={{ backgroundColor: "#8B0019" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#700010")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#8B0019")}>
                Solicitar acesso
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Login page ────────────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUser(DEMO_USERS[0]);
    navigate("/menu");
  };

  const loginAs = (user: DemoUser) => {
    setUser(user);
    navigate("/menu");
  };

  return (
    <>
      {registerOpen && <RegisterModal onClose={() => setRegisterOpen(false)} onSuccess={() => setRegisterOpen(false)} />}

      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left side */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 relative overflow-hidden" style={{ backgroundColor: "#8B0019" }}>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: "#700010", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10" style={{ background: "#54000B", transform: "translate(-30%, 30%)" }} />
          <div className="absolute top-1/2 right-8 w-48 h-48 rounded-full opacity-5" style={{ background: "#FAF9F6", transform: "translateY(-50%)" }} />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-20 h-20 rounded-xl flex items-center justify-center p-2.5" style={{ backgroundColor: "#FAF9F6" }}>
                <img src={logoImg} alt="SGA Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">SGA</span>
            </div>
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 w-fit" style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#FFD6D9" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 inline-block" />
              Sistema Institucional
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
              Sistema de Gestão<br />de Ambientes
            </h1>
            <p className="text-base leading-relaxed" style={{ color: "#FFD6D9", maxWidth: "380px" }}>
              Plataforma integrada para gerenciamento de reservas, controle de ambientes e organização de membros da instituição.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-10">
              {["Reservas inteligentes", "Controle de acesso", "Relatórios detalhados"].map((f) => (
                <div key={f} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#FFA8B0" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex gap-8">
            {[{ value: "200+", label: "Ambientes" }, { value: "1.4k", label: "Reservas/mês" }, { value: "98%", label: "Satisfação" }].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: "#FFA8B0" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto" style={{ backgroundColor: "#FAF9F6" }}>
          <div className="w-full max-w-sm py-4">
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center p-1.5" style={{ backgroundColor: "#FFF0F2" }}>
                <img src={logoImg} alt="SGA Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-base" style={{ color: "#1E1B15" }}>SGA</span>
            </div>

            <h2 className="text-2xl font-bold mb-1" style={{ color: "#1E1B15" }}>Bem-vindo</h2>
            <p className="text-sm mb-8" style={{ color: "#776D5B" }}>Acesse sua conta para continuar</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>E-mail</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none transition-all" style={inputStyle}
                  onFocus={focusIn} onBlur={focusOut} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Senha</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none transition-all pr-10" style={inputStyle}
                    onFocus={focusIn} onBlur={focusOut} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#776D5B" }}>
                    {showPass ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: "#8B0019" }} />
                  <span className="text-xs" style={{ color: "#776D5B" }}>Lembrar de mim</span>
                </label>
                <button type="button" className="text-xs font-medium" style={{ color: "#8B0019" }}>Esqueci minha senha</button>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150" style={{ backgroundColor: "#8B0019" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#700010")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8B0019")}>
                Entrar
              </button>
            </form>

            {/* Demo role selector */}
            <div className="mt-7">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-px" style={{ backgroundColor: "#E7E0D5" }} />
                <span className="text-xs font-medium px-2" style={{ color: "#776D5B" }}>Entrar como — Demonstração</span>
                <div className="flex-1 h-px" style={{ backgroundColor: "#E7E0D5" }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DEMO_USERS.map((u) => {
                  const c = roleColors[u.role];
                  return (
                    <button
                      key={u.email}
                      onClick={() => loginAs(u)}
                      className="text-left p-3 rounded-xl transition-all duration-150 group"
                      style={{ backgroundColor: "#FFFFFF", border: `1px solid ${c.border}` }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = c.bg; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FFFFFF"; e.currentTarget.style.transform = "none"; }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.dot }} />
                        <span className="text-xs font-bold" style={{ color: c.text }}>{u.role}</span>
                      </div>
                      <div className="text-xs font-medium truncate" style={{ color: "#1E1B15" }}>{u.nome}</div>
                      {u.nucleo && <div className="text-xs font-medium" style={{ color: c.dot }}>Núcleo {u.nucleo}</div>}
                      <div className="text-xs mt-0.5 leading-tight" style={{ color: "#776D5B" }}>{roleDescriptions[u.role]}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ backgroundColor: "#E7E0D5" }} />
              <span className="text-xs" style={{ color: "#776D5B" }}>ou</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "#E7E0D5" }} />
            </div>

            <button onClick={() => setRegisterOpen(true)}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
              style={{ backgroundColor: "#F5F2EB", color: "#3D382E", border: "1px solid #E7E0D5" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#EDE8DF"; e.currentTarget.style.borderColor = "#C8BFB2"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F5F2EB"; e.currentTarget.style.borderColor = "#E7E0D5"; }}>
              Criar nova conta
            </button>

            <p className="text-xs text-center mt-5" style={{ color: "#776D5B" }}>
              Problemas de acesso?{" "}
              <button className="font-medium" style={{ color: "#8B0019" }} onClick={() => navigate("/suporte")}>Contate o suporte</button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
