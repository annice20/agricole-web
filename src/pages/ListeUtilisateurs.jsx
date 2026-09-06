import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Trash2, ShieldCheck, Globe } from "lucide-react";
import { toast } from "react-toastify";
import {
  getUtilisateurs,
  changerRoleUtilisateur,
  supprimerUtilisateur,
} from "../services/utilisateurService";
import { getRegions } from "../services/locationService";
import { getSession } from "../utils/auth";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

const ROLES_AUTORISES = ["ADMIN_NATIONAL"];

const ROLES_DISPONIBLES = [
  { value: "ADMIN_NATIONAL", label: "Administrateur National" },
  { value: "RESPONSABLE_REGIONAL", label: "Responsable Régional" },
  { value: "AGENT_TERRAIN", label: "Agent de Terrain" },
];

const ROLE_LABELS = Object.fromEntries(
  ROLES_DISPONIBLES.map((r) => [r.value, r.label]),
);

const ROLE_COLORS = {
  ADMIN_NATIONAL: "bg-purple-100 text-purple-800",
  RESPONSABLE_REGIONAL: "bg-blue-100 text-blue-800",
  AGENT_TERRAIN: "bg-green-100 text-green-800",
};

const str = (val) =>
  val === null || val === undefined || val === "" ? "—" : val;

const getRoleName = (u) => u.roles?.[0]?.nom || u.roleName || "";

