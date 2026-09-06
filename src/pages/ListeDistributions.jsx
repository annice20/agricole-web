import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Trash2,
  Package,
  DollarSign,
  Calendar,
  Users,
  Eye,
  X,
  FileText,
  MapPin,
  ClipboardList,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getDistributions,
  getDistributionsParRegion,
  deleteDistribution,
} from "../services/distributionService";
import { getSession } from "../utils/auth";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

const str = (val) =>
  val === null || val === undefined || val === "" ? "—" : val;

function StatCard({ label, value, suffix = "" }) {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
      <span className="text-xs font-bold text-green-800 uppercase tracking-wider">
        {label}
      </span>
      <div className="text-3xl font-black text-green-950 mt-1 tracking-tight">
        {value}
        {suffix && (
          <span className="text-xs font-bold text-amber-800 bg-amber-400/30 px-1.5 py-0.5 rounded ml-2 align-middle">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/40 last:border-b-0">
      <div className="mt-0.5 text-green-700">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-green-800/70 uppercase tracking-wider">
          {label}
        </div>
        <div className="text-sm font-semibold text-green-950 break-words">
          {value}
        </div>
      </div>
    </div>
  );
}

function DistributionDetailModal({ distribution, onClose }) {
  if (!distribution) return null;
  const d = distribution;
  const a = d.demandeAide?.agriculteur;
  const programme = d.demandeAide?.programme;

  const agriculteurNomComplet = a
    ? `${str(a.prenom)} ${str(a.nom)}`.trim()
    : "—";

  const formatDate = (val) =>
    val
      ? new Date(val).toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-green-950/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/50 sticky top-0 bg-white/70 backdrop-blur-xl rounded-t-2xl">
          <h2 className="text-lg font-black text-green-900 tracking-tight">
            Détails de la distribution
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-green-900/10 text-green-800 transition"
            title="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <DetailRow
            icon={<Users size={16} />}
            label="Agriculteur bénéficiaire"
            value={agriculteurNomComplet}
          />
          {a?.telephone && (
            <DetailRow
              icon={<ClipboardList size={16} />}
              label="Téléphone"
              value={str(a.telephone)}
            />
          )}
          {a?.region && (
            <DetailRow
              icon={<MapPin size={16} />}
              label="Région"
              value={str(a.region)}
            />
          )}
          <DetailRow
            icon={<Package size={16} />}
            label="Programme d'aide"
            value={programme?.titre || "—"}
          />
          <DetailRow
            icon={<DollarSign size={16} />}
            label="Montant distribué"
            value={
              <>
                {Number(d.montant || 0).toLocaleString("fr-FR")}{" "}
                <span className="text-xs text-green-700">Ar</span>
              </>
            }
          />
          <DetailRow
            icon={<Calendar size={16} />}
            label="Date de distribution"
            value={formatDate(d.dateDistribution)}
          />
          {d.description && (
            <DetailRow
              icon={<FileText size={16} />}
              label="Description"
              value={d.description}
            />
          )}

          <DetailRow
            icon={<FileText size={16} />}
            label="Référence / preuve de distribution"
            value={d.preuveDistribution || "Aucune référence fournie"}
          />
        </div>

        <div className="p-5 border-t border-white/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold rounded-lg bg-green-800 text-white hover:bg-green-900 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ListeDistributions() {
  const navigate = useNavigate();

  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedDistribution, setSelectedDistribution] = useState(null);

  const [currentUser, setCurrentUser] = useState({ role: "" });
  const [session, setSession] = useState(null);

  useEffect(() => {
    const s = getSession();
    if (s) {
      setSession(s);
      setCurrentUser({ role: s.role || "" });
    } else {
      navigate("/");
    }
  }, [navigate]);

  const fetchDistributions = async () => {
    try {
      setLoading(true);

      // Vue régionale : le responsable régional ne voit que sa région
      if (session?.role === "RESPONSABLE_REGIONAL" && session?.regionId) {
        const data = await getDistributionsParRegion(session.regionId);
        setDistributions(data);
        return;
      }

      const res = await getDistributions();
      setDistributions(res.data);
    } catch {
      toast.error("Impossible de charger les distributions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchDistributions();
    }
  }, [session]);

  const isAdmin = currentUser.role === "ADMIN_NATIONAL";
  const isResponsableRegional = currentUser.role === "RESPONSABLE_REGIONAL";

  const agriculteurNom = (d) => {
    const a = d.demandeAide?.agriculteur;
    if (!a) return "—";
    return `${str(a.prenom)} ${str(a.nom)}`.trim();
  };
  const programmeTitre = (d) => d.demandeAide?.programme?.titre || "—";

  const handleDelete = async (id) => {
    if (!isAdmin) {
      toast.error("Suppression réservée à l'administrateur national");
      return;
    }
    try {
      await deleteDistribution(id);
      toast.success("Distribution supprimée");
      setDistributions((prev) => prev.filter((d) => d.id !== id));
      setConfirmDelete(null);
    } catch {
      toast.error("Impossible de supprimer cette distribution");
    }
  };

  const filtered = distributions.filter((d) => {
    const q = search.toLowerCase();
    return (
      agriculteurNom(d).toLowerCase().includes(q) ||
      programmeTitre(d).toLowerCase().includes(q) ||
      (d.description || "").toLowerCase().includes(q)
    );
  });

  const montantTotal = distributions.reduce(
    (s, d) => s + Number(d.montant || 0),
    0,
  );

  const debutMois = new Date();
  debutMois.setDate(1);
  debutMois.setHours(0, 0, 0, 0);
  const distributionsCeMois = distributions.filter(
    (d) => d.dateDistribution && new Date(d.dateDistribution) >= debutMois,
  ).length;

  const agriculteursUniques = new Set(
    distributions.map((d) => d.demandeAide?.agriculteur?.id).filter(Boolean),
  ).size;

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex flex-col font-sans antialiased text-green-950">
        <div className="flex flex-1 pt-16">
          <MyNavbar />

          <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-8 lg:ml-64">
            <div className="mb-6">
              <h1 className="text-3xl font-black text-green-900 tracking-tight">
                Suivi des distributions
              </h1>
              <p className="text-green-800/70 text-sm mt-1">
                {isResponsableRegional
                  ? `Historique des aides distribuées dans votre région${session?.regionNom ? ` (${session.regionNom})` : ""}.`
                  : "Historique complet des aides effectivement distribuées aux agriculteurs."}
              </p>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                label="Total distributions"
                value={distributions.length}
              />
              <StatCard
                label="Montant total distribué"
                value={montantTotal.toLocaleString("fr-FR")}
                suffix="Ar"
              />
              <StatCard
                label="Distributions ce mois"
                value={distributionsCeMois}
              />
              <StatCard
                label="Agriculteurs bénéficiaires"
                value={agriculteursUniques}
              />
            </div>

            {/* Recherche */}
            <div className="bg-white/50 backdrop-blur-md border border-white/40 rounded-2xl p-4 mb-6 flex items-center gap-2">
              <Search size={16} className="text-green-700" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par agriculteur, programme ou description..."
                className="bg-transparent outline-none text-sm flex-1 text-green-900 placeholder:text-green-800/40"
              />
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
                Aucune distribution trouvée.
              </div>
            ) : (
              <div className="bg-white/50 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-green-900/10 border-b border-white/50 text-green-950 text-xs font-bold uppercase tracking-wider">
                        <th className="py-4 px-5">
                          <Users size={13} className="inline mr-1" />
                          Agriculteur
                        </th>
                        <th className="py-4 px-5">
                          <Package size={13} className="inline mr-1" />
                          Programme
                        </th>
                        <th className="py-4 px-5">
                          <DollarSign size={13} className="inline mr-1" />
                          Montant
                        </th>
                        <th className="py-4 px-5">
                          <Calendar size={13} className="inline mr-1" />
                          Date
                        </th>
                        <th className="py-4 px-5">Preuve</th>
                        <th className="py-4 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/40">
                      {filtered.map((d) => (
                        <tr
                          key={d.id}
                          className="hover:bg-white/40 transition-colors"
                        >
                          <td className="py-4 px-5 font-bold text-green-900">
                            {agriculteurNom(d)}
                          </td>
                          <td className="py-4 px-5">
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800">
                              {programmeTitre(d)}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-semibold text-green-900">
                            {Number(d.montant || 0).toLocaleString("fr-FR")}{" "}
                            <span className="text-xs text-green-700">Ar</span>
                          </td>
                          <td className="py-4 px-5 text-green-800/80">
                            {formatDate(d.dateDistribution)}
                          </td>
                          <td className="py-4 px-5">
                            {d.preuveDistribution ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-900 bg-green-100 px-2.5 py-1 rounded-full">
                                <FileText size={12} />
                                {d.preuveDistribution}
                              </span>
                            ) : (
                              <span className="text-xs text-green-800/40">
                                —
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setSelectedDistribution(d)}
                                className="p-2 text-green-700 hover:bg-green-100/60 rounded-lg transition"
                                title="Voir les détails"
                              >
                                <Eye size={16} />
                              </button>

                              {isAdmin &&
                                (confirmDelete === d.id ? (
                                  <div className="flex items-center gap-1 bg-red-100 p-1 rounded-lg border border-red-200 w-fit">
                                    <button
                                      onClick={() => handleDelete(d.id)}
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
                                    onClick={() => setConfirmDelete(d.id)}
                                    className="p-2 text-red-600 hover:bg-red-100/50 rounded-lg transition"
                                    title="Supprimer définitivement"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                ))}
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

        <DistributionDetailModal
          distribution={selectedDistribution}
          onClose={() => setSelectedDistribution(null)}
        />
      </div>
    </ThemeProvider>
  );
}
