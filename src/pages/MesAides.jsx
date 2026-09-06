import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Users,
  Sprout,
  Package,
  DollarSign,
  Calendar,
  Info,
} from "lucide-react";
import { toast } from "react-toastify";
import { getMesAides } from "../services/distributionService";
import { getSession } from "../utils/auth";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

export default function MesAides() {
  const navigate = useNavigate();

  const { id: idFromUrl } = useParams();
  const location = useLocation();

  const [aides, setAides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agriculteurNom, setAgriculteurNom] = useState(
    location.state?.agriNom || "",
  );

  const [currentUser, setCurrentUser] = useState({
    nom: "Utilisateur",
    role: "",
    id: null,
  });

  // ID final utilisé pour la requête : priorité à l'URL (cas admin/agent),
  // sinon on retombe sur l'agriculteur connecté lui-même
  const [idCible, setIdCible] = useState(null);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setCurrentUser({
        nom: session.nom || "Utilisateur",
        role: session.role || "",
        id: session.id || null,
      });

      if (idFromUrl) {
        // Cas 1 : consultation via la liste d'agriculteurs (admin/agent)
        setIdCible(idFromUrl);
      } else {
        // Cas 2 : l'agriculteur consulte ses propres aides
        setIdCible(session.id);
        if (!agriculteurNom) {
          setAgriculteurNom(
            `${session.nom || ""} ${session.prenom || ""}`.trim(),
          );
        }
      }
    } else {
      navigate("/");
    }
  }, [idFromUrl]);

  const chargerAides = async (id) => {
    if (!id) {
      toast.error("Identifiant de l'agriculteur introuvable.");
      setLoading(false);
      return;
    }

    try {
      const data = await getMesAides(id);
      setAides(data || []);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Erreur lors du chargement des aides",
      );
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idCible) {
      chargerAides(idCible);
    }
  }, [idCible]);

  const montantTotalRecu = aides.reduce(
    (sum, aide) => sum + Number(aide.montant || 0),
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
        <div className="bg-white/40 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-10 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-700 mb-4"></div>
          <p className="text-lg font-semibold text-green-900 animate-pulse">
            Extraction des allocations...
          </p>
        </div>
      </div>
    );
  }

  // Titre adapté selon le contexte : agriculteur connecté ou consultation par un tiers
  const estProprietaire = !idFromUrl;
  const titre = estProprietaire
    ? "Mes Aides"
    : `Aides versées à : ${agriculteurNom || "l'agriculteur"}`;

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex flex-col font-sans antialiased text-green-950">
        {/* NAVBAR */}
        <div className="flex flex-1 pt-16">
          <MyNavbar />

          {/* CONTENU PRINCIPAL */}
          <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-8 lg:ml-64">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-green-900 tracking-tight">
                  {estProprietaire ? (
                    "Mes Aides"
                  ) : (
                    <>
                      Aides versées à :{" "}
                      <span className="text-green-700">{agriculteurNom}</span>
                    </>
                  )}
                </h1>
                <p className="text-green-800/80 text-sm font-medium mt-1">
                  Suivi de l'ensemble des subventions et dotations matérielles
                  {estProprietaire
                    ? " qui vous ont été versées."
                    : " versées à ce producteur."}
                </p>
              </div>

              {/* KPI Financements de l'agriculteur sélectionné */}
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-4 shadow-lg flex items-center gap-4 min-w-[240px]">
                <div className="bg-green-700 text-white p-3 rounded-xl shadow-md">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-800 uppercase tracking-wider">
                    Total Distribué
                  </p>
                  <p className="text-xl font-black text-green-950 tracking-tight">
                    {montantTotalRecu.toLocaleString()}{" "}
                    <span className="text-xs font-bold text-amber-800 bg-amber-400/30 px-1.5 py-0.5 rounded ml-1">
                      MGA
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* TABLEAU DES AIDES STYLE BLUR-GLASS */}
            <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-green-900/10 bg-green-900/5 text-green-900 font-bold text-sm">
                      <th className="p-4 lg:p-5 flex items-center gap-2">
                        <Sprout size={16} /> Programme
                      </th>
                      <th className="p-4 lg:p-5">
                        <DollarSign size={16} className="inline mr-1" />
                        Montant Allocation
                      </th>
                      <th className="p-4 lg:p-5">
                        <Info size={16} className="inline mr-1" />
                        Description / Spécifications
                      </th>
                      <th className="p-4 lg:p-5">
                        <Calendar size={16} className="inline mr-1" />
                        Date d'octroi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-green-900/5 text-sm font-medium text-green-950">
                    {aides.length > 0 ? (
                      aides.map((aide) => (
                        <tr
                          key={aide.id}
                          className="hover:bg-white/40 transition"
                        >
                          <td className="p-4 lg:p-5 font-bold text-green-900">
                            {aide.demandeAide?.programme?.nom ||
                              "Programme Général"}
                          </td>
                          <td className="p-4 lg:p-5">
                            <span className="text-base font-black text-green-900">
                              {Number(aide.montant || 0).toLocaleString()}
                            </span>{" "}
                            <span className="text-xs font-bold text-green-700">
                              Ariary
                            </span>
                          </td>
                          <td className="p-4 lg:p-5 text-green-800/90 max-w-xs md:max-w-md truncate">
                            {aide.description || "Aucune description spécifiée"}
                          </td>
                          <td className="p-4 lg:p-5">
                            <span className="bg-green-700/10 text-green-800 border border-green-700/20 px-2.5 py-1 rounded-xl text-xs font-bold shadow-sm">
                              {aide.dateDistribution
                                ? new Date(
                                    aide.dateDistribution,
                                  ).toLocaleDateString("fr-FR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                                : "Date inconnue"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="p-8 text-center text-green-800/60 font-medium"
                        >
                          <div className="flex flex-col items-center justify-center gap-2 py-6">
                            <Package size={40} className="text-green-700/40" />
                            <p>
                              Aucune aide enregistrée ou validée pour cet
                              agriculteur.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