export default function ListeUtilisateurs() {
  const navigate = useNavigate();

  const [verificationSession, setVerificationSession] = useState(true);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Sélections temporaires de rôle en attente d'une région (avant confirmation)
  const [roleEnAttente, setRoleEnAttente] = useState({});

  const [currentUser, setCurrentUser] = useState({ id: null, role: "" });

  useEffect(() => {
    const session = getSession();
    const role = session?.role;

    if (!session || !ROLES_AUTORISES.includes(role)) {
      toast.error("Accès réservé aux administrateurs nationaux.");
      navigate("/login");
      return;
    }
    setCurrentUser({ id: session.id, role });
    setVerificationSession(false);
  }, [navigate]);

  const fetchUtilisateurs = async () => {
    try {
      setLoading(true);
      const res = await getUtilisateurs();
      setUtilisateurs(res.data);
    } catch {
      toast.error("Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      const res = await getRegions();
      setRegions(res.data);
    } catch {
      toast.error("Impossible de charger les régions");
    }
  };

  useEffect(() => {
    if (!verificationSession) {
      fetchUtilisateurs();
      fetchRegions();
    }
  }, [verificationSession]);

  // Étape 1 : sélection d'un nouveau rôle dans le menu déroulant.
  // Si RESPONSABLE_REGIONAL est choisi, on affiche un sélecteur de région
  // avant d'envoyer la requête. Pour les autres rôles, on applique direct.
  const handleSelectRole = (utilisateur, nouveauRole) => {
    if (nouveauRole === getRoleName(utilisateur)) return;

    if (utilisateur.id === currentUser.id) {
      toast.error("Vous ne pouvez pas modifier votre propre rôle.");
      return;
    }

    if (nouveauRole === "RESPONSABLE_REGIONAL") {
      setRoleEnAttente((prev) => ({
        ...prev,
        [utilisateur.id]: {
          roleName: nouveauRole,
          regionId: utilisateur.regionGeree?.id || "",
        },
      }));
      return;
    }

    appliquerChangementRole(utilisateur, nouveauRole, null);
  };

  const appliquerChangementRole = async (
    utilisateur,
    nouveauRole,
    regionId,
  ) => {
    try {
      await changerRoleUtilisateur(utilisateur.id, nouveauRole, regionId);
      toast.success("Rôle mis à jour avec succès");
      setUtilisateurs((prev) =>
        prev.map((u) =>
          u.id === utilisateur.id
            ? {
                ...u,
                roles: [{ ...(u.roles?.[0] || {}), nom: nouveauRole }],
                regionGeree: regionId
                  ? regions.find((r) => r.id === Number(regionId)) || null
                  : null,
              }
            : u,
        ),
      );
      setRoleEnAttente((prev) => {
        const copie = { ...prev };
        delete copie[utilisateur.id];
        return copie;
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Impossible de modifier le rôle",
      );
    }
  };

  const confirmerRegion = (utilisateur) => {
    const attente = roleEnAttente[utilisateur.id];
    if (!attente?.regionId) {
      toast.warning("Veuillez sélectionner une région");
      return;
    }
    appliquerChangementRole(utilisateur, attente.roleName, attente.regionId);
  };

  const annulerRoleEnAttente = (utilisateurId) => {
    setRoleEnAttente((prev) => {
      const copie = { ...prev };
      delete copie[utilisateurId];
      return copie;
    });
  };

  const handleDelete = async (id) => {
    if (id === currentUser.id) {
      toast.error("Vous ne pouvez pas supprimer votre propre compte.");
      return;
    }
    try {
      await supprimerUtilisateur(id);
      toast.success("Utilisateur supprimé");
      setUtilisateurs((prev) => prev.filter((u) => u.id !== id));
      setConfirmDelete(null);
    } catch {
      toast.error("Impossible de supprimer cet utilisateur");
    }
  };

  const nomComplet = (u) => `${str(u.prenom)} ${str(u.nom)}`.trim();

  const filtered = utilisateurs.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      nomComplet(u).toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q);
    const matchRole = !filterRole || getRoleName(u) === filterRole;
    return matchSearch && matchRole;
  });

  const totalParRole = (role) =>
    utilisateurs.filter((u) => getRoleName(u) === role).length;

  if (verificationSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
        <div className="bg-white/40 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-10 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-700 mb-4"></div>
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
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-green-900 tracking-tight">
                  Utilisateurs
                </h1>
                <p className="text-green-800/70 text-sm mt-1">
                  Gestion des comptes internes : administrateurs, responsables
                  régionaux et agents de terrain.
                </p>
              </div>
              <button
                onClick={() => navigate("/creer-utilisateur")}
                className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg transition self-start sm:self-auto"
              >
                <Plus size={16} />
                Nouvel utilisateur
              </button>
            </div>

            {/* Cartes KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: "Total comptes", value: utilisateurs.length },
                {
                  label: "Administrateurs",
                  value: totalParRole("ADMIN_NATIONAL"),
                },
                {
                  label: "Responsables régionaux",
                  value: totalParRole("RESPONSABLE_REGIONAL"),
                },
                {
                  label: "Agents de terrain",
                  value: totalParRole("AGENT_TERRAIN"),
                },
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
                  placeholder="Rechercher par nom ou email..."
                  className="bg-transparent outline-none text-sm flex-1 text-green-900 placeholder:text-green-800/40"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-white/70 border border-white/50 rounded-xl px-3 py-2 text-sm text-green-900 outline-none cursor-pointer"
              >
                <option value="">Tous les rôles</option>
                {ROLES_DISPONIBLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
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
                Aucun utilisateur trouvé.
              </div>
            ) : (
              <div className="bg-white/50 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-green-900/10 border-b border-white/50 text-green-950 text-xs font-bold uppercase tracking-wider">
                        <th className="py-4 px-5">Utilisateur</th>
                        <th className="py-4 px-5">Contact</th>
                        <th className="py-4 px-5">Rôle</th>
                        <th className="py-4 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/40">
                      {filtered.map((u) => {
                        const attente = roleEnAttente[u.id];
                        return (
                          <tr
                            key={u.id}
                            className="hover:bg-white/40 transition-colors"
                          >
                            <td className="py-4 px-5">
                              <div className="font-bold text-green-900">
                                {nomComplet(u)}
                              </div>
                              {u.id === currentUser.id && (
                                <span className="text-[10px] font-bold text-green-700 uppercase">
                                  (Vous)
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-5">
                              <div className="text-green-900">
                                {str(u.email)}
                              </div>
                              <div className="text-xs text-green-800/70">
                                {str(u.telephone)}
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <div className="flex flex-col gap-1.5">
                                <span
                                  className={`text-xs font-semibold px-3 py-1 rounded-full w-fit ${ROLE_COLORS[getRoleName(u)] || "bg-gray-100 text-gray-700"}`}
                                >
                                  {ROLE_LABELS[getRoleName(u)] ||
                                    getRoleName(u)}
                                </span>

                                {/* Région actuelle affichée pour un responsable régional */}
                                {getRoleName(u) === "RESPONSABLE_REGIONAL" && (
                                  <span className="text-xs text-green-800/70 flex items-center gap-1">
                                    <Globe size={11} />
                                    {u.regionGeree?.nom ||
                                      "Aucune région assignée"}
                                  </span>
                                )}

                                {u.id !== currentUser.id && (
                                  <select
                                    value={attente?.roleName || getRoleName(u)}
                                    onChange={(e) =>
                                      handleSelectRole(u, e.target.value)
                                    }
                                    className="text-xs border border-white/60 bg-white/70 rounded-lg px-2 py-1 outline-none cursor-pointer text-green-900 w-fit"
                                  >
                                    {ROLES_DISPONIBLES.map((r) => (
                                      <option key={r.value} value={r.value}>
                                        {r.label}
                                      </option>
                                    ))}
                                  </select>
                                )}

                                {/* Sélecteur de région en attente de confirmation */}
                                {attente && (
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <select
                                      value={attente.regionId}
                                      onChange={(e) =>
                                        setRoleEnAttente((prev) => ({
                                          ...prev,
                                          [u.id]: {
                                            ...prev[u.id],
                                            regionId: e.target.value,
                                          },
                                        }))
                                      }
                                      className="text-xs border border-blue-300 bg-blue-50 rounded-lg px-2 py-1 outline-none cursor-pointer text-blue-900 w-fit"
                                    >
                                      <option value="">-- Région --</option>
                                      {regions.map((r) => (
                                        <option key={r.id} value={r.id}>
                                          {r.nom}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => confirmerRegion(u)}
                                      className="text-xs bg-green-700 text-white px-2 py-1 rounded-lg font-bold hover:bg-green-800 transition"
                                    >
                                      OK
                                    </button>
                                    <button
                                      onClick={() => annulerRoleEnAttente(u.id)}
                                      className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-lg font-bold hover:bg-gray-300 transition"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <div
                                  className="p-2 text-green-700"
                                  title="Rôle géré via le menu déroulant"
                                >
                                  <ShieldCheck size={16} />
                                </div>

                                {u.id !== currentUser.id &&
                                  (confirmDelete === u.id ? (
                                    <div className="flex items-center gap-1 bg-red-100 p-1 rounded-lg border border-red-200">
                                      <button
                                        onClick={() => handleDelete(u.id)}
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
                                      onClick={() => setConfirmDelete(u.id)}
                                      className="p-2 text-red-600 hover:bg-red-100/50 rounded-lg transition"
                                      title="Supprimer définitivement"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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
