import { createContext, useContext, useState, ReactNode } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export interface Disciplina {
  id: number;
  codigo: string;
  nome: string;
  nucleoId: number;
  cargaHoraria: number;
  professoresIds: number[];
  turmasIds: number[];
}

export interface Turma {
  id: number;
  nome: string;
  cursoId: number;
  nucleoId: number;
  turno: string;
  alunosIds: number[];
  professoresIds: number[];
  disciplinasIds: number[];
  ativo: boolean;
}

export interface Curso {
  id: number;
  nome: string;
  nucleoId: number;
  turmasIds: number[];
  ativo: boolean;
}

export interface NucleoAcad {
  id: number;
  nome: string;
  descricao: string;
  cursosIds: number[];
  coordenadoresIds: number[];
  ativo: boolean;
}

// ── Seed data ────────────────────────────────────────────────────────────────

const seedNucleos: NucleoAcad[] = [
  { id: 1, nome: "Saúde",         descricao: "Cursos da área da saúde",              cursosIds: [1,2,3],    coordenadoresIds: [12], ativo: true },
  { id: 2, nome: "Engenharia",    descricao: "Cursos de engenharia e exatas",         cursosIds: [4,5,6],    coordenadoresIds: [3],  ativo: true },
  { id: 3, nome: "Computação",    descricao: "Cursos de tecnologia e computação",     cursosIds: [7,8],      coordenadoresIds: [4],  ativo: true },
  { id: 4, nome: "Administração", descricao: "Cursos de gestão e negócios",           cursosIds: [9,10,11],  coordenadoresIds: [],   ativo: true },
  { id: 5, nome: "Direito",       descricao: "Cursos jurídicos e legislação",         cursosIds: [12],       coordenadoresIds: [],   ativo: true },
];

const seedCursos: Curso[] = [
  { id: 1,  nome: "Enfermagem",             nucleoId: 1, turmasIds: [1,2],    ativo: true },
  { id: 2,  nome: "Fisioterapia",           nucleoId: 1, turmasIds: [3],      ativo: true },
  { id: 3,  nome: "Medicina",               nucleoId: 1, turmasIds: [4],      ativo: true },
  { id: 4,  nome: "Engenharia Civil",       nucleoId: 2, turmasIds: [5,6],    ativo: true },
  { id: 5,  nome: "Engenharia Mecânica",    nucleoId: 2, turmasIds: [7],      ativo: true },
  { id: 6,  nome: "Engenharia de Software", nucleoId: 2, turmasIds: [8],      ativo: true },
  { id: 7,  nome: "Sistemas de Informação", nucleoId: 3, turmasIds: [9,10],   ativo: true },
  { id: 8,  nome: "Ciências da Computação", nucleoId: 3, turmasIds: [11],     ativo: true },
  { id: 9,  nome: "Administração",          nucleoId: 4, turmasIds: [12],     ativo: true },
  { id: 10, nome: "Recursos Humanos",       nucleoId: 4, turmasIds: [13],     ativo: true },
  { id: 11, nome: "Contabilidade",          nucleoId: 4, turmasIds: [14],     ativo: true },
  { id: 12, nome: "Direito",                nucleoId: 5, turmasIds: [15],     ativo: true },
];

export const TURNOS = ["Matutino", "Vespertino", "Noturno", "Integral"] as const;

