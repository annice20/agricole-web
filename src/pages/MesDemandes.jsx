import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sprout,
  Send,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { getDemandes, createDemande } from "../services/demandeAideService";
import { getSession } from "../utils/auth";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

export default function MesDemandes() {
  const navigate = useNavigate();

  const [programmes, setProgrammes] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    programmeId: "",
    commentaire: "",
  });

  const [currentUser, setCurrentUser] = useState({
    nom: "Utilisateur",
    role: "",
    id: null, // ✅ id représente désormais l'id AGRICULTEUR, pas l'id utilisateur
  });

  useEffect(() => {
    const session = getSession();
    if (session) {
      setCurrentUser({
        nom: session.nom || "Utilisateur",
        role: session.role || "",
        /*
          ✅ CORRECTIF PRINCIPAL :
          session.id correspond à utilisateurs.id (ex: 17)
          session.agriculteurId correspond à agriculteurs.id (ex: 12)
          Il faut utiliser agriculteurId ici, sinon le backend renvoie
          "Agriculteur introuvable" car aucun agriculteur n'a pour id
          la valeur de utilisateurs.id.
        */
        id: session.agriculteurId || null,
      });
    } else {
      navigate("/");
    }
  }, [navigate]);

  // Polling automatique du statut des demandes toutes les 20s,
  // pour que l'agriculteur voie les changements (validée/refusée/disponible)
  // sans avoir à recharger la page manuellement.
  useEffect(() => {
    if (!currentUser.id) return;

    const verifierChangements = async () => {
      try {
        const response = await getDemandes();
        const mesDemandes = response.data.filter(
          (d) =>
            String(d.agriculteurId ?? d.agriculteur?.id) ===
            String(currentUser.id),
        );

        // Comparaison avec l'état précédent pour détecter un changement de statut
        setDemandes((ancienneListe) => {
          mesDemandes.forEach((nouvelle) => {
            const ancienne = ancienneListe.find((d) => d.id === nouvelle.id);
            if (ancienne && ancienne.statut !== nouvelle.statut) {
              toast.info(
                `Votre demande #${nouvelle.id} est passée au statut : ${nouvelle.statut}`,
              );
            }
          });
          return mesDemandes;
        });
      } catch {
        // silencieux, comme pour le compteur de notifs dans la navbar
      }
    };

    const interval = setInterval(verifierChangements, 20000);
    return () => clearInterval(interval);
  }, [currentUser.id]);

  const chargerDemandes = async (agriculteurId) => {
    try {
      const response = await getDemandes();
      const mesDemandes = response.data.filter(
        (d) =>
          String(d.agriculteurId ?? d.agriculteur?.id) ===
          String(agriculteurId),
      );
      setDemandes(mesDemandes);
    } catch {
      toast.error("Erreur lors du chargement de vos demandes");
    }
  };

  const chargerProgrammes = async () => {
    try {
      const res = await axios.get(
        "https://agricole-backend.onrender.com/api/programmes",
      );
      // Seuls les programmes actifs peuvent recevoir de nouvelles demandes
      setProgrammes(res.data.filter((p) => p.actif));
    } catch {
      toast.error("Impossible de charger les programmes disponibles");
    }
  };

  useEffect(() => {
    if (!currentUser.id) return;

    const init = async () => {
      setLoading(true);
      await Promise.all([chargerDemandes(currentUser.id), chargerProgrammes()]);
      setLoading(false);
    };
    init();
  }, [currentUser.id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.programmeId) {
      toast.error("Veuillez sélectionner un programme");
      return;
    }

    if (!currentUser.id) {
      toast.error("Profil agriculteur introuvable, veuillez vous reconnecter");
      return;
    }

    setSubmitting(true);
    try {
      await createDemande({
        commentaire: formData.commentaire,
        statut: "EN_ATTENTE",
        agriculteurId: parseInt(currentUser.id), // ✅ maintenant le bon id agriculteur
        programmeId: parseInt(formData.programmeId),
      });
      toast.success("Votre demande a bien été envoyée");
      setFormData({ programmeId: "", commentaire: "" });
      chargerDemandes(currentUser.id);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de l'envoi de la demande",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const badgeStatut = (statut) => {
    switch (statut) {
      case "VALIDEE":
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
            <CheckCircle size={12} />
            Validée
          </span>
        );
      case "DISPONIBLE":
        return (
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
            <CheckCircle size={12} />
            Disponible
          </span>
        );
      case "DISTRIBUEE":
        return (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
            <Package size={12} />
            Distribuée
          </span>
        );
      case "REFUSEE":
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
            <XCircle size={12} />
            Refusée
          </span>
        );
      default:
        return (
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
            <Clock size={12} />
            En attente
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
        <div className="bg-white/40 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-10 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-700 mb-4"></div>
          <p className="text-lg font-semibold text-green-900 animate-pulse">
            Chargement de vos demandes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex flex-col font-sans antialiased text-green-950">
        <div className="flex flex-1 pt-16">
          <MyNavbar />

          <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-8 lg:ml-64">
            {/* Titre */}
            <div className="mb-8">
              <h1 className="text-3xl font-black text-green-900 tracking-tight">
                Mes demandes d'aide
              </h1>
              <p className="text-green-800/80 text-sm font-medium mt-1">
                Soumettez une nouvelle demande et suivez l'état de vos demandes
                précédentes.
              </p>
            </div>

            {/* Formulaire nouvelle demande */}
            <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl mb-6">
              <h2 className="text-lg font-extrabold text-green-900 mb-4 flex items-center gap-2">
                <Sprout size={18} />
                Nouvelle demande
              </h2>

              {programmes.length === 0 ? (
                <div className="text-center py-8 text-green-800/60 font-medium bg-white/30 rounded-xl border border-white/30">
                  Aucun programme d'aide n'est actuellement disponible.
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <select
                    name="programmeId"
                    value={formData.programmeId}
                    onChange={handleChange}
                    required
                    className="w-full border border-white/60 bg-white/70 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 outline-none cursor-pointer"
                  >
                    <option value="">-- Sélectionner un programme --</option>
                    {programmes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.titre} — {p.typeAide}
                      </option>
                    ))}
                  </select>

                  <div className="w-full border border-white/60 bg-green-50/70 rounded-xl px-3 py-2 text-sm text-green-800 font-semibold flex items-center gap-2">
                    <Users size={14} className="text-green-700 shrink-0" />
                    {currentUser.nom}
                  </div>

                  <textarea
                    name="commentaire"
                    value={formData.commentaire}
                    onChange={handleChange}
                    placeholder="Précisez votre besoin (surface concernée, urgence, contexte...)"
                    rows={3}
                    className="sm:col-span-2 w-full border border-white/60 bg-white/70 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 outline-none resize-none"
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="sm:col-span-2 w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Envoyer la demande</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Historique des demandes */}
            <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
              <h2 className="text-lg font-extrabold text-green-900 mb-4">
                Historique de mes demandes
              </h2>
              {demandes.length === 0 ? (
                <div className="text-center py-12 text-green-800/50 font-semibold bg-white/30 rounded-xl border border-white/30">
                  Vous n'avez encore soumis aucune demande.
                </div>
              ) : (
                <div className="space-y-3">
                  {demandes.map((d) => (
                    <div
                      key={d.id}
                      className="bg-white/60 rounded-xl p-4 flex justify-between items-start gap-4 border border-white/40 hover:bg-white/80 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-green-950">
                          Demande #{d.id}
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Programme :{" "}
                          <span className="font-semibold">
                            {programmes.find(
                              (p) =>
                                String(p.id) ===
                                String(d.programmeId ?? d.programme?.id),
                            )?.titre ||
                              d.programme?.titre ||
                              `#${d.programmeId ?? d.programme?.id}`}
                          </span>
                        </p>
                        {d.commentaire && (
                          <p className="text-sm text-green-800 mt-1">
                            {d.commentaire}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0">{badgeStatut(d.statut)}</div>
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
