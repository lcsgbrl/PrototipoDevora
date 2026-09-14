import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const MOCK_CURRENT_PASSWORD = "senha123";

const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  Aluno:         { bg: "#E3ECEE", text: "#1E5E60", border: "#B0CDD2" },
  Professor:     { bg: "#E8EFE2", text: "#3C5E53", border: "#B0CEB8" },
  Coordenador:   { bg: "#FFF8E6", text: "#805B00", border: "#FFE19A" },
  Administrador: { bg: "#FFF0F2", text: "#8B0019", border: "#FFD6D9" },
};

const iStyle = { backgroundColor: "#F5F2EB", border: "1px solid #E7E0D5", color: "#1E1B15" } as const;
const iDisabled = { backgroundColor: "#F0EDE8", border: "1px solid #E7E0D5", color: "#A8A09A", cursor: "not-allowed" } as const;
const fIn = (e: React.FocusEvent<HTMLInputElement>) => {
  if (!e.target.disabled) { e.target.style.borderColor = "#8B0019"; e.target.style.boxShadow = "0 0 0 3px rgba(139,0,25,0.08)"; }
};
const fOut = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = "#E7E0D5"; e.target.style.boxShadow = "none";
};

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium"
      style={type === "success"
        ? { backgroundColor: "#EAF5EA", border: "1px solid #C2E2C2", color: "#2B5E2B" }
        : { backgroundColor: "#FDF0F2", border: "1px solid #F5C2C8", color: "#991B1B" }}>
      {type === "success"
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>}
      {msg}
    </div>
  );
}