const seedTurmas: Turma[] = [
  { id: 1,  nome: "ENF-01",        cursoId: 1,  nucleoId: 1, turno: "Matutino",   alunosIds: [7,8],   professoresIds: [6],  disciplinasIds: [1,2,3],   ativo: true },
  { id: 2,  nome: "ENF-02",        cursoId: 1,  nucleoId: 1, turno: "Noturno",    alunosIds: [],      professoresIds: [6],  disciplinasIds: [1,2,3],   ativo: true },
  { id: 3,  nome: "FISIO-01",      cursoId: 2,  nucleoId: 1, turno: "Vespertino", alunosIds: [],      professoresIds: [],    disciplinasIds: [4,5],     ativo: true },
  { id: 4,  nome: "MED-01",        cursoId: 3,  nucleoId: 1, turno: "Integral",   alunosIds: [],      professoresIds: [],    disciplinasIds: [1,4,5],   ativo: true },
  { id: 5,  nome: "ENG-CIVIL-01",  cursoId: 4,  nucleoId: 2, turno: "Noturno",    alunosIds: [7],     professoresIds: [2],  disciplinasIds: [6,7,8],   ativo: true },
  { id: 6,  nome: "ENG-CIVIL-02",  cursoId: 4,  nucleoId: 2, turno: "Matutino",   alunosIds: [],      professoresIds: [2],  disciplinasIds: [6,7,8],   ativo: true },
  { id: 7,  nome: "ENG-MEC-01",    cursoId: 5,  nucleoId: 2, turno: "Vespertino", alunosIds: [],      professoresIds: [],    disciplinasIds: [6,9],     ativo: true },
  { id: 8,  nome: "ENG-SW-01",     cursoId: 6,  nucleoId: 2, turno: "Noturno",    alunosIds: [],      professoresIds: [5],  disciplinasIds: [10,7],    ativo: true },
  { id: 9,  nome: "SI-04",         cursoId: 7,  nucleoId: 3, turno: "Noturno",    alunosIds: [8,13],  professoresIds: [5,2],disciplinasIds: [10,11,7], ativo: true },
  { id: 10, nome: "SI-05",         cursoId: 7,  nucleoId: 3, turno: "Matutino",   alunosIds: [],      professoresIds: [5],  disciplinasIds: [10,11],   ativo: true },
  { id: 11, nome: "CC-01",         cursoId: 8,  nucleoId: 3, turno: "Vespertino", alunosIds: [],      professoresIds: [2,5],disciplinasIds: [10,11,12],ativo: true },
  { id: 12, nome: "ADM-01",        cursoId: 9,  nucleoId: 4, turno: "Noturno",    alunosIds: [],      professoresIds: [11], disciplinasIds: [13,14],   ativo: true },
  { id: 13, nome: "RH-01",         cursoId: 10, nucleoId: 4, turno: "Matutino",   alunosIds: [],      professoresIds: [11], disciplinasIds: [13,15],   ativo: true },
  { id: 14, nome: "CONT-01",       cursoId: 11, nucleoId: 4, turno: "Noturno",    alunosIds: [],      professoresIds: [],    disciplinasIds: [14,15],   ativo: true },
  { id: 15, nome: "DIR-01",        cursoId: 12, nucleoId: 5, turno: "Vespertino", alunosIds: [],      professoresIds: [],    disciplinasIds: [16,17],   ativo: true },
];

