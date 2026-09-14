import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Dashboard from "./pages/Dashboard";
import Reservas from "./pages/Reservas";
import Membros from "./pages/Membros";
import Configuracoes from "./pages/Configuracoes";
import Unauthorized from "./pages/Unauthorized";
import Suporte from "./pages/Suporte";
import Academico from "./pages/Academico";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/suporte" element={<Suporte />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/menu" element={<Menu />} />
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute permission="canViewDashboard">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/reservas" element={<Reservas />} />
          <Route
            path="/membros"
            element={
              <ProtectedRoute permission="canViewMembros">
                <Membros />
              </ProtectedRoute>
            }
          />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route
            path="/academico"
            element={
              <ProtectedRoute permission="canManageAcademic">
                <Academico />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
