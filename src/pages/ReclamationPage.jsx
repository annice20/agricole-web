import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { getSession } from "../utils/auth";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

const API = "http://localhost:8081/api/reclamations";

export default function ReclamationPage() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({
    nom: "Utilisateur",
    role: "Agriculteur",
    id: null, // utilisateurs.id (garde pour affichage/role uniquement)
  });

  /*
    ✅ CORRECTIF :
    currentUser.id est l'id UTILISATEUR (table utilisateurs), pas l'id
    AGRICULTEUR (table agriculteurs) -- ce sont deux clés primaires
    différentes reliées par une relation @OneToOne. Le code précédent
    envoyait currentUser.id (ex: 17) au backend en tant qu'agriculteurId,
    alors que l'agriculteur réel a un id différent (ex: 12), d'où
    "Agriculteur introuvable" sur la création ET une liste vide/erronée
    au chargement (appel sur /reclamations/agriculteur/17 au lieu de /12).

    On récupère donc agriculteurId directement depuis la session
    (déjà résolu au login, voir Login.jsx / OtpVerification.jsx), comme
    dans MesDemandes.jsx.
  */
  const [agriculteurId, setAgriculteurId] = useState(null);

  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    sujet: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const charger = async (idAgriculteur) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/agriculteur/${idAgriculteur}`);
      setReclamations(res.data);
    } catch {
      toast.error("Impossible de charger les réclamations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const session = getSession();

    if (!session) {
      toast.warning("Session expirée, veuillez vous reconnecter.");
      navigate("/");
      return;
    }

    setCurrentUser({
      nom: session.nom || "Utilisateur",
      role: session.role || "Agriculteur",
      id: session.id || null,
    });

    const idAgriculteur = session.agriculteurId || null;
    setAgriculteurId(idAgriculteur);

    if (!idAgriculteur) {
      toast.error(
        "Votre fiche agriculteur est introuvable. Contactez un agent de terrain.",
      );
      setLoading(false);
      return;
    }

    charger(idAgriculteur);
  }, [navigate]);

  /*
    Polling automatique toutes les 20s, même pattern que MesDemandes.jsx,
    pour que l'agriculteur voie un changement de statut (traitée/rejetée)
    sans devoir recharger la page manuellement.
  */
  useEffect(() => {
    if (!agriculteurId) return;

    const verifierChangements = async () => {
      try {
        const res = await axios.get(`${API}/agriculteur/${agriculteurId}`);
        const nouvellesReclamations = res.data;

        setReclamations((ancienneListe) => {
          nouvellesReclamations.forEach((nouvelle) => {
            const ancienne = ancienneListe.find((r) => r.id === nouvelle.id);
            if (ancienne && ancienne.statut !== nouvelle.statut) {
              toast.info(
                `Votre réclamation "${nouvelle.sujet}" est passée au statut : ${nouvelle.statut}`,
              );
            }
          });
          return nouvellesReclamations;
        });
      } catch {
        // silencieux
      }
    };

    const interval = setInterval(verifierChangements, 20000);
    return () => clearInterval(interval);
  }, [agriculteurId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agriculteurId) {
      toast.error("Profil agriculteur introuvable, veuillez vous reconnecter");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(API, {
        sujet: formData.sujet,
        description: formData.description,
        agriculteurId: agriculteurId,
      });
      toast.success("Réclamation envoyée avec succès");
      setFormData({ sujet: "", description: "" });
      charger(agriculteurId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  const supprimer = async (id) => {
    if (!window.confirm("Supprimer cette réclamation ?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      toast.success("Réclamation supprimée");
      charger(agriculteurId);
    } catch {
      toast.error("Suppression impossible");
    }
  };

  const badgeStatut = (statut) => {
    switch (statut) {
      case "RESOLU":
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle size={12} />
            Résolu
          </span>
        );
      case "REJETE":
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <XCircle size={12} />
            Rejeté
          </span>
        );
      default:
        return (
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock size={12} />
            En attente
          </span>
        );
    }
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "—";

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex flex-col font-sans antialiased text-green-950">
        {/* Barre de navigation haute et Sidebar intégrées */}
        <MyNavbar />

        {/* ZONE DE CONTENU GLOBAL HARMONISÉE */}
        <div className="flex flex-1 pt-16">
          <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-8 lg:ml-64">
            {/* Titre de la page */}
            <div className="mb-6">
              <h1 className="text-3xl font-black text-green-900 tracking-tight">
                Réclamations
              </h1>
              <p className="text-green-800/80 text-sm font-medium mt-1">
                Signalez un problème ou une réclamation concernant vos aides
                agricoles.
              </p>
            </div>

            {agriculteurId === null && !loading && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl px-4 py-3 text-center">
                Votre fiche agriculteur est introuvable. Contactez un agent de
                terrain pour vérifier votre inscription.
              </div>
            )}

            {/* Grid de deux colonnes pour agencer le formulaire et la liste côte à côte sur grand écran */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
              {/* Colonne Formulaire (Prend 2 colonnes sur 5) */}
              <div className="xl:col-span-2 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
                <h2 className="text-base font-extrabold text-green-900 mb-4 flex items-center gap-2">
                  <Plus size={18} />
                  Nouvelle réclamation
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-green-900 mb-1">
                      Sujet
                    </label>
                    <input
                      type="text"
                      name="sujet"
                      value={formData.sujet}
                      onChange={handleChange}
                      required
                      placeholder="Ex: Aide non reçue, montant incorrect..."
                      className="w-full border border-green-200 bg-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-green-950 font-medium transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-green-900 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Décrivez votre problème en détail..."
                      className="w-full border border-green-200 bg-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-green-950 font-medium transition resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !agriculteurId}
                    className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={15} />
                        <span>Envoyer la réclamation</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Colonne Liste (Prend 3 colonnes sur 5) */}
              <div className="xl:col-span-3 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
                <h2 className="text-base font-extrabold text-green-900 mb-4">
                  Mes réclamations
                </h2>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-700 mb-3" />
                    <p className="text-green-900 text-sm font-semibold animate-pulse">
                      Chargement...
                    </p>
                  </div>
                ) : reclamations.length === 0 ? (
                  <div className="text-center py-12 text-green-800/50 font-semibold bg-white/30 rounded-xl border border-white/30">
                    Aucune réclamation enregistrée.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {reclamations.map((r) => (
                      <div
                        key={r.id}
                        className="bg-white/60 rounded-xl p-4 flex justify-between items-start gap-4 border border-white/40 hover:bg-white/80 transition"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle
                              size={14}
                              className="text-orange-500 shrink-0"
                            />
                            <p className="font-bold text-green-950 truncate">
                              {r.sujet}
                            </p>
                          </div>
                          <p className="text-sm text-green-800 line-clamp-3">
                            {r.description}
                          </p>
                          <p className="text-xs text-green-700/70 mt-2 font-medium">
                            Envoyée le {formatDate(r.dateCreation)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {badgeStatut(r.statut)}
                          {r.statut === "EN_ATTENTE" && (
                            <button
                              onClick={() => supprimer(r.id)}
                              className="p-1.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition shadow-sm"
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
