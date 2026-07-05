import { Routes, Route } from "react-router";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Clienti from "./pages/Clienti";
import Pratiche from "./pages/Pratiche";
import Permessi from "./pages/Permessi";
import Protezione from "./pages/Protezione";
import Contenzioso from "./pages/Contenzioso";
import Scadenze from "./pages/Scadenze";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
      <Route path="/clienti" element={<AppLayout><Clienti /></AppLayout>} />
      <Route path="/pratiche" element={<AppLayout><Pratiche /></AppLayout>} />
      <Route path="/permessi" element={<AppLayout><Permessi /></AppLayout>} />
      <Route path="/protezione" element={<AppLayout><Protezione /></AppLayout>} />
      <Route path="/contenzioso" element={<AppLayout><Contenzioso /></AppLayout>} />
      <Route path="/scadenze" element={<AppLayout><Scadenze /></AppLayout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
