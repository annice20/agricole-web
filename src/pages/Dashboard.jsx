import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  Sprout,
  Package,
  DollarSign,
  FileText,
  Map,
  PieChart,
  Download,
} from "lucide-react";
import { toast } from "react-toastify";
import { getDashboard } from "../services/dashboardService";
import MyNavbar from "./MyNavbar";
import { telechargerRapportPdf } from "../services/rapportService";
import { ThemeProvider } from "../context/ThemeContext";
import { getSession } from "../utils/auth";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const session = getSession();
  const isAdmin = session?.role === "ADMIN_NATIONAL";
  const isResponsableRegional = session?.role === "RESPONSABLE_REGIONAL";

  const chargerDashboard = async () => {
    try {
      const response = await getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Impossible de charger les statistiques",
      );
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerDashboard();
  }, []);

  const handleExportPDF = async () => {
    try {
      toast.info("Génération du rapport PDF en cours...");
      const response = await telechargerRapportPdf();
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const lien = document.createElement("a");
      lien.href = url;
      lien.download = `rapport-agricole-national-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(lien);
      lien.click();
      document.body.removeChild(lien);
      window.URL.revokeObjectURL(url);
      toast.success("Rapport téléchargé avec succès.");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Impossible de générer le rapport PDF",
      );
    }
  };

  const handleExportPDFRegional = async () => {
    try {
      toast.info("Génération du rapport PDF en cours...");
      const response = await axios.get(
        "https://agricole-backend.onrender.com/api/rapports/regional/pdf",
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const lien = document.createElement("a");
      lien.href = url;
      lien.download = `rapport-agricole-regional-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(lien);
      lien.click();
      document.body.removeChild(lien);
      window.URL.revokeObjectURL(url);
      toast.success("Rapport téléchargé avec succès.");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Impossible de générer le rapport PDF",
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
        <div className="bg-white/40 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-10 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-700 mb-4"></div>
          <p className="text-lg font-semibold text-green-900 animate-pulse">
            Analyse des données...
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
        <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-3xl shadow-2xl p-8 text-center max-w-sm">
          <p className="text-red-800 font-bold text-lg mb-4">
            Échec de synchronisation
          </p>
          <p className="text-green-900 text-sm mb-6">
            Impossible de se connecter aux données de la base.
          </p>
          <button
            onClick={chargerDashboard}
            className="w-full bg-green-700 text-white py-2.5 rounded-xl font-medium hover:bg-green-800 transition shadow-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const totalEngagements = (stats.programmes || 0) + (stats.distributions || 0);
  const tauxProgrammes =
    totalEngagements > 0
      ? Math.round((stats.programmes / totalEngagements) * 100)
      : 0;
  const tauxDistributions =
    totalEngagements > 0
      ? Math.round((stats.distributions / totalEngagements) * 100)
      : 0;

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex flex-col font-sans antialiased text-green-950">
        {/* NAVBAR */}
        <div className="flex flex-1 pt-16">
          <MyNavbar />

          {/* CONTENU PRINCIPAL */}
          <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-8 lg:ml-64">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-green-900 tracking-tight">
                {isAdmin
                  ? "Analyse & Indicateurs Nationaux"
                  : "Analyse & Indicateurs Régionaux"}
              </h1>
              <p>
                {isAdmin
                  ? "Aperçu analytique national synchronisé avec PostgreSQL."
                  : "Aperçu analytique régional synchronisé avec PostgreSQL."}
              </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Producteurs actifs uniquement + sous-texte total brut */}
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-green-800 uppercase tracking-wider">
                    Producteurs actifs
                  </p>
                  <p className="text-4xl font-black text-green-950 mt-1 tracking-tight">
                    {stats.agriculteurs ?? 0}
                  </p>
                  <p className="text-xs text-green-700 font-semibold mt-1">
                    sur {stats.agriculteursTous ?? 0} inscrits
                  </p>
                </div>
                <div className="bg-green-700 text-white p-3.5 rounded-2xl shadow-md">
                  <Users size={22} />
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-green-800 uppercase tracking-wider">
                    Programmes d'aide
                  </p>
                  <p className="text-4xl font-black text-green-950 mt-1 tracking-tight">
                    {stats.programmes ?? 0}
                  </p>
                  <p className="text-xs text-green-700 font-semibold mt-1">
                    Subventions actives
                  </p>
                </div>
                <div className="bg-green-700 text-white p-3.5 rounded-2xl shadow-md">
                  <Sprout size={22} />
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-green-800 uppercase tracking-wider">
                    Distributions
                  </p>
                  <p className="text-4xl font-black text-green-950 mt-1 tracking-tight">
                    {stats.distributions ?? 0}
                  </p>
                  <p className="text-xs text-green-700 font-semibold mt-1">
                    Campagnes terminées
                  </p>
                </div>
                <div className="bg-green-700 text-white p-3.5 rounded-2xl shadow-md">
                  <Package size={22} />
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-green-800 uppercase tracking-wider">
                    Financements
                  </p>
                  <p className="text-2xl font-black text-green-950 mt-1 tracking-tight">
                    {Number(
                      stats.montantTotalFinancement || 0,
                    ).toLocaleString()}
                  </p>
                  <p className="text-xs text-amber-900 font-bold mt-1 bg-amber-400/30 px-2 py-0.5 rounded-md inline-block">
                    Ariary {isResponsableRegional && "(national)"}
                  </p>
                </div>
                <div className="bg-green-700 text-white p-3.5 rounded-2xl shadow-md">
                  <DollarSign size={22} />
                </div>
              </div>
            </div>

            {/* GRAPHIQUES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
                <h2 className="text-lg font-extrabold text-green-900 flex items-center gap-2 mb-6">
                  <PieChart size={20} />
                  Répartition des actions enregistrées
                </h2>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm mb-1 font-bold text-green-900">
                      <span>Part des Programmes d'Aides</span>
                      <span>{tauxProgrammes}%</span>
                    </div>
                    <div className="w-full bg-green-900/10 rounded-full h-3">
                      <div
                        className="bg-green-700 h-3 rounded-full shadow-sm transition-all duration-500"
                        style={{ width: `${tauxProgrammes}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1 font-bold text-green-900">
                      <span>Part des Distributions Concrètes</span>
                      <span>{tauxDistributions}%</span>
                    </div>
                    <div className="w-full bg-green-900/10 rounded-full h-3">
                      <div
                        className="bg-green-700 h-3 rounded-full shadow-sm transition-all duration-500"
                        style={{ width: `${tauxDistributions}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
                <h2 className="text-lg font-extrabold text-green-900 flex items-center gap-2 mb-6">
                  <Map size={20} />
                  Densité Régionale (Bénéficiaires Actifs)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stats.analyseRegionale &&
                  stats.analyseRegionale.length > 0 ? (
                    stats.analyseRegionale.map((regionData, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-white/40 border border-white/30 flex items-center justify-between hover:bg-white/60 transition shadow-sm"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-green-950 text-sm tracking-tight">
                            {regionData.nomRegion || "Région inconnue"}
                          </span>
                          <span className="text-xs text-green-800/70 font-medium">
                            Madagascar
                          </span>
                        </div>
                        <span className="px-2.5 py-1 bg-green-700 text-white rounded-lg text-xs font-bold shadow-md">
                          {regionData.totalActifs ?? 0} actifs
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm font-medium text-green-800/60 p-4 col-span-2 text-center bg-white/20 rounded-xl border border-dashed border-green-900/10">
                      Aucun bénéficiaire actif répertorié dans les régions.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* EXPORTATION */}
            {(isAdmin || isResponsableRegional) && (
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-green-900 flex items-center gap-2">
                      <FileText size={20} />
                      {isAdmin
                        ? "Génération de Rapports Agricoles Nationaux"
                        : "Génération de Rapport Régional"}
                    </h2>
                    <p className="text-sm font-medium text-green-800/80 mt-1">
                      {isAdmin
                        ? "Extraction automatisée des données pour archivage légal au format ministériel."
                        : "Extraction automatisée des indicateurs de votre région pour archivage."}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={
                        isAdmin ? handleExportPDF : handleExportPDFRegional
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-900 text-white rounded-xl text-sm font-bold hover:bg-green-950 transition shadow-md"
                    >
                      <Download size={16} />
                      {isAdmin
                        ? "Exporter Rapport National"
                        : "Exporter Rapport Régional"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
