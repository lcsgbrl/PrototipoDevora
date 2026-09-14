import { useNavigate } from "react-router-dom";
import logoImg from "@/imports/image.png";
import { useAuth, UserRole } from "@/context/AuthContext";

const roleColors: Record<UserRole, { bg: string; text: string; border: string }> = {
  Aluno:         { bg: "#E3ECEE", text: "#1E5E60", border: "#B0CDD2" },
  Professor:     { bg: "#E8EFE2", text: "#3C5E53", border: "#B0CEB8" },
  Coordenador:   { bg: "#FFF8E6", text: "#805B00", border: "#FFE19A" },
  Administrador: { bg: "#FFF0F2", text: "#8B0019", border: "#FFD6D9" },
};

const allCards = [
  {
    to: "/dashboard",
    roles: ["Professor", "Coordenador", "Administrador"] as UserRole[],
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    label: "Dashboard",
    desc: "Visualize informações e indicadores importantes do sistema.",
    color: "#8B0019", bg: "#FFF0F2",
  },
  {
    to: "/reservas",
    roles: ["Aluno", "Professor", "Coordenador", "Administrador"] as UserRole[],
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    label: (role: UserRole) => role === "Aluno" ? "Ambientes e Solicitações" : "Reservas",
    desc: (role: UserRole) => role === "Aluno"
      ? "Consulte salas disponíveis e envie solicitações de reserva."
      : "Consulte, crie e gerencie reservas de ambientes.",
    color: "#1E5E60", bg: "#E3ECEE",
  },
  {
    to: "/membros",
    roles: ["Administrador"] as UserRole[],
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    label: "Membros",
    desc: "Gerencie os membros e organize as informações da equipe.",
    color: "#3C5E53", bg: "#E8EFE2",
  },
];

export default function Menu() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const rc = roleColors[user.role];

  const cards = allCards.filter((c) => c.roles.includes(user.role));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ backgroundColor: "#FAF9F6" }}>
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center p-2" style={{ backgroundColor: "#FFF0F2" }}>
            <img src={logoImg} alt="SGA" className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5" style={{ backgroundColor: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: rc.text }} />
          {user.role}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: "#1E1B15" }}>
          Olá, {user.nome.split(" ")[0]}
        </h1>
        <p className="text-base" style={{ color: "#776D5B" }}>
          {user.role === "Aluno"
            ? "Consulte ambientes disponíveis e envie suas solicitações."
            : user.role === "Professor"
            ? "Gerencie reservas e responda às solicitações dos seus alunos."
            : user.role === "Coordenador"
            ? "Acompanhe as reservas e autorize solicitações especiais."
            : "Gerencie reservas, ambientes e membros em um só lugar."}
        </p>
      </div>

      <div className={`grid gap-5 w-full max-w-3xl ${cards.length === 1 ? "max-w-sm" : cards.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-xl" : "grid-cols-1 sm:grid-cols-3"}`}>
        {cards.map((card) => {
          const label = typeof card.label === "function" ? card.label(user.role) : card.label;
          const desc = typeof card.desc === "function" ? card.desc(user.role) : card.desc;
          return (
            <button key={card.to} onClick={() => navigate(card.to)}
              className="group text-left p-7 rounded-2xl transition-all duration-200"
              style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.09)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "none"; }}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: card.bg, color: card.color }}>
                {card.icon}
              </div>
              <div className="font-bold text-base mb-2" style={{ color: "#1E1B15" }}>{label}</div>
              <div className="text-sm leading-relaxed" style={{ color: "#776D5B" }}>{desc}</div>
              <div className="flex items-center gap-1 mt-5 text-xs font-semibold transition-colors" style={{ color: card.color }}>
                Acessar
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-14 text-xs" style={{ color: "#E7E0D5" }}>SGA · v2.4.1</p>
    </div>
  );
}
