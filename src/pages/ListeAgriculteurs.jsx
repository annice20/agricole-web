import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ToggleRight,
  FileText,
  Gift,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { getSession } from "../utils/auth";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

const str = (val) => {
  if (val === null || val === undefined) return "—";
  if (typeof val === "object") return val.nom || val.libelle || val.name || "—";
  return String(val);
};

export default function ListeAgriculteurs() {
  const navigate = useNavigate();

  // Session lue immédiatement au montage (pas besoin d'attendre un effect)
  const session = getSession();

  const [agriculteurs, setAgriculteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCulture, setFilterCulture] = useState("");
  const [filterActif, setFilterActif] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Stocke l'utilisateur connecté avec son rôle extrait de la session
  const [currentUser, setCurrentUser] = useState({
    nom: session?.nom || "Utilisateur",
    role: session?.role || "",
  });

  // Effect 1 — session uniquement
  useEffect(() => {
    const s = getSession();
    if (s) {
      setCurrentUser({
        nom: s.nom || "Utilisateur",
        role: s.role || "",
      });
    }
  }, []);

  const fetchAgriculteurs = async () => {
    try {
      setLoading(true);

      // Vue régionale : le responsable régional ne voit que sa région
      const url =
        session?.role === "RESPONSABLE_REGIONAL" && session?.regionId
          ? `/api/agriculteurs/region/${session.regionId}`
          : "/api/agriculteurs";

      const res = await axios.get(url);
      setAgriculteurs(res.data);
    } catch {
      toast.error("Impossible de charger les agriculteurs");
    } finally {
      setLoading(false);
    }
  };

  // Effect 2 — chargement des données
  useEffect(() => {
    fetchAgriculteurs();
  }, []);

  const handleDelete = async (id) => {
    if (currentUser.role !== "ADMIN_NATIONAL") {
      toast.error("Action non autorisée pour votre rôle");
      return;
    }
    try {
      await axios.delete(`/api/agriculteurs/${id}`);
      toast.success("Agriculteur supprimé");
      setAgriculteurs((prev) => prev.filter((a) => a.id !== id));
      setConfirmDelete(null);
    } catch {
      toast.error("Impossible de supprimer l'agriculteur");
    }
  };

  const handleToggleActif = async (a) => {
    if (!canActivate) {
      toast.error(
        "Seuls les agents de terrain, les administrateurs ou responsables régionaux peuvent activer un compte",
      );
      return;
    }
    try {
      await axios.patch(`/api/agriculteurs/${a.id}/activation`, {
        statusCompte: a.actif ? "EN_ATTENTE" : "ACTIF",
      });
      toast.success(
        !a.actif
          ? "Compte activé ! Un e-mail de confirmation a été envoyé à l'agriculteur."
          : "Compte désactivé avec succès.",
      );
      setAgriculteurs((prev) =>
        prev.map((x) => (x.id === a.id ? { ...x, actif: !x.actif } : x)),
      );
    } catch {
      toast.error("Impossible de modifier le statut");
    }
  };

  const nomComplet = (a) => `${str(a.prenom)} ${str(a.nom)}`.trim();
  const regionNom = (a) => a.district?.region?.nom || "—";
  const districtNom = (a) => a.district?.nom || "—";

  const cultures = [
    ...new Set(agriculteurs.map((a) => a.typeCulture).filter(Boolean)),
  ].sort();

  const filtered = agriculteurs.filter((a) => {
    const q = search.toLowerCase();
    return (
      (nomComplet(a).toLowerCase().includes(q) ||
        regionNom(a).toLowerCase().includes(q) ||
        districtNom(a).toLowerCase().includes(q)) &&
      (!filterCulture || a.typeCulture === filterCulture) &&
      (filterActif === "" || Boolean(a.actif) === (filterActif === "true"))
    );
  });

  const surfaceTotale = agriculteurs.reduce(
    (s, a) => s + (Number(a.superficie) || 0),
    0,
  );
  const regions = new Set(
    agriculteurs.map((a) => regionNom(a)).filter((v) => v !== "—"),
  ).size;

  // Variables de droits d'accès affinées
  const isAdmin = currentUser.role === "ADMIN_NATIONAL";
  const isResponsable = currentUser.role === "RESPONSABLE_REGIONAL";
  const isAgent = currentUser.role === "AGENT_TERRAIN";

  // Qui peut modifier les fiches (Ajout/Édition)
  const canModify = isAgent || isAdmin || isResponsable;

  // CORRECTION APPLICATION DES DROITS : L'agent de terrain est inclus !
  const canActivate = isAgent || isAdmin || isResponsable;

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex flex-col font-sans antialiased text-green-950">
        <div className="flex flex-1 pt-16">
          <MyNavbar />

          <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-8 lg:ml-64">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-green-900 tracking-tight">
                  Agriculteurs
                </h1>
                <p className="text-green-800/70 text-sm mt-1">
                  {isResponsable
                    ? `Agriculteurs enregistrés dans votre région${session?.regionNom ? ` (${session.regionNom})` : ""}.`
                    : "Gestion des agriculteurs enregistrés sur la plateforme."}
                </p>
              </div>
              {canModify && (
                <button
                  onClick={() => navigate("/agriculteurs/nouveau")}
                  className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg transition self-start sm:self-auto"
                >
                  <Plus size={16} />
                  Nouvel agriculteur
                </button>
              )}
            </div>

            {/* Cartes KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: "Total Inscrits", value: agriculteurs.length },
                {
                  label: "Producteurs Actifs",
                  value: agriculteurs.filter((a) => a.actif).length,
                },
                {
                  label: "Surface Totale",
                  value: `${surfaceTotale.toFixed(2)} ha`,
                },
                { label: "Régions Couvertes", value: regions },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl"
                >
                  <span className="text-xs font-bold text-green-800 uppercase tracking-wider">
                    {label}
                  </span>
                  <div className="text-4xl font-black text-green-950 mt-1 tracking-tight">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Filtres */}
            <div className="bg-white/50 backdrop-blur-md border border-white/40 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 flex-1 bg-white/70 border border-white/50 rounded-xl px-3 py-2">
                <Search size={16} className="text-green-700" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par nom, région, district..."
                  className="bg-transparent outline-none text-sm flex-1 text-green-900 placeholder:text-green-800/40"
                />
              </div>
              <select
                value={filterCulture}
                onChange={(e) => setFilterCulture(e.target.value)}
                className="bg-white/70 border border-white/50 rounded-xl px-3 py-2 text-sm text-green-900 outline-none cursor-pointer"
              >
                <option value="">Toutes les cultures</option>
                {cultures.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={filterActif}
                onChange={(e) => setFilterActif(e.target.value)}
                className="bg-white/70 border border-white/50 rounded-xl px-3 py-2 text-sm text-green-900 outline-none cursor-pointer"
              >
                <option value="">Tous les statuts</option>
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </select>
            </div>

            {/* Tableau */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/30 rounded-2xl border border-white/20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-700 mb-4" />
                <p className="font-semibold text-green-900 animate-pulse">
                  Chargement des données...
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-green-800/60 font-semibold bg-white/40 rounded-2xl border border-white/40">
                Aucun agriculteur trouvé.
              </div>
            ) : (
              <div className="bg-white/50 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-green-900/10 border-b border-white/50 text-green-950 text-xs font-bold uppercase tracking-wider">
                        <th className="py-4 px-5">Agriculteur</th>
                        <th className="py-4 px-5">Culture</th>
                        <th className="py-4 px-5">Région / District</th>
                        <th className="py-4 px-5">Superficie</th>
                        <th className="py-4 px-5">Statut</th>
                        <th className="py-4 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/40">
                      {filtered.map((a) => (
                        <tr
                          key={a.id}
                          className="hover:bg-white/40 transition-colors"
                        >
                          <td className="py-4 px-5">
                            <div className="font-bold text-green-900">
                              {nomComplet(a)}
                            </div>
                            <div className="text-xs text-green-800/70 mt-0.5">
                              {str(a.telephone)}
                            </div>
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap">
                            {a.typeCulture ? (
                              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800">
                                {a.typeCulture}
                              </span>
                            ) : (
                              <span className="text-xs text-green-800/40">
                                —
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-5">
                            <div className="font-medium text-green-900">
                              {regionNom(a)}
                            </div>
                            <div className="text-xs text-green-800/70">
                              {districtNom(a)}
                            </div>
                          </td>
                          <td className="py-4 px-5 font-semibold text-green-900">
                            {a.superficie ? `${a.superficie} ha` : "—"}
                          </td>
                          <td className="py-4 px-5">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg ${a.actif ? "bg-green-200 text-green-900" : "bg-red-100 text-red-800"}`}
                            >
                              {a.actif ? "Actif" : "Inactif"}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  navigate(`/agriculteurs/${a.id}/aides`, {
                                    state: { agriNom: nomComplet(a) },
                                  })
                                }
                                className="p-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition"
                                title="Suivre les aides distribuées"
                              >
                                <Gift size={16} />
                              </button>

                              {/* BOUTON DE CHANGEMENT DE STATUT (Bascule) */}
                              {canActivate ? (
                                <button
                                  onClick={() => handleToggleActif(a)}
                                  title={
                                    a.actif
                                      ? "Désactiver le compte"
                                      : "Activer et valider le compte"
                                  }
                                  className="p-2 text-green-700 hover:bg-green-200/50 rounded-lg transition"
                                >
                                  <ToggleRight
                                    size={18}
                                    className={
                                      a.actif
                                        ? "text-green-700"
                                        : "text-gray-400"
                                    }
                                  />
                                </button>
                              ) : (
                                <div
                                  className="p-2 text-gray-300 cursor-not-allowed"
                                  title="Activation réservée aux agents, responsables ou administrateurs"
                                >
                                  <ToggleRight
                                    size={18}
                                    className="text-gray-200 opacity-50"
                                  />
                                </div>
                              )}

                              {/* BOUTON ÉDITION */}
                              {canModify && (
                                <button
                                  onClick={() =>
                                    navigate(`/agriculteurs/modifier/${a.id}`)
                                  }
                                  className="p-2 text-blue-700 hover:bg-blue-100/50 rounded-lg transition"
                                  title="Modifier les informations"
                                >
                                  <Pencil size={16} />
                                </button>
                              )}

                              {/* BOUTON DE SUPPRESSION */}
                              {isAdmin &&
                                (confirmDelete === a.id ? (
                                  <div className="flex items-center gap-1 bg-red-100 p-1 rounded-lg border border-red-200">
                                    <button
                                      onClick={() => handleDelete(a.id)}
                                      className="px-2 py-0.5 text-xs bg-red-600 text-white rounded font-bold"
                                    >
                                      Oui
                                    </button>
                                    <button
                                      onClick={() => setConfirmDelete(null)}
                                      className="px-2 py-0.5 text-xs bg-gray-300 text-gray-700 rounded font-bold"
                                    >
                                      Non
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setConfirmDelete(a.id)}
                                    className="p-2 text-red-600 hover:bg-red-100/50 rounded-lg transition"
                                    title="Supprimer définitivement"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                ))}

                              <button
                                onClick={() =>
                                  navigate("/demandes", {
                                    state: {
                                      agriculteurId: a.id,
                                      agriculteurNom: nomComplet(a),
                                    },
                                  })
                                }
                                className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                title="Demandes d'aide (Collecte)"
                              >
                                <FileText size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
