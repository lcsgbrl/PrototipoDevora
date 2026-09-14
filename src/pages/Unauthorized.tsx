import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const roleColors: Record<string, { bg: string; text: string }> = {
  Aluno: { bg: "#E3ECEE", text: "#1E5E60" },
  Professor: { bg: "#E8EFE2", text: "#3C5E53" },
  Coordenador: { bg: "#FFF8E6", text: "#805B00" },
  Administrador: { bg: "#FFF0F2", text: "#8B0019" },
};

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const badge = roleColors[user.role] ?? { bg: "#F5F2EB", text: "#776D5B" };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#FAF9F6" }}>
      <div className="text-center max-w-sm">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "#FDF0F2" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
          style={{ backgroundColor: badge.bg, color: badge.text }}
        >
          Perfil: {user.role}
        </div>

        <h1 className="text-2xl font-extrabold mb-3" style={{ color: "#1E1B15" }}>
          Acesso não autorizado
        </h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "#776D5B" }}>
          Você não tem permissão para acessar esta página com o perfil de <strong>{user.role}</strong>. Entre em contato com o administrador caso precise de acesso.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ backgroundColor: "#F5F2EB", color: "#3D382E", border: "1px solid #E7E0D5" }}
          >
            ← Voltar
          </button>
          <button
            onClick={() => navigate("/menu")}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: "#8B0019" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#700010")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8B0019")}
          >
            Ir ao Menu
          </button>
        </div>
      </div>
    </div>
  );
}