const seedDisciplinas: Disciplina[] = [
  { id: 1,  codigo: "SAU001", nome: "Anatomia",                 nucleoId: 1, cargaHoraria: 60,  professoresIds: [6],  turmasIds: [1,2,4] },
  { id: 2,  codigo: "SAU002", nome: "Fisiologia",               nucleoId: 1, cargaHoraria: 60,  professoresIds: [6],  turmasIds: [1,2] },
  { id: 3,  codigo: "SAU003", nome: "Bioquímica",               nucleoId: 1, cargaHoraria: 45,  professoresIds: [],   turmasIds: [1,2] },
  { id: 4,  codigo: "SAU004", nome: "Farmacologia",             nucleoId: 1, cargaHoraria: 60,  professoresIds: [],   turmasIds: [3,4] },
  { id: 5,  codigo: "SAU005", nome: "Patologia",                nucleoId: 1, cargaHoraria: 60,  professoresIds: [],   turmasIds: [3,4] },
  { id: 6,  codigo: "ENG001", nome: "Resistência dos Materiais",nucleoId: 2, cargaHoraria: 75,  professoresIds: [2],  turmasIds: [5,6,7] },
  { id: 7,  codigo: "MAT001", nome: "Cálculo II",               nucleoId: 2, cargaHoraria: 75,  professoresIds: [2],  turmasIds: [5,6,8,9] },
  { id: 8,  codigo: "ENG002", nome: "Desenho Técnico",          nucleoId: 2, cargaHoraria: 45,  professoresIds: [2],  turmasIds: [5,6] },
  { id: 9,  codigo: "ENG003", nome: "Termodinâmica",            nucleoId: 2, cargaHoraria: 60,  professoresIds: [],   turmasIds: [7] },
  { id: 10, codigo: "COMP001",nome: "Programação",              nucleoId: 3, cargaHoraria: 60,  professoresIds: [5],  turmasIds: [8,9,10,11] },
  { id: 11, codigo: "COMP002",nome: "Banco de Dados",           nucleoId: 3, cargaHoraria: 60,  professoresIds: [5],  turmasIds: [9,10,11] },
  { id: 12, codigo: "COMP003",nome: "Redes de Computadores",    nucleoId: 3, cargaHoraria: 45,  professoresIds: [5],  turmasIds: [11] },
  { id: 13, codigo: "ADM001", nome: "Gestão Empresarial",       nucleoId: 4, cargaHoraria: 60,  professoresIds: [11], turmasIds: [12,13] },
  { id: 14, codigo: "ADM002", nome: "Finanças Corporativas",    nucleoId: 4, cargaHoraria: 60,  professoresIds: [11], turmasIds: [12,14] },
  { id: 15, codigo: "ADM003", nome: "Recursos Humanos",         nucleoId: 4, cargaHoraria: 45,  professoresIds: [11], turmasIds: [13,14] },
  { id: 16, codigo: "DIR001", nome: "Direito Constitucional",   nucleoId: 5, cargaHoraria: 75,  professoresIds: [],   turmasIds: [15] },
  { id: 17, codigo: "DIR002", nome: "Direito Civil",            nucleoId: 5, cargaHoraria: 75,  professoresIds: [],   turmasIds: [15] },
];

// ── Context ──────────────────────────────────────────────────────────────────

interface AcademicContextValue {
  nucleos: NucleoAcad[];
  cursos: Curso[];
  turmas: Turma[];
  disciplinas: Disciplina[];

  // Helpers
  getNucleoById: (id: number) => NucleoAcad | undefined;
  getCursoById: (id: number) => Curso | undefined;
  getTurmaById: (id: number) => Turma | undefined;
  getDisciplinaById: (id: number) => Disciplina | undefined;
  getCursosByNucleo: (nucleoId: number) => Curso[];
  getTurmasByCurso: (cursoId: number) => Turma[];
  getDisciplinasByTurma: (turmaId: number) => Disciplina[];
  getDisciplinasByNucleo: (nucleoId: number) => Disciplina[];
  getNucleoByName: (nome: string) => NucleoAcad | undefined;

  // Nucleo CRUD
  addNucleo: (n: Omit<NucleoAcad, "id">) => void;
  updateNucleo: (id: number, data: Partial<NucleoAcad>) => void;
  deleteNucleo: (id: number) => void;

  // Curso CRUD
  addCurso: (c: Omit<Curso, "id">) => void;
  updateCurso: (id: number, data: Partial<Curso>) => void;
  deleteCurso: (id: number) => void;

  // Turma CRUD
  addTurma: (t: Omit<Turma, "id">) => void;
  updateTurma: (id: number, data: Partial<Turma>) => void;
  deleteTurma: (id: number) => void;

  // Disciplina CRUD
  addDisciplina: (d: Omit<Disciplina, "id">) => void;
  updateDisciplina: (id: number, data: Partial<Disciplina>) => void;
  deleteDisciplina: (id: number) => void;
}

const AcademicContext = createContext<AcademicContextValue | null>(null);

