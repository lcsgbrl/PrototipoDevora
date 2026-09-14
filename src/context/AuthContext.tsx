import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "Aluno" | "Professor" | "Coordenador" | "Administrador";
export const NUCLEOS = ["Saúde", "Engenharia", "Computação", "Administração", "Direito"] as const;
export type Nucleo = typeof NUCLEOS[number];

export interface Permissions {
  canViewSalas: boolean;
  canCheckAvailability: boolean;
  canViewSalaResources: boolean;
  canRequestReserva: boolean;
  canMakeDirectReserva: boolean;
  canApproveStudentRequests: boolean;
  canApproveAuthRequests: boolean;
  canViewAllReservas: boolean;
  canViewOwnReservas: boolean;
  canManageUsers: boolean;
  canManageSalas: boolean;
  canViewMembros: boolean;
  canViewDashboard: boolean;
  canViewConfig: boolean;
  canManageAcademic: boolean;
}

const PERMISSIONS_MATRIX: Record<UserRole, Permissions> = {
  Aluno: {
    canViewSalas: true, canCheckAvailability: true, canViewSalaResources: true,
    canRequestReserva: true, canMakeDirectReserva: false,
    canApproveStudentRequests: false, canApproveAuthRequests: false,
    canViewAllReservas: false, canViewOwnReservas: true,
    canManageUsers: false, canManageSalas: false, canViewMembros: false,
    canViewDashboard: false, canViewConfig: true, canManageAcademic: false,
  },
  Professor: {
    canViewSalas: true, canCheckAvailability: true, canViewSalaResources: true,
    canRequestReserva: true, canMakeDirectReserva: true,
    canApproveStudentRequests: true, canApproveAuthRequests: false,
    canViewAllReservas: false, canViewOwnReservas: true,
    canManageUsers: false, canManageSalas: false, canViewMembros: false,
    canViewDashboard: true, canViewConfig: true, canManageAcademic: false,
  },
  Coordenador: {
    canViewSalas: true, canCheckAvailability: true, canViewSalaResources: true,
    canRequestReserva: false, canMakeDirectReserva: true,
    canApproveStudentRequests: false, canApproveAuthRequests: true,
    canViewAllReservas: true, canViewOwnReservas: true,
    canManageUsers: false, canManageSalas: false, canViewMembros: false,
    canViewDashboard: true, canViewConfig: true, canManageAcademic: true,
  },
  Administrador: {
    canViewSalas: true, canCheckAvailability: true, canViewSalaResources: true,
    canRequestReserva: false, canMakeDirectReserva: true,
    canApproveStudentRequests: false, canApproveAuthRequests: false,
    canViewAllReservas: true, canViewOwnReservas: true,
    canManageUsers: true, canManageSalas: true, canViewMembros: true,
    canViewDashboard: true, canViewConfig: true, canManageAcademic: true,
  },
};

export interface DemoUser {
  nome: string;
  email: string;
  role: UserRole;
  initials: string;
  depto: string;
  curso?: string;
  turno?: string;
  turma?: string;
  disciplinas?: string[];
  nucleo?: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    nome: "Ana Santos", email: "ana.santos@inst.edu.br",
    role: "Administrador", initials: "AS", depto: "TI",
    // Admin: sem restrição de núcleo
  },
  {
    nome: "Prof. André Lemos", email: "andre.lemos@inst.edu.br",
    role: "Professor", initials: "AL", depto: "Física",
    nucleo: "Engenharia",
  },
  {
    nome: "Prof. Carlos Silva", email: "carlos.silva@inst.edu.br",
    role: "Professor", initials: "CS", depto: "Computação",
    nucleo: "Computação",
  },
  {
    nome: "Dra. Fátima Ramos", email: "fatima.ramos@inst.edu.br",
    role: "Coordenador", initials: "FR", depto: "Engenharia",
    nucleo: "Engenharia",
  },
  {
    nome: "Mariana Costa", email: "mariana.costa@inst.edu.br",
    role: "Coordenador", initials: "MC", depto: "Computação",
    nucleo: "Computação",
  },
  {
    nome: "João Pedro", email: "joao.pedro@aluno.inst.edu.br",
    role: "Aluno", initials: "JP", depto: "Engenharia",
    curso: "Engenharia Civil", turno: "Noturno", turma: "ENG-CIVIL-01",
    disciplinas: ["Resistência dos Materiais","Cálculo II","Desenho Técnico"],
    nucleo: "Engenharia",
  },
  {
    nome: "Maria Clara", email: "maria.clara@aluno.inst.edu.br",
    role: "Aluno", initials: "MC", depto: "Computação",
    curso: "Sistemas de Informação", turno: "Noturno", turma: "SI-04",
    disciplinas: ["Programação","Banco de Dados","Cálculo II"],
    nucleo: "Computação",
  },
  {
    nome: "Dr. João Paulo", email: "joao.paulo@inst.edu.br",
    role: "Coordenador", initials: "JP", depto: "Saúde",
    nucleo: "Saúde",
  },
  {
    nome: "Lucas Ferreira", email: "lucas.ferreira@aluno.inst.edu.br",
    role: "Aluno", initials: "LF", depto: "Computação",
    curso: "Sistemas de Informação", turno: "Noturno", turma: "SI-04",
    disciplinas: ["Programação","Banco de Dados","Cálculo II"],
    nucleo: "Computação",
  },
];

interface AuthContextValue {
  user: DemoUser;
  permissions: Permissions;
  isAdmin: boolean;
  setUser: (user: DemoUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<DemoUser>(DEMO_USERS[0]); // default: Admin

  const setUser = (u: DemoUser) => setUserState(u);
  const logout = () => setUserState(DEMO_USERS[0]);

  return (
    <AuthContext.Provider value={{
      user,
      permissions: PERMISSIONS_MATRIX[user.role],
      isAdmin: user.role === "Administrador",
      setUser,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function usePermission(key: keyof Permissions) {
  const { permissions } = useAuth();
  return permissions[key];
}
