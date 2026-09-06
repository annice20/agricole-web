import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  HandCoins,
  Sprout,
  Wrench,
  DollarSign,
  GraduationCap,
  Droplets,
  ListChecks,
  Package,
} from "lucide-react";
import { toast } from "react-toastify";
import { getRepartitionAides } from "../services/repartitionService";
import { getSession } from "../utils/auth";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

// Rôles autorisés à consulter cette page
const ROLES_AUTORISES = ["ADMIN_NATIONAL"];

const TYPE_AIDE_CONFIG = {
  SUBVENTION: { label: "Subvention", icon: HandCoins },
  SEMENCE: { label: "Semences", icon: Sprout },
  EQUIPEMENT: { label: "Équipement", icon: Wrench },
  FINANCEMENT: { label: "Financement direct", icon: DollarSign },
  FORMATION: { label: "Formation", icon: GraduationCap },
  IRRIGATION: { label: "Irrigation", icon: Droplets },
};

const STATUT_CONFIG = {
  EN_ATTENTE: { label: "En attente", color: "bg-amber-500" },
  VALIDEE: { label: "Validée", color: "bg-sky-600" },
  DISPONIBLE: { label: "Disponible", color: "bg-teal-600" },
  DISTRIBUEE: { label: "Distribuée", color: "bg-green-700" },
  REFUSEE: { label: "Refusée", color: "bg-red-600" },
};

export default function RepartitionAides() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Contrôle d'accès côté client (en plus du @PreAuthorize backend)
    const session = getSession();
    const role = session?.role; // adapte selon la structure réelle de getSession()

    if (!session || !ROLES_AUTORISES.includes(role)) {
      toast.error("Accès réservé aux administrateurs nationaux.");
      navigate("/dashboard");
      return;
    }

    chargerRepartition();
  }, []);

  const chargerRepartition = async () => {
    try {
      const response = await getRepartitionAides();
      setData(response.data);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Impossible de charger la répartition des aides",
      );
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
        <div className="bg-white/40 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-10 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-700 mb-4"></div>
          <p className="text-lg font-semibold text-green-900 animate-pulse">
            Analyse des aides...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
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
            onClick={chargerRepartition}
            className="w-full bg-green-700 text-white py-2.5 rounded-xl font-medium hover:bg-green-800 transition shadow-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const maxNombreType = Math.max(...data.parType.map((t) => t.nombre), 1);
  const totalStatut = data.parStatut.reduce((acc, s) => acc + s.nombre, 0) || 1;

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex flex-col font-sans antialiased text-green-950">
        <div className="flex flex-1 pt-16">
          <MyNavbar />

          <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-8 lg:ml-64">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-green-900 tracking-tight">
                Répartition des Aides
              </h1>
              <p className="text-green-800/80 text-sm font-medium mt-1">
                Analyse des aides distribuées par type et par statut de demande.
              </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-green-800 uppercase tracking-wider">
                    Distributions effectuées
                  </p>
                  <p className="text-4xl font-black text-green-950 mt-1 tracking-tight">
                    {data.totalDistributions}
                  </p>
                </div>
                <div className="bg-green-700 text-white p-3.5 rounded-2xl shadow-md">
                  <Package size={22} />
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-green-800 uppercase tracking-wider">
                    Montant total distribué
                  </p>
                  <p className="text-2xl font-black text-green-950 mt-1 tracking-tight">
                    {Number(data.montantTotalDistribue || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-amber-900 font-bold mt-1 bg-amber-400/30 px-2 py-0.5 rounded-md inline-block">
                    Ariary
                  </p>
                </div>
                <div className="bg-green-700 text-white p-3.5 rounded-2xl shadow-md">
                  <DollarSign size={22} />
                </div>
              </div>
            </div>

            {/* GRAPHIQUES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Par type d'aide */}
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
                <h2 className="text-lg font-extrabold text-green-900 flex items-center gap-2 mb-6">
                  <PieChart size={20} />
                  Répartition par type d'aide
                </h2>
                <div className="space-y-5">
                  {data.parType.length > 0 ? (
                    data.parType.map((item, index) => {
                      const config = TYPE_AIDE_CONFIG[item.typeAide] || {
                        label: item.typeAide,
                        icon: Package,
                      };
                      const Icon = config.icon;
                      const largeur = Math.round(
                        (item.nombre / maxNombreType) * 100,
                      );
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1 font-bold text-green-900">
                            <span className="flex items-center gap-1.5">
                              <Icon size={14} />
                              {config.label}
                            </span>
                            <span>{item.nombre}</span>
                          </div>
                          <div className="w-full bg-green-900/10 rounded-full h-3">
                            <div
                              className="bg-green-700 h-3 rounded-full shadow-sm transition-all duration-500"
                              style={{ width: `${largeur}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-green-700/70 font-medium mt-1">
                            {Number(item.montantTotal || 0).toLocaleString()}{" "}
                            Ariary
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm font-medium text-green-800/60 p-4 text-center bg-white/20 rounded-xl border border-dashed border-green-900/10">
                      Aucune distribution enregistrée.
                    </p>
                  )}
                </div>
              </div>

              {/* Par statut de demande */}
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
                <h2 className="text-lg font-extrabold text-green-900 flex items-center gap-2 mb-6">
                  <ListChecks size={20} />
                  Répartition par statut de demande
                </h2>
                <div className="space-y-5">
                  {data.parStatut.length > 0 ? (
                    data.parStatut.map((item, index) => {
                      const config = STATUT_CONFIG[item.statut] || {
                        label: item.statut,
                        color: "bg-green-700",
                      };
                      const pourcentage = Math.round(
                        (item.nombre / totalStatut) * 100,
                      );
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1 font-bold text-green-900">
                            <span>{config.label}</span>
                            <span>
                              {item.nombre} ({pourcentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-green-900/10 rounded-full h-3">
                            <div
                              className={`${config.color} h-3 rounded-full shadow-sm transition-all duration-500`}
                              style={{ width: `${pourcentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm font-medium text-green-800/60 p-4 text-center bg-white/20 rounded-xl border border-dashed border-green-900/10">
                      Aucune demande enregistrée.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
