import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  DollarSign,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "react-toastify";
import { getSuiviFinancements } from "../services/financementSuiviService";
import { getSession } from "../utils/auth";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

const ROLES_AUTORISES = ["ADMIN_NATIONAL"];

const MOIS_FR = [
  "Janv.",
  "Févr.",
  "Mars",
  "Avr.",
  "Mai",
  "Juin",
  "Juil.",
  "Août",
  "Sept.",
  "Oct.",
  "Nov.",
  "Déc.",
];

const formatPeriode = (periode) => {
  const [annee, mois] = periode.split("-");
  return `${MOIS_FR[parseInt(mois, 10) - 1]} ${annee}`;
};

const getCouleurTaux = (taux) => {
  if (taux >= 100) return "bg-green-700";
  if (taux >= 50) return "bg-amber-500";
  return "bg-red-600";
};

export default function SuiviFinancements() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    const role = session?.role;

    if (!session || !ROLES_AUTORISES.includes(role)) {
      toast.error("Accès réservé aux administrateurs nationaux.");
      navigate("/dashboard");
      return;
    }

    chargerSuivi();
  }, []);

  const chargerSuivi = async () => {
    try {
      const response = await getSuiviFinancements();
      setData(response.data);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Impossible de charger le suivi des financements",
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
            Analyse des financements...
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
            onClick={chargerSuivi}
            className="w-full bg-green-700 text-white py-2.5 rounded-xl font-medium hover:bg-green-800 transition shadow-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const maxOrganisme = Math.max(
    ...data.parOrganisme.map((o) => Number(o.montantTotal || 0)),
    1,
  );
  const maxMois = Math.max(
    ...data.evolutionMensuelle.map((m) => Number(m.montantTotal || 0)),
    1,
  );

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex flex-col font-sans antialiased text-green-950">
        <div className="flex flex-1 pt-16">
          <MyNavbar />

          <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-8 lg:ml-64">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-green-900 tracking-tight">
                Suivi des Financements
              </h1>
              <p className="text-green-800/80 text-sm font-medium mt-1">
                Origine des fonds, couverture budgétaire et évolution dans le
                temps.
              </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-green-800 uppercase tracking-wider">
                    Montant total financé
                  </p>
                  <p className="text-2xl font-black text-green-950 mt-1 tracking-tight">
                    {Number(data.montantTotalGlobal || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-amber-900 font-bold mt-1 bg-amber-400/30 px-2 py-0.5 rounded-md inline-block">
                    Ariary
                  </p>
                </div>
                <div className="bg-green-700 text-white p-3.5 rounded-2xl shadow-md">
                  <DollarSign size={22} />
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-green-800 uppercase tracking-wider">
                    Organismes financeurs
                  </p>
                  <p className="text-4xl font-black text-green-950 mt-1 tracking-tight">
                    {data.nombreOrganismes}
                  </p>
                </div>
                <div className="bg-green-700 text-white p-3.5 rounded-2xl shadow-md">
                  <Building2 size={22} />
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-green-800 uppercase tracking-wider">
                    Programmes suivis
                  </p>
                  <p className="text-4xl font-black text-green-950 mt-1 tracking-tight">
                    {data.parProgramme.length}
                  </p>
                </div>
                <div className="bg-green-700 text-white p-3.5 rounded-2xl shadow-md">
                  <Wallet size={22} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Par organisme */}
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
                <h2 className="text-lg font-extrabold text-green-900 flex items-center gap-2 mb-6">
                  <Building2 size={20} />
                  Répartition par organisme
                </h2>
                <div className="space-y-5">
                  {data.parOrganisme.length > 0 ? (
                    data.parOrganisme.map((item, index) => {
                      const largeur = Math.round(
                        (Number(item.montantTotal || 0) / maxOrganisme) * 100,
                      );
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1 font-bold text-green-900">
                            <span>
                              {item.organisme || "Organisme non précisé"}
                            </span>
                            <span>{item.nombre} financement(s)</span>
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
                      Aucun financement enregistré.
                    </p>
                  )}
                </div>
              </div>

              {/* Évolution mensuelle */}
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
                <h2 className="text-lg font-extrabold text-green-900 flex items-center gap-2 mb-6">
                  <TrendingUp size={20} />
                  Évolution mensuelle
                </h2>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {data.evolutionMensuelle.length > 0 ? (
                    data.evolutionMensuelle.map((item, index) => {
                      const largeur = Math.round(
                        (Number(item.montantTotal || 0) / maxMois) * 100,
                      );
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1 font-bold text-green-900">
                            <span>{formatPeriode(item.periode)}</span>
                            <span>
                              {Number(item.montantTotal || 0).toLocaleString()}{" "}
                              Ar
                            </span>
                          </div>
                          <div className="w-full bg-green-900/10 rounded-full h-3">
                            <div
                              className="bg-green-700 h-3 rounded-full shadow-sm transition-all duration-500"
                              style={{ width: `${largeur}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm font-medium text-green-800/60 p-4 text-center bg-white/20 rounded-xl border border-dashed border-green-900/10">
                      Aucune donnée temporelle disponible.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Budget vs financement par programme */}
            <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
              <h2 className="text-lg font-extrabold text-green-900 flex items-center gap-2 mb-6">
                <Target size={20} />
                Couverture budgétaire par programme
              </h2>
              <div className="space-y-5">
                {data.parProgramme.length > 0 ? (
                  data.parProgramme.map((item) => {
                    const taux = item.tauxCouverture ?? 0;
                    const largeur = Math.min(Math.round(taux), 100);
                    return (
                      <div key={item.programmeId}>
                        <div className="flex justify-between text-sm mb-1 font-bold text-green-900">
                          <span>{item.titreProgramme}</span>
                          <span>{taux.toFixed(1)}% couvert</span>
                        </div>
                        <div className="w-full bg-green-900/10 rounded-full h-3">
                          <div
                            className={`${getCouleurTaux(taux)} h-3 rounded-full shadow-sm transition-all duration-500`}
                            style={{ width: `${largeur}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-green-700/70 font-medium mt-1">
                          {Number(item.montantFinance || 0).toLocaleString()} /{" "}
                          {Number(item.budget || 0).toLocaleString()} Ariary
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm font-medium text-green-800/60 p-4 text-center bg-white/20 rounded-xl border border-dashed border-green-900/10">
                    Aucun programme enregistré.
                  </p>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
