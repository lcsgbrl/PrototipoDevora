import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useReservas, type Solicitacao } from "@/context/ReservasContext";
import { useAcademic } from "@/context/AcademicContext";
import { Navigate, useNavigate } from "react-router-dom";

// ── Status style ──────────────────────────────────────────────────────────────
const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
  Pendente:     { bg: "#FFF8E6", text: "#805B00", dot: "#B08A00" },
  "Em análise": { bg: "#E3ECEE", text: "#1E5E60", dot: "#1E5E60" },
  Aprovado:     { bg: "#EAF5EA", text: "#2B5E2B", dot: "#4A9A4A" },
  Recusado:     { bg: "#FDF0F2", text: "#991B1B", dot: "#C0303F" },
  Cancelado:    { bg: "#F5F2EB", text: "#776D5B", dot: "#A8A09A" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function parsePtDate(d: string): Date {
  const [day, month, year] = d.split("/").map(Number);
  return new Date(year, month - 1, day);
}

function parseMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function diffHours(inicio: string, fim: string): number {
  return Math.max(0, (parseMinutes(fim) - parseMinutes(inicio)) / 60);
}

function formatHoras(total: number): string {
  const h = Math.floor(total);
  const m = Math.round((total - h) * 60);
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

// ── Tooltip components ────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: "#1E1B15", color: "#FAF9F6" }}>
        <div className="font-semibold">{label}</div>
        <div style={{ color: "#FFA8B0" }}>{payload[0].value} {payload[0].name ?? "reservas"}</div>
      </div>
    );
  }
  return null;
};

const HBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: "#1E1B15", color: "#FAF9F6" }}>
        <div className="font-semibold mb-0.5">{label}</div>
        <div style={{ color: "#FFA8B0" }}>{payload[0].value} {payload[0].name}</div>
      </div>
    );
  }
  return null;
};

const OccTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: "#1E1B15", color: "#FAF9F6" }}>
        <div className="font-semibold mb-0.5">{label}</div>
        <div style={{ color: "#A8E6CF" }}>Taxa: {payload[0].value}%</div>
      </div>
    );
  }
  return null;
};

function occColor(taxa: number) {
  if (taxa >= 70) return "#8B0019";
  if (taxa >= 50) return "#1E5E60";
  return "#A8A09A";
}

// ── Admin/Coord static data ───────────────────────────────────────────────────
const weekData = [
  { day: "Seg", reservas: 18 }, { day: "Ter", reservas: 27 }, { day: "Qua", reservas: 31 },
  { day: "Qui", reservas: 24 }, { day: "Sex", reservas: 29 }, { day: "Sáb", reservas: 9 }, { day: "Dom", reservas: 4 },
];

const allRoomStats = [
  { sala: "Lab. de Informática", tipo: "laboratorios", bloco: "bloco_b", reservas: 42, horas: 84, pessoas: 1344, capacidade: 45 },
  { sala: "Sala Multimídia",     tipo: "salas_aula",   bloco: "bloco_b", reservas: 35, horas: 70, pessoas: 980,  capacidade: 40 },
  { sala: "Auditório Central",   tipo: "auditorios",   bloco: "bloco_c", reservas: 28, horas: 112, pessoas: 3360, capacidade: 300 },
  { sala: "Sala de Reuniões",    tipo: "salas_reuniao", bloco: "bloco_a", reservas: 21, horas: 31.5, pessoas: 210, capacidade: 20 },
  { sala: "Sala de Estudos",     tipo: "salas_aula",   bloco: "bloco_a", reservas: 17, horas: 34, pessoas: 306,  capacidade: 30 },
  { sala: "Lab. de Química",     tipo: "laboratorios", bloco: "bloco_d", reservas: 14, horas: 28, pessoas: 252,  capacidade: 25 },
];

const allPeakHours = [
  { slot: "08–10h", reservas: 28 },
  { slot: "10–12h", reservas: 45 },
  { slot: "12–14h", reservas: 12 },
  { slot: "14–16h", reservas: 52 },
  { slot: "16–18h", reservas: 38 },
  { slot: "18–22h", reservas: 22 },
];

// ── Professor static simulated data ──────────────────────────────────────────
const profBaseRooms = [
  { sala: "Lab. de Informática", capacidade: 45, reservas: 8, horas: 16, pessoas: 256 },
  { sala: "Sala Multimídia",     capacidade: 40, reservas: 5, horas: 10, pessoas: 130 },
  { sala: "Sala de Estudos",     capacidade: 30, reservas: 3, horas: 6,  pessoas: 45 },
  { sala: "Auditório Central",   capacidade: 300, reservas: 1, horas: 4, pessoas: 120 },
];

const profBaseHours = [
  { periodo: "Manhã",  label: "08:00–12:00", reservas: 4 },
  { periodo: "Tarde",  label: "12:00–18:00", reservas: 10 },
  { periodo: "Noite",  label: "18:00–22:00", reservas: 3 },
];

// ── Monthly calendar helpers ──────────────────────────────────────────────────
const TIME_SLOTS = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
const SLOT_END   = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

// Each room has a nucleo so we can filter
const MONTHLY_ROOMS = [
  { sala: "Lab. de Informática", bloco: "Bloco B — 102", nucleo: "Computação",    tipo: "Laboratório" },
  { sala: "Sala Multimídia",     bloco: "Bloco B — 305", nucleo: "Engenharia",    tipo: "Aula" },
  { sala: "Auditório Central",   bloco: "Bloco C — Térreo", nucleo: "Global",     tipo: "Auditório" },
  { sala: "Sala de Reuniões",    bloco: "Bloco A — 201", nucleo: "Administração", tipo: "Reunião" },
  { sala: "Lab. de Química",     bloco: "Bloco D — 104", nucleo: "Engenharia",    tipo: "Laboratório" },
  { sala: "Sala de Estudos",     bloco: "Bloco A — 103", nucleo: "Computação",    tipo: "Estudo" },
];
const MONTHLY_SOLICITANTES = ["Prof. André Lemos", "Mariana Costa", "João Pedro", "Maria Clara", "Dra. Fátima Ramos", "Prof. Carlos Silva"];
const MONTHLY_STATUSES: StatusSol[] = ["Aprovado", "Aprovado", "Aprovado", "Pendente", "Em análise"];
type StatusSol = "Aprovado" | "Pendente" | "Em análise" | "Cancelado";

function seededInt(seed: number, max: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return Math.abs(Math.floor((x - Math.floor(x)) * max));
}

type CellInfo = {
  sala: string; bloco: string; inicio: string; fim: string;
  pessoas: number; solicitante: string; status: string;
  nucleo: string; tipo: string;
};
// Map now holds arrays — multiple rooms can be booked per time slot
type MonthlyMap = Record<number, Record<string, CellInfo[]>>;

function buildMonthlyMap(year: number, month: number): MonthlyMap {
  const daysInMonth = new Date(year, month, 0).getDate();
  const map: MonthlyMap = {};
  for (let d = 1; d <= daysInMonth; d++) {
    map[d] = {};
    for (let si = 0; si < TIME_SLOTS.length; si++) {
      const entries: CellInfo[] = [];
      // Each room is checked independently — multiple can be booked simultaneously
      for (let ri = 0; ri < MONTHLY_ROOMS.length; ri++) {
        const seed = d * 10000 + si * 1000 + ri * 100 + month * 31 + year;
        if (seededInt(seed, 3) === 1) { // ~33% chance per room per slot
          const pi  = seededInt(seed + 3, MONTHLY_SOLICITANTES.length);
          const sti = seededInt(seed + 5, MONTHLY_STATUSES.length);
          const room = MONTHLY_ROOMS[ri];
          entries.push({
            sala: room.sala, bloco: room.bloco,
            nucleo: room.nucleo, tipo: room.tipo,
            inicio: TIME_SLOTS[si], fim: SLOT_END[si],
            pessoas: 10 + seededInt(seed + 9, 40),
            solicitante: MONTHLY_SOLICITANTES[pi],
            status: MONTHLY_STATUSES[sti],
          });
        }
      }
      map[d][TIME_SLOTS[si]] = entries;
    }
  }
  return map;
}

