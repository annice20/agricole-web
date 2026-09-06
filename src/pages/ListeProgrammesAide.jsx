import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sprout,
  Plus,
  Search,
  Pencil,
  Calendar,
  DollarSign,
  ToggleRight,
  Leaf,
  Wrench,
  GraduationCap,
  Droplets,
  Receipt,
  Coins,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import MyNavbar from "./MyNavbar";
import { getSession } from "../utils/auth";
import { ThemeProvider } from "../context/ThemeContext";

const TYPE_LABELS = {
  FINANCEMENT: "Financement",
  SEMENCE: "Distribution de semences",
  EQUIPEMENT: "Matériel agricole",
  FORMATION: "Formation technique",
  SUBVENTION: "Subvention",
  IRRIGATION: "Irrigation",
};

const TYPE_ICONS = {
  FINANCEMENT: Coins,
  SEMENCE: Leaf,
  EQUIPEMENT: Wrench,
  FORMATION: GraduationCap,
  SUBVENTION: Receipt,
  IRRIGATION: Droplets,
};

const TYPE_COLORS = {
  FINANCEMENT: "bg-blue-100 text-blue-800",
  SEMENCE: "bg-green-100 text-green-800",
  EQUIPEMENT: "bg-orange-100 text-orange-800",
  FORMATION: "bg-purple-100 text-purple-800",
  SUBVENTION: "bg-yellow-100 text-yellow-800",
  IRRIGATION: "bg-cyan-100 text-cyan-800",
};

