import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Trophy, Package, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "react-toastify";
import { getAnalyseRegionale } from "../services/analyseRegionaleService";
import { getSession } from "../utils/auth";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

const ROLES_AUTORISES = ["ADMIN_NATIONAL"];

export default function AnalyseRegionale() {
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

    chargerAnalyse();
  }, []);

  const chargerAnalyse = async () => {
    try {
      const response = await getAnalyseRegionale();
      setData(response.data);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Impossible de charger l'analyse régionale",
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
            Analyse des régions...
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
            onClick={chargerAnalyse}
            className="w-full bg-green-700 text-white py-2.5 rounded-xl font-medium hover:bg-green-800 transition shadow-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const maxMontant = Math.max(
    ...data.regions.map((r) => r.montantDistribue),
    1,
  );
  const maxActifs = Math.max(
    ...data.regions.map((r) => r.totalAgriculteursActifs),
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
                Analyse Régionale
              </h1>
              <p className="text-green-800/80 text-sm font-medium mt-1">
                Comparaison des 26 régions sur les bénéficiaires et les aides
                distribuées.
              </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
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

              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-green-800 uppercase tracking-wider">
                    Région la plus active
                  </p>
                  <p className="text-lg font-black text-green-950 mt-1 tracking-tight truncate">
                    {data.regionPlusActifs || "—"}
                  </p>
                  <p className="text-xs text-green-700 font-semibold mt-1">
                    Par bénéficiaires actifs
                  </p>
                </div>
                <div className="bg-green-700 text-white p-3.5 rounded-2xl shadow-md">
                  <Trophy size={22} />
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-green-800 uppercase tracking-wider">
                    Région la plus distribuée
                  </p>
                  <p className="text-lg font-black text-green-950 mt-1 tracking-tight truncate">
                    {data.regionPlusDistributions || "—"}
                  </p>
                  <p className="text-xs text-green-700 font-semibold mt-1">
                    Par nombre de distributions
                  </p>
                </div>
                <div className="bg-green-700 text-white p-3.5 rounded-2xl shadow-md">
                  <Package size={22} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Montant distribué par région */}
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
                <h2 className="text-lg font-extrabold text-green-900 flex items-center gap-2 mb-6">
                  <DollarSign size={20} />
                  Montant distribué par région
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {data.regions.length > 0 ? (
                    data.regions.map((region, index) => {
                      const largeur = Math.round(
                        (region.montantDistribue / maxMontant) * 100,
                      );
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1 font-bold text-green-900">
                            <span className="flex items-center gap-1.5 truncate">
                              <MapPin size={14} className="flex-shrink-0" />
                              {region.nomRegion}
                            </span>
                            <span className="flex-shrink-0">
                              {Number(
                                region.montantDistribue || 0,
                              ).toLocaleString()}{" "}
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
                      Aucune donnée régionale disponible.
                    </p>
                  )}
                </div>
              </div>

              {/* Bénéficiaires actifs par région */}
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
                <h2 className="text-lg font-extrabold text-green-900 flex items-center gap-2 mb-6">
                  <TrendingUp size={20} />
                  Bénéficiaires actifs par région
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {data.regions.length > 0 ? (
                    [...data.regions]
                      .sort(
                        (a, b) =>
                          b.totalAgriculteursActifs - a.totalAgriculteursActifs,
                      )
                      .map((region, index) => {
                        const largeur = Math.round(
                          (region.totalAgriculteursActifs / maxActifs) * 100,
                        );
                        return (
                          <div key={index}>
                            <div className="flex justify-between text-sm mb-1 font-bold text-green-900">
                              <span className="truncate">
                                {region.nomRegion}
                              </span>
                              <span className="flex-shrink-0">
                                {region.totalAgriculteursActifs} /{" "}
                                {region.totalAgriculteurs}
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
                      Aucune donnée régionale disponible.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tableau détaillé */}
            <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl overflow-x-auto">
              <h2 className="text-lg font-extrabold text-green-900 flex items-center gap-2 mb-6">
                <Package size={20} />
                Détail par région
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-green-800/70 uppercase text-xs font-bold border-b border-green-900/10">
                    <th className="pb-3 pr-4">Région</th>
                    <th className="pb-3 pr-4">Actifs</th>
                    <th className="pb-3 pr-4">Distributions</th>
                    <th className="pb-3 pr-4">Montant distribué</th>
                    <th className="pb-3">Moy. / actif</th>
                  </tr>
                </thead>
                <tbody>
                  {data.regions.map((region, index) => (
                    <tr
                      key={index}
                      className="border-b border-green-900/5 hover:bg-white/40 transition"
                    >
                      <td className="py-3 pr-4 font-bold text-green-950">
                        {region.nomRegion}
                      </td>
                      <td className="py-3 pr-4 text-green-900">
                        {region.totalAgriculteursActifs}
                      </td>
                      <td className="py-3 pr-4 text-green-900">
                        {region.nombreDistributions}
                      </td>
                      <td className="py-3 pr-4 text-green-900">
                        {Number(region.montantDistribue || 0).toLocaleString()}{" "}
                        Ar
                      </td>
                      <td className="py-3 text-green-900">
                        {Number(
                          region.montantMoyenParActif || 0,
                        ).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}{" "}
                        Ar
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