export function AcademicProvider({ children }: { children: ReactNode }) {
  const [nucleos, setNucleos] = useState<NucleoAcad[]>(seedNucleos);
  const [cursos, setCursos] = useState<Curso[]>(seedCursos);
  const [turmas, setTurmas] = useState<Turma[]>(seedTurmas);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>(seedDisciplinas);
  const [nextId, setNextId] = useState(100);
  const newId = () => { const id = nextId; setNextId(n => n + 1); return id; };

  const getNucleoById = (id: number) => nucleos.find(n => n.id === id);
  const getCursoById = (id: number) => cursos.find(c => c.id === id);
  const getTurmaById = (id: number) => turmas.find(t => t.id === id);
  const getDisciplinaById = (id: number) => disciplinas.find(d => d.id === id);
  const getCursosByNucleo = (nucleoId: number) => cursos.filter(c => c.nucleoId === nucleoId && c.ativo);
  const getTurmasByCurso = (cursoId: number) => turmas.filter(t => t.cursoId === cursoId && t.ativo);
  const getDisciplinasByTurma = (turmaId: number) => disciplinas.filter(d => d.turmasIds.includes(turmaId));
  const getDisciplinasByNucleo = (nucleoId: number) => disciplinas.filter(d => d.nucleoId === nucleoId);
  const getNucleoByName = (nome: string) => nucleos.find(n => n.nome === nome);

  const addNucleo = (n: Omit<NucleoAcad, "id">) =>
    setNucleos(prev => [...prev, { ...n, id: newId() }]);
  const updateNucleo = (id: number, data: Partial<NucleoAcad>) =>
    setNucleos(prev => prev.map(n => n.id === id ? { ...n, ...data } : n));
  const deleteNucleo = (id: number) =>
    setNucleos(prev => prev.filter(n => n.id !== id));

  const addCurso = (c: Omit<Curso, "id">) => {
    const id = newId();
    setCursos(prev => [...prev, { ...c, id }]);
    setNucleos(prev => prev.map(n => n.id === c.nucleoId ? { ...n, cursosIds: [...n.cursosIds, id] } : n));
  };
  const updateCurso = (id: number, data: Partial<Curso>) =>
    setCursos(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  const deleteCurso = (id: number) => {
    const c = cursos.find(c => c.id === id);
    setCursos(prev => prev.filter(c => c.id !== id));
    if (c) setNucleos(prev => prev.map(n => ({ ...n, cursosIds: n.cursosIds.filter(cid => cid !== id) })));
  };

  const addTurma = (t: Omit<Turma, "id">) => {
    const id = newId();
    setTurmas(prev => [...prev, { ...t, id }]);
    setCursos(prev => prev.map(c => c.id === t.cursoId ? { ...c, turmasIds: [...c.turmasIds, id] } : c));
  };
  const updateTurma = (id: number, data: Partial<Turma>) =>
    setTurmas(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  const deleteTurma = (id: number) => {
    const t = turmas.find(t => t.id === id);
    setTurmas(prev => prev.filter(t => t.id !== id));
    if (t) setCursos(prev => prev.map(c => ({ ...c, turmasIds: c.turmasIds.filter(tid => tid !== id) })));
  };

  const addDisciplina = (d: Omit<Disciplina, "id">) =>
    setDisciplinas(prev => [...prev, { ...d, id: newId() }]);
  const updateDisciplina = (id: number, data: Partial<Disciplina>) =>
    setDisciplinas(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
  const deleteDisciplina = (id: number) =>
    setDisciplinas(prev => prev.filter(d => d.id !== id));

  return (
    <AcademicContext.Provider value={{
      nucleos, cursos, turmas, disciplinas,
      getNucleoById, getCursoById, getTurmaById, getDisciplinaById,
      getCursosByNucleo, getTurmasByCurso, getDisciplinasByTurma, getDisciplinasByNucleo,
      getNucleoByName,
      addNucleo, updateNucleo, deleteNucleo,
      addCurso, updateCurso, deleteCurso,
      addTurma, updateTurma, deleteTurma,
      addDisciplina, updateDisciplina, deleteDisciplina,
    }}>
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic() {
  const ctx = useContext(AcademicContext);
  if (!ctx) throw new Error("useAcademic must be inside AcademicProvider");
  return ctx;
}
