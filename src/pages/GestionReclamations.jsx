import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { getSession } from "../utils/auth";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

const API = "https://agricole-backend.onrender.com/api/reclamations";

const ROLES_AUTORISES = ["ADMIN_NATIONAL", "RESPONSABLE_REGIONAL"];

export default function GestionReclamations() {
  const navigate = useNavigate();
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState("TOUS");
  const [updating, setUpdating] = useState(null);

  const [userSession, setUserSession] = useState(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      navigate("/");
      return;
    }

    if (!ROLES_AUTORISES.includes(session.role)) {
      toast.error(
        "Accès réservé aux administrateurs et responsables régionaux.",
      );
      navigate("/dashboard");
      return;
    }

    setUserSession(session);
    chargerReclamations(session);
  }, []);

  const chargerReclamations = async (session) => {
    try {
      setLoading(true);
      let res;

      if (session?.role === "RESPONSABLE_REGIONAL" && session?.regionId) {
        const data = await axios.get(`${API}/region/${session.regionId}`);
        setReclamations(data.data);
      } else {
        // ADMIN_NATIONAL : toutes les réclamations
        res = await axios.get(API);
        setReclamations(res.data);
      }
    } catch {
      toast.error("Impossible de charger les réclamations");
    } finally {
      setLoading(false);
    }
  };

  const changerStatut = async (id, nouveauStatut) => {
    try {
      setUpdating(id);
      await axios.put(`${API}/${id}/statut`, { statut: nouveauStatut });
      toast.success(`Réclamation mise à jour.`);
      chargerReclamations(userSession);
    } catch {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setUpdating(null);
    }
  };

  const reclamationsFiltrees =
    filtreStatut === "TOUS"
      ? reclamations
      : reclamations.filter((r) => r.statut === filtreStatut);

  const compteur = (statut) =>
    reclamations.filter((r) => r.statut === statut).length;

  const badgeStatut = (statut) => {
    switch (statut) {
      case "TRAITEE":
        return (
          <span className="bg-green-200 text-green-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle size={12} /> Traitée
          </span>
        );
      case "REJETEE":
        return (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <XCircle size={12} /> Rejetée
          </span>
        );
      default:
        return (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock size={12} /> En attente
          </span>
        );
    }
  };

  const isAdmin = userSession?.role === "ADMIN_NATIONAL";
  const isResponsableRegional = userSession?.role === "RESPONSABLE_REGIONAL";

  // Seul l'admin national peut traiter/rejeter (cohérent avec la validation
  // des demandes d'aide, réservée elle aussi à l'admin dans GestionDemandes.jsx).
  const peutTraiter = isAdmin;
  const peutVoirAgriculteur = isAdmin || isResponsableRegional;

  const titrePage = isAdmin
    ? "Gestion des Réclamations"
    : "Réclamations de ma région";

  const sousTitrePage = isAdmin
    ? "Traitez et suivez toutes les réclamations soumises par les agriculteurs."
    : `Suivez les réclamations des agriculteurs de votre région${userSession?.regionNom ? ` (${userSession.regionNom})` : ""}. Le traitement reste réservé à l'administration nationale.`;

  // Tant que la session n'est pas validée par le garde-fou, on n'affiche rien
  if (!userSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-700"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex flex-col font-sans antialiased text-green-950">
        <MyNavbar />

        <div className="flex flex-1 pt-16">
          <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-8 lg:ml-64">
            <div className="mb-6">
              <h1 className="text-3xl font-black text-green-900 tracking-tight">
                {titrePage}
              </h1>
              <p className="text-green-800/70 text-sm mt-1">{sousTitrePage}</p>
            </div>

            {/* Cartes compteurs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                {
                  label: "En attente",
                  statut: "EN_ATTENTE",
                  color: "bg-yellow-100 text-yellow-800",
                  icon: <Clock size={18} />,
                },
                {
                  label: "Traitées",
                  statut: "TRAITEE",
                  color: "bg-green-100 text-green-800",
                  icon: <CheckCircle size={18} />,
                },
                {
                  label: "Rejetées",
                  statut: "REJETEE",
                  color: "bg-red-100 text-red-800",
                  icon: <XCircle size={18} />,
                },
              ].map(({ label, statut, color, icon }) => (
                <div
                  key={statut}
                  className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-4 shadow-xl flex items-center gap-4"
                >
                  <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
                  <div>
                    <p className="text-xs font-bold text-green-800 uppercase">
                      {label}
                    </p>
                    <p className="text-2xl font-black text-green-900">
                      {compteur(statut)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filtres */}
            <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-4 shadow-xl mb-6 flex items-center gap-3 flex-wrap">
              <Filter size={16} className="text-green-800" />
              <span className="text-sm font-bold text-green-900">
                Filtrer :
              </span>
              {["TOUS", "EN_ATTENTE", "TRAITEE", "REJETEE"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFiltreStatut(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    filtreStatut === s
                      ? "bg-green-700 text-white border-green-700"
                      : "bg-white/60 text-green-800 border-white/40 hover:bg-green-100"
                  }`}
                >
                  {s === "TOUS"
                    ? "Tous"
                    : s === "EN_ATTENTE"
                      ? "En attente"
                      : s === "TRAITEE"
                        ? "Traitées"
                        : "Rejetées"}
                </button>
              ))}
            </div>

            {/* Liste des réclamations */}
            <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-700 mb-3" />
                  <p className="text-green-900 text-sm font-semibold animate-pulse">
                    Chargement...
                  </p>
                </div>
              ) : reclamationsFiltrees.length === 0 ? (
                <div className="text-center py-12 text-green-800/50 font-semibold bg-white/30 rounded-xl border border-white/30">
                  Aucune réclamation dans cette catégorie.
                </div>
              ) : (
                <div className="space-y-4">
                  {reclamationsFiltrees.map((r) => (
                    <div
                      key={r.id}
                      className="bg-white/60 rounded-xl p-5 border border-white/40 hover:bg-white/80 transition"
                    >
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            size={15}
                            className="text-orange-500 shrink-0"
                          />
                          <h2 className="font-bold text-green-950">
                            {r.sujet}
                          </h2>
                        </div>
                        {badgeStatut(r.statut)}
                      </div>

                      <p className="text-sm text-green-800 mb-3">
                        {r.description}
                      </p>

                      <div className="flex items-center justify-between flex-wrap gap-3 border-t border-white/30 pt-3">
                        <div className="text-xs text-green-700/70 space-y-0.5">
                          {peutVoirAgriculteur && r.agriculteur && (
                            <p>
                              Agriculteur :{" "}
                              <span className="font-semibold text-green-900">
                                {r.agriculteur.prenom} {r.agriculteur.nom}
                              </span>
                            </p>
                          )}
                          <p>
                            Soumise le :{" "}
                            <span className="font-semibold text-green-900">
                              {new Date(
                                r.dateReclamation || r.dateCreation,
                              ).toLocaleDateString("fr-FR")}
                            </span>
                          </p>
                        </div>

                        {peutTraiter && r.statut === "EN_ATTENTE" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => changerStatut(r.id, "TRAITEE")}
                              disabled={updating === r.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                            >
                              {updating === r.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-white" />
                              ) : (
                                <CheckCircle size={13} />
                              )}
                              Marquer traitée
                            </button>
                            <button
                              onClick={() => changerStatut(r.id, "REJETEE")}
                              disabled={updating === r.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                            >
                              <XCircle size={13} />
                              Rejeter
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
