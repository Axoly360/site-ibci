import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Painel from "./pages/Painel";
import SabatinaOral from "./pages/SabatinaOral";
import Decorar from "./pages/Decorar";
import Quiz from "./pages/Quiz";
import Simulado from "./pages/Simulado";
import MinhaApresentacao from "./pages/MinhaApresentacao";
import ComoEOConcilio from "./pages/ComoEOConcilio";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Painel />} />
        <Route path="sabatina" element={<SabatinaOral />} />
        <Route path="decorar" element={<Decorar />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="simulado" element={<Simulado />} />
        <Route path="apresentacao" element={<MinhaApresentacao />} />
        <Route path="concilio" element={<ComoEOConcilio />} />
      </Route>
    </Routes>
  );
}