function StatCard({ label, value, valueClass = "" }) {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl flex flex-col gap-1">
      <span className="text-xs font-bold text-green-800 uppercase tracking-wider">
        {label}
      </span>
      <span
        className={`text-4xl font-black text-green-950 tracking-tight ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function ListeProgrammesAide() {
  const navigate = useNavigate();

  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterActif, setFilterActif] = useState("");

  // Récupération du rôle de l'utilisateur connecté, comme dans ListeAgriculteurs.jsx
  const [currentUser, setCurrentUser] = useState({ role: "" });

  useEffect(() => {
    const session = getSession();
    if (session) {
      setCurrentUser({ role: session.role || "" });
    }
  }, []);

  // Seuls l'admin national et le responsable régional gèrent les programmes.
  // L'agent de terrain et l'agriculteur n'ont accès qu'à la consultation.
  const isAdmin = currentUser.role === "ADMIN_NATIONAL";
  const isResponsable = currentUser.role === "RESPONSABLE_REGIONAL";
  const canModify = isAdmin || isResponsable;

  useEffect(() => {
    fetchProgrammes();
  }, []);

  const fetchProgrammes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8081/api/programmes");
      setProgrammes(res.data);
    } catch {
      toast.error("Impossible de charger les programmes");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActif = async (programme) => {
    if (!canModify) {
      toast.error(
        "Seuls l'administrateur national ou le responsable régional peuvent modifier un programme",
      );
      return;
    }
    try {
      await axios.patch(
        `http://localhost:8081/api/programmes/${programme.id}`,
        {
          actif: !programme.actif,
        },
      );
      toast.success(
        `Programme ${!programme.actif ? "activé" : "désactivé"} avec succès`,
      );
      setProgrammes((prev) =>
        prev.map((p) =>
          p.id === programme.id ? { ...p, actif: !p.actif } : p,
        ),
      );
    } catch {
      toast.error("Impossible de modifier le statut");
    }
  };

  const filtered = programmes.filter((p) => {
    const matchSearch =
      p.titre.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || p.typeAide === filterType;
    const matchActif = filterActif === "" || String(p.actif) === filterActif;
    return matchSearch && matchType && matchActif;
  });

  const budgetTotal = programmes.reduce((s, p) => s + (p.budget || 0), 0);
  const actifs = programmes.filter((p) => p.actif).length;

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("fr-FR") : "—");
  const formatBudget = (b) =>
    b ? Number(b).toLocaleString("fr-FR") + " Ar" : "—";

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex flex-col font-sans antialiased text-green-950">
        {/* NAVBAR */}
        <div className="flex flex-1 pt-16">
          <MyNavbar />

          {/* CONTENU PRINCIPAL */}
          <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-8 lg:ml-64">
            {/* Titre page */}
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-black text-green-900 tracking-tight">
                  Programmes d'aide
                </h1>
                <p className="text-green-800/80 text-sm font-medium mt-1">
                  Gestion des programmes nationaux de soutien agricole.
                </p>
              </div>
              {canModify && (
                <button
                  onClick={() => navigate("/programmes/ajouter")}
                  className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg transition"
                >
                  <Plus size={16} />
                  Nouveau programme
                </button>
              )}
            </div>

            {/* Stats KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard label="Total programmes" value={programmes.length} />
              <StatCard
                label="Actifs"
                value={actifs}
                valueClass="text-green-700"
              />
              <StatCard label="Inactifs" value={programmes.length - actifs} />
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl flex flex-col gap-1">
                <span className="text-xs font-bold text-green-800 uppercase tracking-wider">
                  Budget total
                </span>
                <span className="text-2xl font-black text-green-950 tracking-tight">
                  {budgetTotal.toLocaleString("fr-FR")}
                </span>
                <span className="text-xs text-amber-900 font-bold mt-1 bg-amber-400/30 px-2 py-0.5 rounded-md inline-block w-fit">
                  Ariary
                </span>
              </div>
            </div>

            {/* Filtres */}
            <div className="bg-white/50 backdrop-blur-md border border-white/40 rounded-2xl p-4 mb-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-white/70 border border-white/50 rounded-xl px-3 py-2">
                <Search size={16} className="text-green-700" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un programme..."
                  className="bg-transparent outline-none text-sm flex-1 text-green-900 placeholder:text-green-800/40"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white/70 border border-white/50 rounded-xl px-3 py-2 text-sm text-green-900 outline-none cursor-pointer min-w-[160px]"
              >
                <option value="">Tous les types</option>
                {Object.entries(TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={filterActif}
                onChange={(e) => setFilterActif(e.target.value)}
                className="bg-white/70 border border-white/50 rounded-xl px-3 py-2 text-sm text-green-900 outline-none cursor-pointer min-w-[140px]"
              >
                <option value="">Tous les statuts</option>
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </select>
            </div>

            {/* Liste */}
            {loading ? (
              <div className="min-h-[200px] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-700 mb-4"></div>
                <p className="text-lg font-semibold text-green-900 animate-pulse">
                  Chargement...
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-green-800/60 font-semibold">
                Aucun programme trouvé.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filtered.map((p) => {
                  const Icon = TYPE_ICONS[p.typeAide] || Sprout;
                  const typeColor =
                    TYPE_COLORS[p.typeAide] || "bg-gray-100 text-gray-700";
                  return (
                    <div
                      key={p.id}
                      className="bg-white/50 backdrop-blur-md border border-white/40 rounded-2xl p-5 shadow-xl"
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1">
                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${typeColor}`}
                            >
                              <Icon size={12} />
                              {TYPE_LABELS[p.typeAide] || p.typeAide}
                            </span>
                            <span
                              className={`text-xs font-semibold px-3 py-1 rounded-full ${p.actif ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}
                            >
                              {p.actif ? "Actif" : "Inactif"}
                            </span>
                          </div>

                          {/* Titre */}
                          <h2 className="text-base font-bold text-green-900 mb-1">
                            {p.titre}
                          </h2>

                          {/* Description */}
                          {p.description && (
                            <p className="text-sm text-green-800/70 mb-3 line-clamp-2">
                              {p.description}
                            </p>
                          )}

                          {/* Meta */}
                          <div className="flex flex-wrap gap-4 text-xs text-green-800/70 border-t border-white/50 pt-3">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(p.dateDebut)} →{" "}
                              {formatDate(p.dateFin)}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign size={12} />
                              {formatBudget(p.budget)}
                            </span>
                          </div>
                        </div>

                        {/* Actions — visibles uniquement pour admin/responsable régional */}
                        {canModify && (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() =>
                                navigate(`/programmes/modifier/${p.id}`)
                              }
                              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/50 bg-white/60 hover:bg-white/80 text-green-900 transition"
                            >
                              <Pencil size={13} /> Modifier
                            </button>
                            <button
                              onClick={() => handleToggleActif(p)}
                              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                                p.actif
                                  ? "border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100"
                                  : "border-green-400 bg-green-50 text-green-700 hover:bg-green-100"
                              }`}
                            >
                              <ToggleRight size={13} />
                              {p.actif ? "Désactiver" : "Activer"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
