import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import {
  getDemandes,
  createDemande,
  deleteDemande,
} from "../services/demandeAideService";
import MyNavbar from "./MyNavbar";
import { getSession } from "../utils/auth";
import { ThemeProvider } from "../context/ThemeContext";

export default function GestionDemandes() {
  const navigate = useNavigate();
  const location = useLocation();

  const session = getSession();

  const agriculteurId =
    location.state?.agriculteurId || session?.agriculteurId || null;

  const agriculteurNom =
    location.state?.agriculteurNom ||
    `${session?.prenom || ""} ${session?.nom || ""}`.trim();

  // Vue régionale : responsable régional, uniquement si aucun agriculteur précis n'est visé
  const modeRegion =
    session?.role === "RESPONSABLE_REGIONAL" && !location.state?.agriculteurId;

  // Vue globale admin : admin national, uniquement si aucun agriculteur précis n'est visé
  const modeGlobalAdmin =
    session?.role === "ADMIN_NATIONAL" && !location.state?.agriculteurId;

  // Vue "liste multiple" (affiche le nom de l'agriculteur sur chaque ligne)
  const modeListeMultiple = modeRegion || modeGlobalAdmin;

  const [demandes, setDemandes] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [formData, setFormData] = useState({
    commentaire: "",
    programmeId: "",
  });

  // Informations de la session de l'Agent connecté
  const [currentUser, setCurrentUser] = useState({
    nom: "Utilisateur",
    role: "Gestionnaire",
  });

  const chargerDemandes = async () => {
    try {
      // Cas responsable régional : toutes les demandes de sa région
      if (modeRegion) {
        if (!session?.regionId) {
          toast.warning("Aucune région associée à votre compte.");
          return;
        }
        const response = await axios.get(
          `http://localhost:8081/api/demandes/region/${session.regionId}`,
        );
        setDemandes(response.data);
        return;
      }

      // Cas admin national sans agriculteur précis : toutes les demandes, tout le pays
      if (modeGlobalAdmin) {
        const response = await getDemandes();
        setDemandes(response.data);
        return;
      }

      // Cas agent, ou admin/responsable venant d'une fiche agriculteur précise
      const response = await getDemandes();
      const filtered = agriculteurId
        ? response.data.filter(
            (d) =>
              d.agriculteurId === agriculteurId ||
              d.agriculteur?.id === agriculteurId,
          )
        : response.data;
      setDemandes(filtered);
    } catch {
      toast.error("Erreur lors du chargement des demandes");
    }
  };

  const changerStatut = async (id, nouveauStatut) => {
    try {
      await axios.patch(`http://localhost:8081/api/demandes/${id}/statut`, {
        statut: nouveauStatut,
      });
      toast.success(`Statut mis à jour : ${nouveauStatut}`);
      chargerDemandes();
    } catch {
      toast.error("Erreur lors du changement de statut");
    }
  };

  const chargerProgrammes = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/programmes");
      setProgrammes(res.data);
    } catch {
      toast.error("Impossible de charger les programmes");
    }
  };

  useEffect(() => {
    const session = getSession();
    if (session) {
      setCurrentUser({
        nom: session.nom || "Utilisateur",
        role: session.role || "",
      });
    }
  }, []);

  // Chargement des données (dépend de agriculteurId ou des modes globaux)
  useEffect(() => {
    if (!modeRegion && !modeGlobalAdmin && !agriculteurId) {
      toast.warning("Aucun agriculteur sélectionné.");
      navigate("/agriculteurs");
      return;
    }
    chargerDemandes();
    chargerProgrammes();
  }, [agriculteurId, modeRegion, modeGlobalAdmin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createDemande({
        commentaire: formData.commentaire,
        statut: "EN_ATTENTE",
        agriculteurId: Number(agriculteurId),
        programmeId: parseInt(formData.programmeId),
      });
      toast.success("Demande enregistrée");
      setFormData({ commentaire: "", programmeId: "" });
      chargerDemandes();
    } catch {
      toast.error("Erreur d'enregistrement");
    }
  };

  const supprimer = async (id) => {
    if (!window.confirm("Supprimer cette demande ?")) return;
    try {
      await deleteDemande(id);
      toast.success("Demande supprimée");
      chargerDemandes();
    } catch {
      toast.error("Suppression impossible");
    }
  };

  const badgeStatut = (statut) => {
    switch (statut) {
      case "VALIDEE":
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle size={12} />
            Validée
          </span>
        );
      case "DISPONIBLE":
        return (
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle size={12} />
            Disponible
          </span>
        );
      case "DISTRIBUEE":
        return (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Package size={12} />
            Distribuée
          </span>
        );
      case "REFUSEE":
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <XCircle size={12} />
            Refusée
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

  const isAdmin = currentUser.role === "ADMIN_NATIONAL";
  const isAgent = currentUser.role === "AGENT_TERRAIN";

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex flex-col font-sans antialiased text-green-950">
        {/* NAVBAR */}
        <div className="flex flex-1 pt-16">
          <MyNavbar />

          {/* CONTENU */}
          <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-8 lg:ml-64">
            {/* Titre */}
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-black text-green-900 tracking-tight">
                  Demandes d'aide
                </h1>
                <p className="text-green-800/80 text-sm font-medium mt-1">
                  {modeRegion ? (
                    <>
                      Région :{" "}
                      <span className="font-bold">
                        {session?.regionNom || "—"}
                      </span>
                    </>
                  ) : modeGlobalAdmin ? (
                    <>
                      Vue nationale :{" "}
                      <span className="font-bold">toutes les régions</span>
                    </>
                  ) : (
                    <>
                      Agriculteur :{" "}
                      <span className="font-bold">{agriculteurNom}</span>
                    </>
                  )}
                </p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-white/60 hover:bg-white/80 text-green-900 px-4 py-2.5 rounded-xl font-bold text-sm border border-white/50 shadow transition"
              >
                ← Retour
              </button>
            </div>

            {/* Formulaire — masqué en vue globale (pas de création ciblée sur un agriculteur) */}
            {!modeListeMultiple && (
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl mb-6">
                <h2 className="text-lg font-extrabold text-green-900 mb-4 flex items-center gap-2">
                  <Plus size={18} />
                  Nouvelle demande
                </h2>
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <textarea
                    name="commentaire"
                    value={formData.commentaire}
                    onChange={handleChange}
                    placeholder="Commentaire sur la demande..."
                    rows={3}
                    required
                    className="sm:col-span-2 w-full border border-white/60 bg-white/70 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 outline-none resize-none"
                  />

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
                    {agriculteurNom}
                  </div>

                  <button
                    type="submit"
                    className="sm:col-span-2 w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg"
                  >
                    <Plus size={16} />
                    Enregistrer la demande
                  </button>
                </form>
              </div>
            )}

            {/* Liste des demandes */}
            <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
              <h2 className="text-lg font-extrabold text-green-900 mb-4">
                Historique des demandes
              </h2>
              {demandes.length === 0 ? (
                <div className="text-center py-12 text-green-800/50 font-semibold bg-white/30 rounded-xl border border-white/30">
                  {modeRegion
                    ? "Aucune demande enregistrée pour cette région."
                    : modeGlobalAdmin
                      ? "Aucune demande enregistrée sur la plateforme."
                      : "Aucune demande enregistrée pour cet agriculteur."}
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

                        {/* Nom de l'agriculteur — utile en vue régionale et vue nationale */}
                        {modeListeMultiple && (
                          <p className="text-sm text-green-900 font-semibold mt-0.5">
                            {d.agriculteur?.prenom} {d.agriculteur?.nom}
                          </p>
                        )}

                        <p className="text-sm text-green-800 mt-0.5">
                          {d.commentaire}
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Programme :{" "}
                          <span className="font-semibold">
                            {programmes.find(
                              (p) =>
                                p.id === (d.programmeId ?? d.programme?.id),
                            )?.titre || `#${d.programmeId ?? d.programme?.id}`}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {badgeStatut(d.statut)}

                        {isAdmin && (
                          <button
                            onClick={() => supprimer(d.id)}
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition"
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}

                        {/* Approuver : EN_ATTENTE → VALIDEE — ADMIN uniquement */}
                        {d.statut === "EN_ATTENTE" && isAdmin && (
                          <button
                            onClick={() => changerStatut(d.id, "VALIDEE")}
                            className="p-1.5 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                            title="Approuver"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}

                        {/* Refuser : EN_ATTENTE → REFUSEE — ADMIN uniquement */}
                        {d.statut === "EN_ATTENTE" && isAdmin && (
                          <button
                            onClick={() => changerStatut(d.id, "REFUSEE")}
                            className="p-1.5 rounded-lg border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition"
                            title="Refuser"
                          >
                            <XCircle size={14} />
                          </button>
                        )}

                        {/* Marquer disponible : VALIDEE → DISPONIBLE — ADMIN uniquement */}
                        {d.statut === "VALIDEE" && isAdmin && (
                          <button
                            onClick={() => changerStatut(d.id, "DISPONIBLE")}
                            className="p-1.5 rounded-lg border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                            title="Marquer comme disponible"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}

                        {/* Enregistrer une distribution — ADMIN et AGENT */}
                        {(d.statut === "VALIDEE" ||
                          d.statut === "DISPONIBLE") &&
                          (isAdmin || isAgent) && (
                            <button
                              onClick={() =>
                                navigate("/distributions/ajouter", {
                                  state: {
                                    demandeId: d.id,
                                    agriculteurNom: modeListeMultiple
                                      ? `${d.agriculteur?.prenom || ""} ${d.agriculteur?.nom || ""}`.trim()
                                      : agriculteurNom,
                                    programmeTitre:
                                      programmes.find(
                                        (p) =>
                                          String(p.id) ===
                                          String(
                                            d.programmeId ?? d.programme?.id,
                                          ),
                                      )?.titre || "",
                                  },
                                })
                              }
                              className="p-1.5 rounded-lg border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 transition"
                              title="Enregistrer une distribution"
                            >
                              <Package size={14} />
                            </button>
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