// ── Weekly map helpers ────────────────────────────────────────────────────────
const DAY_NAMES_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
type WeeklyMap = Record<number, Record<string, CellInfo[]>>; // 0=Mon … 6=Sun

function getMonday(d: Date): Date {
  const dow = d.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
}

function fmtShortDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function buildWeeklyMap(weekStart: Date): WeeklyMap {
  const map: WeeklyMap = {};
  for (let wd = 0; wd < 7; wd++) {
    map[wd] = {};
    const date = new Date(weekStart);
    date.setDate(date.getDate() + wd);
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dayOfYear   = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
    for (let si = 0; si < TIME_SLOTS.length; si++) {
      const entries: CellInfo[] = [];
      for (let ri = 0; ri < MONTHLY_ROOMS.length; ri++) {
        const seed = dayOfYear * 10000 + si * 1000 + ri * 100 + date.getMonth() * 31 + date.getFullYear();
        if (seededInt(seed, 3) === 1) {
          const pi  = seededInt(seed + 3, MONTHLY_SOLICITANTES.length);
          const sti = seededInt(seed + 5, MONTHLY_STATUSES.length);
          const room = MONTHLY_ROOMS[ri];
          entries.push({
            sala: room.sala, bloco: room.bloco, nucleo: room.nucleo, tipo: room.tipo,
            inicio: TIME_SLOTS[si], fim: SLOT_END[si],
            pessoas: 10 + seededInt(seed + 9, 40),
            solicitante: MONTHLY_SOLICITANTES[pi],
            status: MONTHLY_STATUSES[sti],
          });
        }
      }
      map[wd][TIME_SLOTS[si]] = entries;
    }
  }
  return map;
}

// ── Filter types ──────────────────────────────────────────────────────────────
type PeriodoFilter = "semana_atual" | "mes_atual" | "ultimos_3_meses" | "personalizado";
type AmbienteFilter = "todos" | "laboratorios" | "salas_aula" | "auditorios" | "salas_reuniao";
type BlocoFilter = "todos" | "bloco_a" | "bloco_b" | "bloco_c" | "bloco_d";
type SortBy = "reservas" | "horas" | "pessoas";
type ProfPeriodo = "semana" | "mes" | "trimestre" | "tudo";

const periodMultiplier: Record<PeriodoFilter, number> = {
  semana_atual: 0.25, mes_atual: 1, ultimos_3_meses: 3, personalizado: 2,
};
const profPeriodMult: Record<ProfPeriodo, number> = {
  semana: 0.25, mes: 1, trimestre: 3, tudo: 5,
};

