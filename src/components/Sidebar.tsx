import { NavLink, useNavigate } from "react-router-dom";
import logoImg from "@/imports/image.png";
import { useAuth, UserRole } from "@/context/AuthContext";

const roleColors: Record<UserRole, { bg: string; text: string }> = {
  Aluno:         { bg: "#E3ECEE", text: "#1E5E60" },
  Professor:     { bg: "#E8EFE2", text: "#3C5E53" },
  Coordenador:   { bg: "#FFF8E6", text: "#805B00" },
  Administrador: { bg: "#FFF0F2", text: "#8B0019" },
};

interface NavItem {
  to: string;
  label: string;
  roles: UserRole[];
  renderIcon: () => React.ReactNode;
}

const navItems: NavItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    roles: ["Professor", "Coordenador", "Administrador"],
    renderIcon: () => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: "/reservas",
    label: "Reservas",
    roles: ["Aluno", "Professor", "Coordenador", "Administrador"],
    renderIcon: () => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    to: "/academico",
    label: "Acadêmico",
    roles: ["Administrador", "Coordenador"],
    renderIcon: () => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
  {
    to: "/membros",
    label: "Membros",
    roles: ["Administrador"],
    renderIcon: () => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    to: "/configuracoes",
    label: "Configurações",
    roles: ["Aluno", "Professor", "Coordenador", "Administrador"],
    renderIcon: () => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

function navLinkClass(isActive: boolean) {
  const base = "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150";
  const active = "text-white";
  const inactive = "text-neutral-400 hover:text-neutral-200 hover:bg-white/5";
  return `${base} ${isActive ? active : inactive}`;
}

function navLinkStyle(isActive: boolean): React.CSSProperties {
  return isActive ? { backgroundColor: "#8B0019" } : {};
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleBadge = roleColors[user.role];

  const getLabel = (item: NavItem) => {
    if (item.to === "/reservas" && user.role === "Aluno") return "Minhas Solicitações";
    return item.label;
  };

  const visibleItems = navItems.filter((item) => item.roles.includes(user.role));

  const asideStyle: React.CSSProperties = {
    backgroundColor: "#14120D",
    position: "fixed",
    top: 0,
    left: 0,
    height: "100%",
    width: "240px",
    display: "flex",
    flexDirection: "column",
    zIndex: 30,
    transform: isOpen ? "translateX(0)" : "translateX(-100%)",
    transition: "transform 0.3s ease",
  };

  return (
    <>
      {isOpen && onClose && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 20, backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={onClose}
        />
      )}

      <aside style={asideStyle}>
        {/* Logo */}
        <div className="px-5 pt-7 pb-6" style={{ borderBottom: "1px solid #2A2620" }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center p-1.5 flex-shrink-0" style={{ backgroundColor: "#FAF9F6" }}>
              <img src={logoImg} alt="SGA" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-xs font-semibold leading-tight" style={{ color: "#FAF9F6" }}>SGA</div>
              <div className="text-xs leading-tight" style={{ color: "#776D5B" }}>Gestão de Ambientes</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          <div className="text-xs font-medium mb-3 px-2" style={{ color: "#4A4540" }}>NAVEGAÇÃO</div>
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => navLinkClass(isActive)}
              style={({ isActive }) => navLinkStyle(isActive)}
            >
              {item.renderIcon()}
              {getLabel(item)}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 pb-5 pt-3" style={{ borderTop: "1px solid #2A2620" }}>
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#8B0019", color: "white" }}>
              {user.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: "#FAF9F6" }}>{user.nome}</div>
              <div className="text-xs truncate" style={{ color: "#776D5B" }}>{user.role}</div>
            </div>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all duration-150 hover:bg-white/5"
            style={{ color: "#776D5B" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