export default function Configuracoes() {
  const { user } = useAuth();
  const rc = roleColors[user.role] ?? roleColors["Aluno"];

  // Profile form
  const [profileForm, setProfileForm] = useState({ nome: user.nome, email: user.email });
  const [profileToast, setProfileToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Password form
  const [pwForm, setPwForm] = useState({ atual: "", nova: "", confirmar: "" });
  const [pwError, setPwError] = useState("");
  const [pwToast, setPwToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (
    setter: React.Dispatch<React.SetStateAction<{ msg: string; type: "success" | "error" } | null>>,
    msg: string,
    type: "success" | "error"
  ) => {
    setter({ msg, type });
    setTimeout(() => setter(null), 3500);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.nome.trim()) { showToast(setProfileToast, "O nome não pode estar vazio.", "error"); return; }
    if (!profileForm.email.includes("@")) { showToast(setProfileToast, "Informe um e-mail válido.", "error"); return; }
    showToast(setProfileToast, "Perfil atualizado com sucesso!", "success");
  };

  const handlePwSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");

    if (!pwForm.atual) { setPwError("Informe sua senha atual."); return; }
    if (pwForm.atual !== MOCK_CURRENT_PASSWORD) { setPwError("Senha atual incorreta."); return; }
    if (!pwForm.nova) { setPwError("Informe a nova senha."); return; }
    if (pwForm.nova.length < 6) { setPwError("A nova senha deve ter pelo menos 6 caracteres."); return; }
    if (pwForm.nova === pwForm.atual) { setPwError("A nova senha não pode ser igual à senha atual."); return; }
    if (pwForm.nova !== pwForm.confirmar) { setPwError("A confirmação não coincide com a nova senha."); return; }

    setPwForm({ atual: "", nova: "", confirmar: "" });
    showToast(setPwToast, "Senha alterada com sucesso!", "success");
  };

  const initials = user.nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <>
      {profileToast && <Toast msg={profileToast.msg} type={profileToast.type} />}
      {pwToast && <Toast msg={pwToast.msg} type={pwToast.type} />}

      <div className="px-6 py-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold mb-1" style={{ color: "#8B0019", letterSpacing: "0.08em" }}>SISTEMA</p>
          <h1 className="text-2xl font-bold" style={{ color: "#1E1B15" }}>Configurações</h1>
          <p className="text-sm mt-1" style={{ color: "#776D5B" }}>Preferências e configurações da sua conta.</p>
        </div>

        {/* Avatar + role card */}
        <div className="rounded-2xl p-5 mb-5 flex items-center gap-5" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-extrabold text-white flex-shrink-0"
            style={{ backgroundColor: "#8B0019" }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold truncate" style={{ color: "#1E1B15" }}>{user.nome}</div>
            <div className="text-xs mt-0.5 truncate" style={{ color: "#776D5B" }}>{user.email}</div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: rc.text }} />
                {user.role}
              </span>
              {user.depto && (
                <span className="text-xs px-2 py-0.5 rounded-lg" style={{ backgroundColor: "#F5F2EB", color: "#776D5B" }}>
                  {user.depto}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile section */}
        <form onSubmit={handleProfileSave}>
          <div className="rounded-2xl p-6 mb-5" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
            <h2 className="text-sm font-bold mb-1" style={{ color: "#1E1B15" }}>Informações do Perfil</h2>
            <p className="text-xs mb-5" style={{ color: "#776D5B" }}>Atualize seu nome e e-mail de contato.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Nome completo</label>
                <input type="text" value={profileForm.nome}
                  onChange={(e) => setProfileForm({ ...profileForm, nome: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none"
                  style={iStyle} onFocus={fIn} onBlur={fOut} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>E-mail institucional</label>
                <input type="email" value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none"
                  style={iStyle} onFocus={fIn} onBlur={fOut} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 flex items-center gap-2" style={{ color: "#3D382E" }}>
                  Cargo / Função
                  <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: "#FFF0F2", color: "#8B0019" }}>somente ADM</span>
                </label>
                <div className="relative">
                  <input type="text" value={user.role} disabled
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none pr-10"
                    style={iDisabled} />
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A8A09A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <p className="text-xs mt-1" style={{ color: "#A8A09A" }}>
                  O cargo só pode ser alterado por um administrador na lista de membros.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button type="submit"
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: "#8B0019" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#700010")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8B0019")}>
                Salvar perfil
              </button>
            </div>
          </div>
        </form>

        {/* Password section */}
        <form onSubmit={handlePwSave}>
          <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
            <h2 className="text-sm font-bold mb-1" style={{ color: "#1E1B15" }}>Segurança</h2>
            <p className="text-xs mb-5" style={{ color: "#776D5B" }}>Altere sua senha de acesso. A nova senha não pode ser igual à atual.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Senha atual <span style={{ color: "#8B0019" }}>*</span></label>
                <input type="password" value={pwForm.atual} placeholder="••••••••"
                  onChange={(e) => { setPwForm({ ...pwForm, atual: e.target.value }); setPwError(""); }}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none"
                  style={{ ...iStyle, borderColor: pwError && !pwForm.atual ? "#F5C2C8" : "#E7E0D5" }}
                  onFocus={fIn} onBlur={fOut} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Nova senha <span style={{ color: "#8B0019" }}>*</span></label>
                <input type="password" value={pwForm.nova} placeholder="Mínimo 6 caracteres"
                  onChange={(e) => { setPwForm({ ...pwForm, nova: e.target.value }); setPwError(""); }}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none"
                  style={{ ...iStyle, borderColor: pwError && pwForm.nova && pwForm.nova === pwForm.atual ? "#F5C2C8" : "#E7E0D5" }}
                  onFocus={fIn} onBlur={fOut} />
                {/* Live same-password warning */}
                {pwForm.nova && pwForm.atual && pwForm.nova === pwForm.atual && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#991B1B" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    A nova senha não pode ser igual à senha atual.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3D382E" }}>Confirmar nova senha <span style={{ color: "#8B0019" }}>*</span></label>
                <input type="password" value={pwForm.confirmar} placeholder="Repita a nova senha"
                  onChange={(e) => { setPwForm({ ...pwForm, confirmar: e.target.value }); setPwError(""); }}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none"
                  style={{ ...iStyle, borderColor: pwError && pwForm.confirmar && pwForm.nova !== pwForm.confirmar ? "#F5C2C8" : "#E7E0D5" }}
                  onFocus={fIn} onBlur={fOut} />
                {/* Live mismatch warning */}
                {pwForm.confirmar && pwForm.nova !== pwForm.confirmar && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#991B1B" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    As senhas não coincidem.
                  </p>
                )}
              </div>
            </div>

            {/* Block-level error */}
            {pwError && (
              <div className="mt-4 px-4 py-3 rounded-xl flex items-start gap-3 text-xs"
                style={{ backgroundColor: "#FDF0F2", border: "1px solid #F5C2C8", color: "#991B1B" }}>
                <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{pwError}</span>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button type="submit"
                disabled={!!(pwForm.nova && pwForm.atual && pwForm.nova === pwForm.atual)}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#8B0019" }}
                onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#700010"; }}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8B0019")}>
                Alterar senha
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