// ═════════════════════════════════════════════════════════════════════════════
// PROFESSOR DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
function ProfessorDashboard({ userName, myReservas }: { userName: string; myReservas: Solicitacao[] }) {
  const navigate = useNavigate();
  const [profPeriodo, setProfPeriodo] = useState<ProfPeriodo>("mes");
  const mult = profPeriodMult[profPeriodo];

  // Real data metrics
  const validReservas = myReservas.filter(r => r.status !== "Cancelado" && r.status !== "Recusado");
  const totalHorasReal = validReservas.reduce((sum, r) => sum + diffHours(r.inicio, r.fim), 0);
  const mediaParticipReal = validReservas.length ? Math.round(validReservas.reduce((s, r) => s + r.pessoas, 0) / validReservas.length) : 0;

  // Chart data (simulated, scaled by period)
  const chartRooms = profBaseRooms.map(r => ({
    ...r,
    reservas: Math.max(1, Math.round(r.reservas * mult)),
    horas:    Math.round(r.horas * mult * 10) / 10,
    pessoas:  Math.round(r.pessoas * mult),
  })).sort((a, b) => b.reservas - a.reservas);

  const chartHours = profBaseHours.map(h => ({
    ...h,
    reservas: Math.max(1, Math.round(h.reservas * mult)),
  }));

  const totalChartReservas = chartHours.reduce((s, h) => s + h.reservas, 0);
  const peakPeriodo = [...chartHours].sort((a, b) => b.reservas - a.reservas)[0];

  const salaTop = chartRooms[0];

  // Cards
  const totalReservasCard = validReservas.length || Math.round(profBaseRooms.reduce((s, r) => s + r.reservas, 0) * mult);
  const totalHorasCard = totalHorasReal > 0 ? formatHoras(totalHorasReal) : formatHoras(profBaseRooms.reduce((s, r) => s + r.horas, 0) * mult);
  const mediaCard = mediaParticipReal > 0 ? mediaParticipReal : Math.round(profBaseRooms.reduce((s, r) => s + r.pessoas, 0) / profBaseRooms.reduce((s, r) => s + r.reservas, 0));

  // Próxima reserva (real data)
  const today = new Date(2026, 7, 26);
  const futureReservas = validReservas
    .filter(r => parsePtDate(r.data) >= today)
    .sort((a, b) => parsePtDate(a.data).getTime() - parsePtDate(b.data).getTime());
  const proxima = futureReservas[0] ?? null;
  const proximaDiff = proxima ? Math.ceil((parsePtDate(proxima.data).getTime() - today.getTime()) / 86400000) : 0;

  // Insights (dynamic)
  const insights: string[] = [];
  if (salaTop) insights.push(`Você utiliza mais o ${salaTop.sala} — ${salaTop.reservas} reservas no período.`);
  if (peakPeriodo) insights.push(`Suas reservas acontecem principalmente no período da ${peakPeriodo.periodo.toLowerCase()} (${peakPeriodo.label}).`);
  const avgOcc = chartRooms[0] ? Math.round((chartRooms[0].pessoas / chartRooms[0].reservas) / chartRooms[0].capacidade * 100) : 0;
  if (avgOcc > 60) insights.push(`${chartRooms[0]?.sala} possui alta taxa de ocupação nas suas reservas (${avgOcc}%).`);
  insights.push(`Você realizou ${Math.round(profBaseRooms.reduce((s, r) => s + r.reservas, 0) * mult)} reservas no período selecionado.`);
  if (mult > 1) insights.push("A média de participantes cresceu em relação ao período anterior.");

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold mb-1" style={{ color: "#8B0019", letterSpacing: "0.08em" }}>VISÃO PESSOAL</p>
        <h1 className="text-2xl font-bold" style={{ color: "#1E1B15" }}>Meu Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "#776D5B" }}>
          Acompanhe suas reservas, utilização dos ambientes e principais indicadores — {userName.split(" ").slice(0, 2).join(" ")}
        </p>
      </div>

      {/* Period filter */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold" style={{ color: "#776D5B" }}>Período:</span>
        <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid #E7E0D5" }}>
          {([["semana", "Última semana"], ["mes", "Último mês"], ["trimestre", "Últimos 3 meses"], ["tudo", "Todo o período"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setProfPeriodo(key)}
              className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={{ backgroundColor: profPeriodo === key ? "#8B0019" : "#FAF9F6", color: profPeriodo === key ? "#FFF" : "#776D5B" }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total de reservas", value: String(totalReservasCard),
            sub: "Reservas realizadas no período.",
            iconBg: "#FFF0F2", iconColor: "#8B0019",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
          },
          {
            label: "Sala mais utilizada", value: salaTop?.sala.split(" ").slice(0, 2).join(" ") ?? "—",
            sub: `${salaTop?.reservas ?? 0} reservas realizadas.`,
            iconBg: "#E3ECEE", iconColor: "#1E5E60",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
          },
          {
            label: "Média de participantes", value: `${mediaCard} alunos`,
            sub: "Média de participantes por reserva.",
            iconBg: "#EAF5EA", iconColor: "#2B5E2B",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
          },
          {
            label: "Total de horas utilizadas", value: totalHorasCard,
            sub: "Tempo total de utilização dos ambientes.",
            iconBg: "#FFF8E6", iconColor: "#805B00",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
          },
        ].map(m => (
          <div key={m.label} className="p-5 rounded-2xl" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: m.iconBg, color: m.iconColor }}>{m.icon}</div>
            <div className="text-2xl font-extrabold mb-1" style={{ color: "#1E1B15" }}>{m.value}</div>
            <div className="text-xs font-medium mb-1" style={{ color: "#3D382E" }}>{m.label}</div>
            <div className="text-xs" style={{ color: "#A8A09A" }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Próxima reserva + horários */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Próxima reserva */}
        <div className="p-6 rounded-2xl flex flex-col" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#8B0019", letterSpacing: "0.06em" }}>PRÓXIMA RESERVA</p>
          {proxima ? (
            <>
              <h3 className="text-base font-bold mt-1 mb-3" style={{ color: "#1E1B15" }}>{proxima.sala}</h3>
              <div className="text-xs mb-1" style={{ color: "#776D5B" }}>{proxima.bloco}</div>
              <div className="space-y-2 mt-3">
                <div className="flex items-center gap-2 text-sm" style={{ color: "#3D382E" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B0019" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {proxima.data}
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: "#3D382E" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B0019" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {proxima.inicio}–{proxima.fim}
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: "#3D382E" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B0019" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  {proxima.pessoas} participantes
                </div>
              </div>
              <div className="mt-4 px-3 py-1.5 rounded-lg text-xs font-semibold self-start" style={{ backgroundColor: "#FFF0F2", color: "#8B0019" }}>
                {proximaDiff === 0 ? "Hoje" : proximaDiff === 1 ? "Amanhã" : `Faltam ${proximaDiff} dias`}
              </div>
            </>
          ) : (
            <p className="text-sm mt-4" style={{ color: "#776D5B" }}>Você não possui reservas futuras.</p>
          )}
        </div>

        {/* Horários mais utilizados */}
        <div className="lg:col-span-2 p-6 rounded-2xl" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
          <h3 className="text-sm font-bold mb-1" style={{ color: "#1E1B15" }}>Horários mais utilizados</h3>
          <p className="text-xs mb-5" style={{ color: "#776D5B" }}>
            Horário preferido: <strong style={{ color: "#8B0019" }}>{peakPeriodo?.label}</strong> — {Math.round(peakPeriodo?.reservas / totalChartReservas * 100)}% das suas reservas
          </p>
          <div className="space-y-4">
            {chartHours.map(h => {
              const pct = Math.round(h.reservas / totalChartReservas * 100);
              const color = h.periodo === "Manhã" ? "#1E5E60" : h.periodo === "Tarde" ? "#8B0019" : "#5B3A8B";
              return (
                <div key={h.periodo}>
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <span className="text-xs font-semibold" style={{ color: "#3D382E" }}>{h.periodo}</span>
                      <span className="text-xs ml-2" style={{ color: "#A8A09A" }}>{h.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold" style={{ color }}>{pct}%</span>
                      <span className="text-xs ml-1" style={{ color: "#A8A09A" }}>({h.reservas} reservas)</span>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full" style={{ backgroundColor: "#F3EFEA" }}>
                    <div className="h-2.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Charts: ambientes + média por sala */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Ambientes mais utilizados */}
        <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
          <h3 className="text-sm font-bold mb-1" style={{ color: "#1E1B15" }}>Ambientes mais utilizados</h3>
          <p className="text-xs mb-4" style={{ color: "#776D5B" }}>Suas reservas por ambiente</p>
          <ResponsiveContainer width="100%" height={chartRooms.length * 48 + 20}>
            <BarChart data={chartRooms} layout="vertical" margin={{ left: 0, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3EFEA" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#776D5B", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="sala" width={130} tick={{ fontSize: 10, fill: "#3D382E", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
              <Tooltip content={<HBarTooltip />} cursor={{ fill: "rgba(139,0,25,0.04)" }} />
              <Bar dataKey="reservas" name="reservas" radius={[0, 6, 6, 0]} barSize={22}>
                {chartRooms.map((_, idx) => (
                  <Cell key={idx} fill={idx === 0 ? "#8B0019" : idx === 1 ? "#B82E3E" : "#D47080"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Média de alunos × capacidade */}
        <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
          <h3 className="text-sm font-bold mb-1" style={{ color: "#1E1B15" }}>Média de participantes por sala</h3>
          <p className="text-xs mb-5" style={{ color: "#776D5B" }}>Ocupação média × Capacidade total</p>
          <div className="space-y-5">
            {chartRooms.map(r => {
              const media = Math.round(r.pessoas / r.reservas);
              const taxa  = Math.round(media / r.capacidade * 100);
              return (
                <div key={r.sala}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold" style={{ color: "#1E1B15" }}>{r.sala}</span>
                    <span className="text-xs font-bold" style={{ color: taxa >= 70 ? "#8B0019" : "#1E5E60" }}>{taxa}%</span>
                  </div>
                  <div className="h-2 rounded-full mb-1" style={{ backgroundColor: "#F3EFEA" }}>
                    <div className="h-2 rounded-full" style={{ width: `${Math.min(taxa, 100)}%`, backgroundColor: taxa >= 70 ? "#8B0019" : "#1E5E60" }} />
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: "#A8A09A" }}>
                    <span>Média: {media} alunos</span>
                    <span>Cap.: {r.capacidade}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="p-6 rounded-2xl mb-6" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
        <h3 className="text-sm font-bold mb-4" style={{ color: "#1E1B15" }}>Insights sobre suas reservas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: i % 2 === 0 ? "#FFF0F2" : "#E3ECEE" }}>
              <div className="mt-0.5 flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={i % 2 === 0 ? "#8B0019" : "#1E5E60"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <p className="text-xs" style={{ color: i % 2 === 0 ? "#8B0019" : "#1E5E60" }}>{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reservas recentes */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid #F3EFEA" }}>
          <div>
            <h3 className="text-sm font-bold" style={{ color: "#1E1B15" }}>Minhas Reservas Recentes</h3>
            <p className="text-xs mt-0.5" style={{ color: "#776D5B" }}>Últimas atividades registradas</p>
          </div>
          <button
            onClick={() => navigate("/reservas")}
            className="text-xs font-semibold transition-colors hover:underline"
            style={{ color: "#8B0019" }}
          >
            Ver todas as reservas →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#FAF9F6" }}>
                {["Ambiente", "Data", "Horário", "Participantes", "Status"].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold" style={{ color: "#776D5B", borderBottom: "1px solid #F3EFEA" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myReservas.slice(0, 5).map((r, i) => {
                const s = statusStyle[r.status] ?? statusStyle["Pendente"];
                return (
                  <tr key={r.id} style={{ borderBottom: i < Math.min(myReservas.length, 5) - 1 ? "1px solid #F3EFEA" : "none" }} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold" style={{ color: "#1E1B15" }}>{r.sala}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#776D5B" }}>{r.bloco}</div>
                    </td>
                    <td className="px-6 py-4 text-xs" style={{ color: "#3D382E" }}>{r.data}</td>
                    <td className="px-6 py-4 text-xs font-medium" style={{ color: "#3D382E" }}>{r.inicio}–{r.fim}</td>
                    <td className="px-6 py-4 text-xs" style={{ color: "#3D382E" }}>{r.pessoas} pessoas</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.text }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />{r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {myReservas.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-xs" style={{ color: "#776D5B" }}>Nenhuma reserva encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN / COORDENADOR DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
function AdminCoordenadorDashboard({ user, solicitacoes, pendingForMe, isAdmin }: {
  user: any; solicitacoes: Solicitacao[]; pendingForMe: Solicitacao[]; isAdmin: boolean;
}) {
  // ── Academic context for dynamic núcleo options ───────────────────────────
  const { nucleos: acadNucleos } = useAcademic();

  // ── View toggle ─────────────────────────────────────────────────────────────
  const [view, setView] = useState<"semanal" | "mensal">("semanal");
  const [calYear, setCalYear]   = useState(2026);
  const [calMonth, setCalMonth] = useState(8);

  const monthlyMap = useMemo(() => buildMonthlyMap(calYear, calMonth), [calYear, calMonth]);
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();

  // ── Shared map filters (used by both semanal and mensal views) ───────────
  const [mapFiltNucleo,  setMapFiltNucleo]  = useState("Todos");
  const [mapFiltSala,    setMapFiltSala]    = useState("Todas");
  const [mapFiltStatus,  setMapFiltStatus]  = useState("Todos");
  const [mapFiltHorario, setMapFiltHorario] = useState("Todos");

  // Dynamic nucleo options from AcademicContext (picks up newly-created núcleos)
  const mapNucleoOptions = useMemo(
    () => ["Todos", ...acadNucleos.filter(n => n.ativo).map(n => n.nome), "Global"],
    [acadNucleos]
  );
  const mapSalaOptions   = ["Todas", ...MONTHLY_ROOMS.map(r => r.sala)];
  const mapSlotRows = mapFiltHorario === "Todos" ? TIME_SLOTS : [mapFiltHorario];

  // ── Weekly map (current week, auto-calculated) ────────────────────────────
  const weekStart = useMemo(() => getMonday(new Date()), []);
  const weekEnd   = useMemo(() => { const d = new Date(weekStart); d.setDate(d.getDate() + 6); return d; }, [weekStart]);
  const rawWeeklyMap = useMemo(() => buildWeeklyMap(weekStart), [weekStart]);

  const filteredWeeklyMap = useMemo((): WeeklyMap => {
    const result: WeeklyMap = {};
    for (let wd = 0; wd < 7; wd++) {
      result[wd] = {};
      for (const slot of TIME_SLOTS) {
        const entries = rawWeeklyMap[wd]?.[slot] ?? [];
        result[wd][slot] = entries.filter(e => {
          if (mapFiltNucleo !== "Todos" && e.nucleo !== mapFiltNucleo && e.nucleo !== "Global") return false;
          if (mapFiltSala   !== "Todas" && e.sala   !== mapFiltSala)   return false;
          if (mapFiltStatus === "Reservada" && e.status !== "Aprovado")  return false;
          if (mapFiltStatus === "Pendente"  && e.status !== "Pendente" && e.status !== "Em análise") return false;
          if (mapFiltStatus === "Cancelada" && e.status !== "Cancelado") return false;
          return true;
        });
      }
    }
    return result;
  }, [rawWeeklyMap, mapFiltNucleo, mapFiltSala, mapFiltStatus]);

  const weeklyTotal = useMemo(() => {
    let n = 0;
    for (let wd = 0; wd < 7; wd++)
      for (const slot of TIME_SLOTS) n += (filteredWeeklyMap[wd]?.[slot] ?? []).length;
    return n;
  }, [filteredWeeklyMap]);

  const filteredMonthlyMap = useMemo((): MonthlyMap => {
    const result: MonthlyMap = {};
    for (let d = 1; d <= daysInMonth; d++) {
      result[d] = {};
      for (const slot of TIME_SLOTS) {
        const entries = monthlyMap[d]?.[slot] ?? [];
        result[d][slot] = entries.filter(e => {
          if (mapFiltNucleo !== "Todos" && e.nucleo !== mapFiltNucleo) return false;
          if (mapFiltSala   !== "Todas" && e.sala   !== mapFiltSala)   return false;
          if (mapFiltStatus === "Reservada" && e.status !== "Aprovado")  return false;
          if (mapFiltStatus === "Pendente"  && e.status !== "Pendente" && e.status !== "Em análise") return false;
          if (mapFiltStatus === "Cancelada" && e.status !== "Cancelado") return false;
          return true;
        });
      }
    }
    return result;
  }, [monthlyMap, daysInMonth, mapFiltNucleo, mapFiltSala, mapFiltStatus]);

  const reservasPerDay = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => {
    return Object.values(filteredMonthlyMap[i + 1] || {}).reduce((s, arr) => s + arr.length, 0);
  }), [filteredMonthlyMap, daysInMonth]);

  const hasMapFilters = mapFiltNucleo !== "Todos" || mapFiltSala !== "Todas" || mapFiltStatus !== "Todos" || mapFiltHorario !== "Todos";
  const clearMapFilters = () => { setMapFiltNucleo("Todos"); setMapFiltSala("Todas"); setMapFiltStatus("Todos"); setMapFiltHorario("Todos"); };

  const prevMonth = () => { if (calMonth === 1) { setCalYear(y => y - 1); setCalMonth(12); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 12) { setCalYear(y => y + 1); setCalMonth(1); } else setCalMonth(m => m + 1); };

  const [hoveredCell, setHoveredCell] = useState<{ entries: CellInfo[]; x: number; y: number } | null>(null);

  // ── Global filters ───────────────────────────────────────────────────────────
  const [periodo,  setPeriodo]  = useState<PeriodoFilter>("mes_atual");
  const [ambiente, setAmbiente] = useState<AmbienteFilter>("todos");
  const [bloco,    setBloco]    = useState<BlocoFilter>("todos");
  const [sortBy,   setSortBy]   = useState<SortBy>("reservas");

  const mult = periodMultiplier[periodo];

  const filteredRooms = useMemo(() => {
    return allRoomStats
      .filter(r => ambiente === "todos" || r.tipo === ambiente)
      .filter(r => bloco === "todos" || r.bloco === bloco)
      .map(r => ({
        ...r,
        reservas: Math.round(r.reservas * mult),
        horas:    Math.round(r.horas * mult * 10) / 10,
        pessoas:  Math.round(r.pessoas * mult),
      }))
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [ambiente, bloco, sortBy, mult]);

  const filteredPeak = useMemo(() => allPeakHours.map(h => ({ ...h, reservas: Math.round(h.reservas * mult) })), [mult]);

  const totalHoras    = filteredRooms.reduce((s, r) => s + r.horas, 0);
  const totalPessoas  = filteredRooms.reduce((s, r) => s + r.pessoas, 0);
  const totalReservas = filteredRooms.reduce((s, r) => s + r.reservas, 0);
  const taxaGeral     = filteredRooms.length ? Math.min(99, Math.round(filteredRooms.reduce((s, r) => s + (r.horas / (r.capacidade * mult * 40 || 1)) * 100, 0) / filteredRooms.length)) : 0;
  const salaTop       = filteredRooms[0];
  const peakHour      = filteredPeak.reduce((a, b) => b.reservas > a.reservas ? b : a, filteredPeak[0]);
  const mediaParticip = totalReservas ? Math.round(totalPessoas / totalReservas) : 0;

  const avgOccupancy  = filteredRooms.map(r => ({
    sala: r.sala,
    media: Math.round(r.pessoas / Math.max(r.reservas, 1)),
    capacidade: r.capacidade,
    taxa: Math.round((r.pessoas / Math.max(r.reservas, 1)) / r.capacidade * 100),
  }));

  const occupancyChartData = filteredRooms.map(r => {
    const hrsAvail = Math.max(1, mult * 20 * 2);
    const taxa = Math.min(99, Math.round(r.horas / hrsAvail * 100));
    return { sala: r.sala.replace("Auditório Central", "Auditório"), taxa };
  }).sort((a, b) => b.taxa - a.taxa);

  const LABEL_WIDTH = 140;

  const metrics = [
    { label: "Reservas hoje", value: "24", delta: "+12% em relação a ontem", positive: true, iconBg: "#FFF0F2", iconColor: "#8B0019", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { label: "Ambientes disponíveis", value: "18", delta: "Prontos para uso", positive: true, iconBg: "#EAF5EA", iconColor: "#2B5E2B", valueColor: "#2B5E2B", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { label: "Ambientes ocupados", value: "12", delta: "Em uso agora", positive: false, iconBg: "#FDF0F2", iconColor: "#991B1B", valueColor: "#8B0019", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> },
    { label: isAdmin ? "Total de membros" : "Pendentes de autorização", value: isAdmin ? "148" : String(pendingForMe.length), delta: isAdmin ? "+3 este mês" : "Aguardando sua análise", positive: isAdmin, iconBg: "#E3ECEE", iconColor: "#1E5E60", valueColor: "#1E5E60", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  ];

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold mb-1" style={{ color: "#8B0019", letterSpacing: "0.08em" }}>VISÃO GERAL</p>
        <h1 className="text-2xl font-bold" style={{ color: "#1E1B15" }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "#776D5B" }}>
          Visão geral das atividades e reservas do sistema — 26 de agosto de 2026
        </p>
      </div>

      {/* Pending alert */}
      {pendingForMe.length > 0 && (
        <div className="mb-6 px-4 py-3 rounded-xl flex items-center gap-3 text-sm" style={{ backgroundColor: "#FFF8E6", border: "1px solid #FFE19A", color: "#805B00" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>Você tem <strong>{pendingForMe.length}</strong> autorização{pendingForMe.length > 1 ? "ões" : ""} aguardando sua resposta.</span>
        </div>
      )}

      {/* Main metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m: any) => (
          <div key={m.label} className="p-5 rounded-2xl" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: m.iconBg, color: m.iconColor }}>{m.icon}</div>
            <div className="text-3xl font-extrabold mb-1" style={{ color: m.valueColor || "#1E1B15" }}>{m.value}</div>
            <div className="text-xs font-medium mb-2" style={{ color: "#3D382E" }}>{m.label}</div>
            <div className="text-xs flex items-center gap-1" style={{ color: m.positive ? "#2B5E2B" : "#805B00" }}>
              {m.positive
                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
              {m.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Reservas toggle */}
      <div className="p-6 rounded-2xl mb-6" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="text-sm font-bold" style={{ color: "#1E1B15" }}>Reservas</h2>
            <p className="text-xs mt-0.5" style={{ color: "#776D5B" }}>
              {view === "semanal" ? `${fmtShortDate(weekStart)} — ${fmtShortDate(weekEnd)}` : `${MONTH_NAMES[calMonth - 1]} ${calYear}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid #E7E0D5" }}>
              {(["semanal", "mensal"] as const).map(v => (
                <button key={v} onClick={() => setView(v)} className="px-4 py-1.5 text-xs font-semibold transition-colors"
                  style={{ backgroundColor: view === v ? "#8B0019" : "#FAF9F6", color: view === v ? "#FFF" : "#776D5B" }}>
                  {v === "semanal" ? "Semanal" : "Mensal"}
                </button>
              ))}
            </div>
            {view === "semanal" && (
              <div className="text-xs font-medium px-2.5 py-1 rounded-lg" style={{ backgroundColor: "#FFF0F2", color: "#8B0019" }}>{weeklyTotal} total</div>
            )}
          </div>
        </div>

        {view === "semanal" ? (
          <div>
            {/* Filters — identical to monthly */}
            <div className="flex flex-wrap gap-2 mb-3 items-center">
              {([
                { label: "Núcleo",  value: mapFiltNucleo,  set: setMapFiltNucleo,  opts: mapNucleoOptions },
                { label: "Sala",    value: mapFiltSala,    set: setMapFiltSala,    opts: mapSalaOptions },
                { label: "Status",  value: mapFiltStatus,  set: setMapFiltStatus,  opts: ["Todos", "Disponível", "Reservada", "Pendente", "Cancelada"] },
                { label: "Horário", value: mapFiltHorario, set: setMapFiltHorario, opts: ["Todos", ...TIME_SLOTS] },
              ] as const).map((f: any) => (
                <div key={f.label} className="flex items-center gap-1">
                  <span className="text-xs" style={{ color: "#776D5B" }}>{f.label}:</span>
                  <select value={f.value} onChange={e => f.set(e.target.value)}
                    className="text-xs rounded-lg px-2 py-1 appearance-none"
                    style={{ backgroundColor: f.value !== "Todos" && f.value !== "Todas" ? "#FFF0F2" : "#FAF9F6", border: "1px solid #E7E0D5", color: f.value !== "Todos" && f.value !== "Todas" ? "#8B0019" : "#776D5B" }}>
                    {f.opts.map((o: string) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              {hasMapFilters && (
                <button onClick={clearMapFilters} className="text-xs px-2.5 py-1 rounded-lg font-medium"
                  style={{ backgroundColor: "#FDF0F2", color: "#8B0019", border: "1px solid #FFD6D9" }}>
                  Limpar filtros
                </button>
              )}
            </div>

            {/* Legend — identical to monthly */}
            <div className="flex items-center gap-4 mb-3 text-xs flex-wrap" style={{ color: "#776D5B" }}>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: "#FFF0F2", border: "1px solid #E7C0C8" }}/><span>Reservada</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: "#FFF8E6", border: "1px solid #FFE19A" }}/><span>Pendente</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: "#F3EFEA", border: "1px solid #E7E0D5" }}/><span>Livre</span></div>
              <div className="flex items-center gap-1.5"><div className="text-xs font-bold rounded px-1" style={{ backgroundColor: "#E3ECEE", color: "#1E5E60" }}>3</div><span>= múltiplas salas</span></div>
            </div>

            {/* Grid: Horário × Dia da semana */}
            <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid #F3EFEA" }}
              onMouseLeave={() => setHoveredCell(null)}>
              <table className="text-xs border-collapse" style={{ minWidth: 7 * 90 + 72 }}>
                <thead>
                  <tr style={{ backgroundColor: "#FAF9F6" }}>
                    <th className="sticky left-0 px-3 py-2 text-left font-semibold"
                      style={{ color: "#776D5B", backgroundColor: "#FAF9F6", minWidth: 72, borderRight: "1px solid #F3EFEA", zIndex: 2 }}>
                      Horário
                    </th>
                    {[0,1,2,3,4,5,6].map(wd => {
                      const d = new Date(weekStart);
                      d.setDate(d.getDate() + wd);
                      const dayCount = Object.values(filteredWeeklyMap[wd] ?? {}).reduce((s, a) => s + a.length, 0);
                      return (
                        <th key={wd} className="px-1 py-2 text-center font-semibold" style={{ color: "#776D5B", minWidth: 90 }}>
                          <div>{DAY_NAMES_SHORT[wd]}</div>
                          <div className="font-normal mt-0.5" style={{ color: "#A8A09A", fontSize: 10 }}>{fmtShortDate(d)}</div>
                          <div className="font-normal mt-0.5" style={{ color: dayCount > 3 ? "#8B0019" : "#B0A898", fontSize: 10 }}>
                            {dayCount > 0 ? `${dayCount}×` : "—"}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {mapSlotRows.map(slot => (
                    <tr key={slot} style={{ borderTop: "1px solid #F3EFEA" }}>
                      <td className="sticky left-0 px-3 py-2 font-semibold"
                        style={{ color: "#776D5B", backgroundColor: "#FAF9F6", borderRight: "1px solid #F3EFEA", zIndex: 1 }}>
                        {slot}
                      </td>
                      {[0,1,2,3,4,5,6].map(wd => {
                        const entries = filteredWeeklyMap[wd]?.[slot] ?? [];
                        const isEmpty = entries.length === 0;
                        const cellBg     = isEmpty ? (mapFiltStatus === "Disponível" ? "#EAF5EA" : "#F3EFEA") : entries[0]?.status === "Pendente" || entries[0]?.status === "Em análise" ? "#FFF8E6" : "#FFF0F2";
                        const cellBorder = isEmpty ? (mapFiltStatus === "Disponível" ? "#C2E2C2" : "#E7E0D5") : entries[0]?.status === "Pendente" || entries[0]?.status === "Em análise" ? "#FFE19A" : "#E7C0C8";
                        const cellColor  = isEmpty ? (mapFiltStatus === "Disponível" ? "#2B5E2B" : "#C8BDB5") : entries[0]?.status === "Pendente" || entries[0]?.status === "Em análise" ? "#805B00" : "#8B0019";
                        return (
                          <td key={wd} className="px-1 py-1 text-center" style={{ minWidth: 90 }}>
                            <div
                              className="rounded cursor-default"
                              style={{ backgroundColor: cellBg, color: cellColor, border: `1px solid ${cellBorder}`, fontSize: 10, minHeight: 20, display: "flex", alignItems: "center", justifyContent: "center", padding: "1px 3px" }}
                              onMouseEnter={e => {
                                if (entries.length > 0) {
                                  const r2 = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                  setHoveredCell({ entries, x: r2.left, y: r2.bottom + window.scrollY + 6 });
                                }
                              }}
                            >
                              {isEmpty
                                ? (mapFiltStatus === "Disponível" ? "✓" : "·")
                                : entries.length === 1
                                  ? <span className="truncate" style={{ maxWidth: 72, display: "block", overflow: "hidden", whiteSpace: "nowrap" }}>{entries[0].sala.split(" ")[0]}</span>
                                  : <span className="font-bold rounded px-1" style={{ backgroundColor: "#E3ECEE", color: "#1E5E60", fontSize: 9 }}>{entries.length}</span>
                              }
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Floating tooltip — same as monthly */}
            {hoveredCell && hoveredCell.entries.length > 0 && (
              <div className="fixed z-50 rounded-xl text-xs shadow-xl" style={{ backgroundColor: "#1E1B15", color: "#FAF9F6", padding: "12px 16px", left: Math.min(hoveredCell.x, window.innerWidth - 260), top: hoveredCell.y, minWidth: 240, pointerEvents: "none" }}>
                <div className="font-bold mb-2" style={{ color: "#FFA8B0" }}>
                  {hoveredCell.entries[0].inicio}–{hoveredCell.entries[0].fim} · {hoveredCell.entries.length} sala{hoveredCell.entries.length > 1 ? "s" : ""}
                </div>
                {hoveredCell.entries.map((e, i) => (
                  <div key={i} className="mb-2 pb-2" style={{ borderBottom: i < hoveredCell.entries.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                    <div className="font-semibold" style={{ color: "#FAF9F6" }}>{e.sala}</div>
                    <div style={{ color: "#B0A898" }}>{e.bloco} · {e.nucleo}</div>
                    <div className="mt-0.5 flex gap-3">
                      <span><span style={{ color: "#776D5B" }}>Pessoas: </span>{e.pessoas}</span>
                      <span><span style={{ color: "#776D5B" }}>Status: </span><span style={{ color: e.status === "Aprovado" ? "#4A9A4A" : e.status === "Pendente" ? "#B08A00" : "#A8A09A" }}>{e.status}</span></span>
                    </div>
                    <div style={{ color: "#B0A898" }}>Por: {e.solicitante}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100" style={{ border: "1px solid #E7E0D5", color: "#776D5B" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <span className="text-sm font-bold" style={{ color: "#1E1B15" }}>{MONTH_NAMES[calMonth - 1]} {calYear}</span>
              <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100" style={{ border: "1px solid #E7E0D5", color: "#776D5B" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            {/* Map filters */}
            <div className="flex flex-wrap gap-2 mb-3 items-center">
              {([
                { label: "Núcleo",  value: mapFiltNucleo,  set: setMapFiltNucleo,  opts: mapNucleoOptions },
                { label: "Sala",    value: mapFiltSala,    set: setMapFiltSala,    opts: mapSalaOptions },
                { label: "Status",  value: mapFiltStatus,  set: setMapFiltStatus,  opts: ["Todos", "Disponível", "Reservada", "Pendente", "Cancelada"] },
                { label: "Horário", value: mapFiltHorario, set: setMapFiltHorario, opts: ["Todos", ...TIME_SLOTS] },
              ] as const).map((f: any) => (
                <div key={f.label} className="flex items-center gap-1">
                  <span className="text-xs" style={{ color: "#776D5B" }}>{f.label}:</span>
                  <select value={f.value} onChange={e => f.set(e.target.value)}
                    className="text-xs rounded-lg px-2 py-1 appearance-none"
                    style={{ backgroundColor: f.value !== "Todos" && f.value !== "Todas" ? "#FFF0F2" : "#FAF9F6", border: "1px solid #E7E0D5", color: f.value !== "Todos" && f.value !== "Todas" ? "#8B0019" : "#776D5B" }}>
                    {f.opts.map((o: string) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              {hasMapFilters && (
                <button onClick={clearMapFilters} className="text-xs px-2.5 py-1 rounded-lg font-medium"
                  style={{ backgroundColor: "#FDF0F2", color: "#8B0019", border: "1px solid #FFD6D9" }}>
                  Limpar filtros
                </button>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-3 text-xs flex-wrap" style={{ color: "#776D5B" }}>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: "#FFF0F2", border: "1px solid #E7C0C8" }}/><span>Reservada</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: "#FFF8E6", border: "1px solid #FFE19A" }}/><span>Pendente</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: "#F3EFEA", border: "1px solid #E7E0D5" }}/><span>Livre</span></div>
              <div className="flex items-center gap-1.5"><div className="text-xs font-bold rounded px-1" style={{ backgroundColor: "#E3ECEE", color: "#1E5E60" }}>3</div><span>= múltiplas salas</span></div>
            </div>

            {/* Scrollable grid — Horário × Dia, each cell can have multiple rooms */}
            <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid #F3EFEA" }}
              onMouseLeave={() => setHoveredCell(null)}>
              <table className="text-xs border-collapse" style={{ minWidth: daysInMonth * 52 + 72 }}>
                <thead>
                  <tr style={{ backgroundColor: "#FAF9F6" }}>
                    <th className="sticky left-0 px-3 py-2 text-left font-semibold" style={{ color: "#776D5B", backgroundColor: "#FAF9F6", minWidth: 72, borderRight: "1px solid #F3EFEA", zIndex: 2 }}>Horário</th>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                      <th key={d} className="px-1 py-2 text-center font-semibold" style={{ color: "#776D5B", minWidth: 48 }}>
                        <div>{String(d).padStart(2, "0")}</div>
                        <div className="font-normal mt-0.5" style={{ color: reservasPerDay[d - 1] > 3 ? "#8B0019" : "#B0A898", fontSize: 10 }}>
                          {reservasPerDay[d - 1] > 0 ? `${reservasPerDay[d - 1]}×` : "—"}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mapSlotRows.map(slot => (
                    <tr key={slot} style={{ borderTop: "1px solid #F3EFEA" }}>
                      <td className="sticky left-0 px-3 py-2 font-semibold" style={{ color: "#776D5B", backgroundColor: "#FAF9F6", borderRight: "1px solid #F3EFEA", zIndex: 1 }}>{slot}</td>
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                        const entries = filteredMonthlyMap[d]?.[slot] ?? [];
                        const showFree = mapFiltStatus === "Disponível" || mapFiltStatus === "Todos";
                        const isEmpty = entries.length === 0;
                        // When filtering for "Disponível", highlight free cells; otherwise dim them
                        const cellBg   = isEmpty ? (mapFiltStatus === "Disponível" ? "#EAF5EA" : "#F3EFEA") : entries[0]?.status === "Pendente" || entries[0]?.status === "Em análise" ? "#FFF8E6" : "#FFF0F2";
                        const cellBorder = isEmpty ? (mapFiltStatus === "Disponível" ? "#C2E2C2" : "#E7E0D5") : entries[0]?.status === "Pendente" || entries[0]?.status === "Em análise" ? "#FFE19A" : "#E7C0C8";
                        const cellColor  = isEmpty ? (mapFiltStatus === "Disponível" ? "#2B5E2B" : "#C8BDB5") : entries[0]?.status === "Pendente" || entries[0]?.status === "Em análise" ? "#805B00" : "#8B0019";

                        return (
                          <td key={d} className="px-1 py-1 text-center" style={{ minWidth: 48 }}>
                            <div
                              className="rounded cursor-default"
                              style={{ backgroundColor: cellBg, color: cellColor, border: `1px solid ${cellBorder}`, fontSize: 10, minHeight: 20, display: "flex", alignItems: "center", justifyContent: "center", padding: "1px 3px" }}
                              onMouseEnter={e => {
                                if (entries.length > 0) {
                                  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                  setHoveredCell({ entries, x: r.left, y: r.bottom + window.scrollY + 6 });
                                }
                              }}
                            >
                              {isEmpty
                                ? (showFree ? "✓" : "·")
                                : entries.length === 1
                                  ? <span className="truncate" style={{ maxWidth: 40, display: "block", overflow: "hidden", whiteSpace: "nowrap" }}>{entries[0].sala.split(" ")[0]}</span>
                                  : <span className="font-bold rounded px-1" style={{ backgroundColor: "#E3ECEE", color: "#1E5E60", fontSize: 9 }}>{entries.length}</span>
                              }
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Floating tooltip — shows ALL rooms in that slot */}
            {hoveredCell && hoveredCell.entries.length > 0 && (
              <div className="fixed z-50 rounded-xl text-xs shadow-xl" style={{ backgroundColor: "#1E1B15", color: "#FAF9F6", padding: "12px 16px", left: Math.min(hoveredCell.x, window.innerWidth - 260), top: hoveredCell.y, minWidth: 240, pointerEvents: "none" }}>
                <div className="font-bold mb-2" style={{ color: "#FFA8B0" }}>
                  {hoveredCell.entries[0].inicio}–{hoveredCell.entries[0].fim} · {hoveredCell.entries.length} sala{hoveredCell.entries.length > 1 ? "s" : ""}
                </div>
                {hoveredCell.entries.map((e, i) => (
                  <div key={i} className="mb-2 pb-2" style={{ borderBottom: i < hoveredCell.entries.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                    <div className="font-semibold" style={{ color: "#FAF9F6" }}>{e.sala}</div>
                    <div style={{ color: "#B0A898" }}>{e.bloco} · {e.nucleo}</div>
                    <div className="mt-0.5 flex gap-3">
                      <span><span style={{ color: "#776D5B" }}>Pessoas: </span>{e.pessoas}</span>
                      <span><span style={{ color: "#776D5B" }}>Status: </span><span style={{ color: e.status === "Aprovado" ? "#4A9A4A" : e.status === "Pendente" ? "#B08A00" : "#A8A09A" }}>{e.status}</span></span>
                    </div>
                    <div style={{ color: "#B0A898" }}>Por: {e.solicitante}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ocupação por tipo */}
      <div className="p-6 rounded-2xl mb-8" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
        <h2 className="text-sm font-bold mb-5" style={{ color: "#1E1B15" }}>Ocupação por Tipo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Laboratórios", value: 75, color: "#8B0019" },
            { label: "Salas de Aula", value: 60, color: "#1E5E60" },
            { label: "Auditórios", value: 40, color: "#3C5E53" },
            { label: "Salas de Reunião", value: 85, color: "#B82E3E" },
          ].map(item => (
            <div key={item.label}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium" style={{ color: "#3D382E" }}>{item.label}</span>
                <span className="text-xs font-semibold" style={{ color: item.color }}>{item.value}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ backgroundColor: "#F3EFEA" }}>
                <div className="h-1.5 rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Análise de Utilização */}
      <div className="mb-2">
        <p className="text-xs font-semibold mb-1" style={{ color: "#8B0019", letterSpacing: "0.08em" }}>ANÁLISE</p>
        <h2 className="text-xl font-bold" style={{ color: "#1E1B15" }}>Análise de Utilização</h2>
        <p className="text-sm mt-1 mb-6" style={{ color: "#776D5B" }}>Indicadores de uso e desempenho de todos os ambientes</p>
      </div>

      {/* Global filters */}
      <div className="p-4 rounded-2xl mb-6 flex flex-wrap gap-4 items-end" style={{ backgroundColor: "#FAF9F6", border: "1px solid #E7E0D5" }}>
        {[
          { label: "Período", value: periodo, set: setPeriodo as any, options: [["semana_atual","Semana atual"],["mes_atual","Mês atual"],["ultimos_3_meses","Últimos 3 meses"],["personalizado","Personalizado"]] },
          { label: "Sala / Ambiente", value: ambiente, set: setAmbiente as any, options: [["todos","Todos"],["laboratorios","Laboratórios"],["salas_aula","Salas de aula"],["auditorios","Auditórios"],["salas_reuniao","Salas de reunião"]] },
          { label: "Bloco", value: bloco, set: setBloco as any, options: [["todos","Todos"],["bloco_a","Bloco A"],["bloco_b","Bloco B"],["bloco_c","Bloco C"],["bloco_d","Bloco D"]] },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#776D5B" }}>{f.label}</label>
            <select value={f.value} onChange={e => f.set(e.target.value)} className="text-xs rounded-lg px-3 py-2 appearance-none" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5", color: "#1E1B15", minWidth: 150 }}>
              {f.options.map(([v, l]: any) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        ))}
        <div className="ml-auto text-xs" style={{ color: "#776D5B" }}>{filteredRooms.length} ambiente{filteredRooms.length !== 1 ? "s" : ""} no filtro</div>
      </div>

      {/* Indicadores adicionais */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Taxa geral de ocupação", value: `${taxaGeral}%`, sub: "dos ambientes no período", color: "#8B0019", bg: "#FFF0F2", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
          { label: "Sala mais utilizada", value: salaTop ? salaTop.sala.split(" ").slice(0, 2).join(" ") : "—", sub: salaTop ? `${salaTop.reservas} reservas no período` : "", color: "#1E5E60", bg: "#E3ECEE", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
          { label: "Horário de pico", value: peakHour?.slot ?? "—", sub: "Maior concentração de reservas", color: "#805B00", bg: "#FFF8E6", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
          { label: "Média de participantes", value: `${mediaParticip}`, sub: "pessoas por reserva", color: "#3C5E53", bg: "#EAF5EA", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
          { label: "Total de horas reservadas", value: `${Math.round(totalHoras)}h`, sub: "no período selecionado", color: "#5B3A8B", bg: "#F0EAF5", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
        ].map(c => (
          <div key={c.label} className="p-4 rounded-2xl" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: c.bg, color: c.color }}>{c.icon}</div>
            <div className="text-xl font-extrabold mb-0.5" style={{ color: c.color }}>{c.value}</div>
            <div className="text-xs font-medium mb-1" style={{ color: "#3D382E" }}>{c.label}</div>
            <div className="text-xs" style={{ color: "#A8A09A" }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold" style={{ color: "#1E1B15" }}>Salas mais utilizadas</h3>
              <p className="text-xs mt-0.5" style={{ color: "#776D5B" }}>Ordenado por {sortBy === "reservas" ? "nº de reservas" : sortBy === "horas" ? "horas" : "pessoas"}</p>
            </div>
            <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid #E7E0D5" }}>
              {([["reservas","Reservas"],["horas","Horas"],["pessoas","Pessoas"]] as const).map(([key, label]) => (
                <button key={key} onClick={() => setSortBy(key)} className="px-2.5 py-1 text-xs font-medium transition-colors" style={{ backgroundColor: sortBy === key ? "#8B0019" : "#FAF9F6", color: sortBy === key ? "#FFF" : "#776D5B" }}>{label}</button>
              ))}
            </div>
          </div>
          {filteredRooms.length === 0
            ? <div className="flex items-center justify-center h-32 text-xs" style={{ color: "#776D5B" }}>Nenhum ambiente no filtro.</div>
            : <ResponsiveContainer width="100%" height={filteredRooms.length * 44 + 20}>
                <BarChart data={filteredRooms} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3EFEA" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#776D5B", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="sala" width={LABEL_WIDTH} tick={{ fontSize: 10, fill: "#3D382E", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<HBarTooltip />} cursor={{ fill: "rgba(139,0,25,0.04)" }} />
                  <Bar dataKey={sortBy} name={sortBy} radius={[0, 6, 6, 0]} barSize={20}>
                    {filteredRooms.map((_, idx) => <Cell key={idx} fill={idx === 0 ? "#8B0019" : idx === 1 ? "#B82E3E" : "#D47080"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          }
        </div>

        <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
          <h3 className="text-sm font-bold mb-1" style={{ color: "#1E1B15" }}>Média de participantes por sala</h3>
          <p className="text-xs mb-5" style={{ color: "#776D5B" }}>Ocupação média × Capacidade total</p>
          {avgOccupancy.length === 0
            ? <div className="flex items-center justify-center h-32 text-xs" style={{ color: "#776D5B" }}>Nenhum ambiente no filtro.</div>
            : <div className="space-y-4">
                {avgOccupancy.map(r => (
                  <div key={r.sala}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium" style={{ color: "#3D382E" }}>{r.sala}</span>
                      <span className="text-xs font-semibold" style={{ color: r.taxa >= 70 ? "#8B0019" : "#1E5E60" }}>{r.taxa}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: "#F3EFEA" }}>
                      <div className="h-2 rounded-full" style={{ width: `${Math.min(r.taxa, 100)}%`, backgroundColor: r.taxa >= 70 ? "#8B0019" : "#1E5E60" }} />
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-xs" style={{ color: "#A8A09A" }}>Média: {r.media} pess.</span>
                      <span className="text-xs" style={{ color: "#A8A09A" }}>Cap.: {r.capacidade}</span>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
          <h3 className="text-sm font-bold mb-1" style={{ color: "#1E1B15" }}>Horários de maior utilização</h3>
          <p className="text-xs mb-4" style={{ color: "#776D5B" }}>Concentração de reservas por faixa horária</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={filteredPeak} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3EFEA" vertical={false} />
              <XAxis dataKey="slot" tick={{ fontSize: 10, fill: "#776D5B", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#776D5B", fontFamily: "Inter" }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(139,0,25,0.04)" }} />
              <Bar dataKey="reservas" radius={[6, 6, 0, 0]}>
                {filteredPeak.map((e, idx) => {
                  const isPeak = e.reservas === Math.max(...filteredPeak.map(h => h.reservas));
                  return <Cell key={idx} fill={isPeak ? "#8B0019" : "#D47080"} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold" style={{ color: "#1E1B15" }}>Taxa de ocupação dos ambientes</h3>
              <p className="text-xs mt-0.5" style={{ color: "#776D5B" }}>Horas reservadas ÷ Horas disponíveis</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#8B0019" }}/> Alto</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#1E5E60" }}/> Médio</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#A8A09A" }}/> Baixo</span>
            </div>
          </div>
          {occupancyChartData.length === 0
            ? <div className="flex items-center justify-center h-32 text-xs" style={{ color: "#776D5B" }}>Nenhum ambiente no filtro.</div>
            : <ResponsiveContainer width="100%" height={occupancyChartData.length * 44 + 20}>
                <BarChart data={occupancyChartData} layout="vertical" margin={{ left: 0, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3EFEA" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: "#776D5B", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="sala" width={LABEL_WIDTH} tick={{ fontSize: 10, fill: "#3D382E", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<OccTooltip />} cursor={{ fill: "rgba(139,0,25,0.04)" }} />
                  <Bar dataKey="taxa" name="%" radius={[0, 6, 6, 0]} barSize={20}>
                    {occupancyChartData.map((e, idx) => <Cell key={idx} fill={occColor(e.taxa)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          }
        </div>
      </div>

      {/* Recent reservas table */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5" }}>
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid #F3EFEA" }}>
          <div>
            <h2 className="text-sm font-bold" style={{ color: "#1E1B15" }}>Reservas Recentes</h2>
            <p className="text-xs mt-0.5" style={{ color: "#776D5B" }}>Últimas atividades do sistema</p>
          </div>
          <a href="/reservas" className="text-xs font-semibold" style={{ color: "#8B0019" }}>Ver todas →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#FAF9F6" }}>
                {["Ambiente", "Solicitante", "Data", "Horário", "Status"].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold" style={{ color: "#776D5B", borderBottom: "1px solid #F3EFEA" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {solicitacoes.slice(0, 5).map((r, i) => {
                const s = statusStyle[r.status] ?? statusStyle["Pendente"];
                return (
                  <tr key={r.id} style={{ borderBottom: i < 4 ? "1px solid #F3EFEA" : "none" }} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4"><div className="text-xs font-semibold" style={{ color: "#1E1B15" }}>{r.sala}</div><div className="text-xs mt-0.5" style={{ color: "#776D5B" }}>{r.bloco}</div></td>
                    <td className="px-6 py-4 text-xs" style={{ color: "#3D382E" }}>{r.solicitante}</td>
                    <td className="px-6 py-4 text-xs" style={{ color: "#3D382E" }}>{r.data}</td>
                    <td className="px-6 py-4 text-xs font-medium" style={{ color: "#3D382E" }}>{r.inicio}–{r.fim}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.text }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />{r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ROOT EXPORT
// ═════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const { user, permissions } = useAuth();
  const { solicitacoes } = useReservas();

  if (!permissions.canViewDashboard) return <Navigate to="/unauthorized" replace />;

  const isProfessor   = user.role === "Professor";
  const isCoordenador = user.role === "Coordenador";
  const isAdmin       = user.role === "Administrador";

  const myReservas   = solicitacoes.filter(s => s.solicitante === user.nome);
  const pendingForMe = isCoordenador
    ? solicitacoes.filter(s => s.tipo === "auth_required" && (s.status === "Pendente" || s.status === "Em análise"))
    : [];

  if (isProfessor) {
    return <ProfessorDashboard userName={user.nome} myReservas={myReservas} />;
  }

  return (
    <AdminCoordenadorDashboard
      user={user}
      solicitacoes={solicitacoes}
      pendingForMe={pendingForMe}
      isAdmin={isAdmin}
    />
  );
}
