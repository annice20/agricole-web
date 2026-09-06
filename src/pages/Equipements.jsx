import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Tractor,
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  getEquipements,
  deleteEquipement,
} from "../services/equipementService";

import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

export default function Equipements() {
  const [equipements, setEquipements] = useState([]);
  const [filteredEquipements, setFilteredEquipements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    chargerEquipements();
  }, []);

  useEffect(() => {
    const resultat = equipements.filter((equipement) => {
      const recherche = search.toLowerCase();

      return (
        equipement.nom?.toLowerCase().includes(recherche) ||
        equipement.categorie?.toLowerCase().includes(recherche)
      );
    });

    setFilteredEquipements(resultat);
  }, [search, equipements]);

  const chargerEquipements = async () => {
    try {
      const data = await getEquipements();

      const liste = Array.isArray(data) ? data : [];

      setEquipements(liste);
      setFilteredEquipements(liste);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Erreur lors du chargement des équipements",
      );
    } finally {
      setLoading(false);
    }
  };

  const supprimerEquipement = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer cet équipement ?",
    );

    if (!confirmation) return;

    try {
      await deleteEquipement(id);

      toast.success("Équipement supprimé avec succès");

      chargerEquipements();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Erreur lors de la suppression",
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-green-100 via-green-200 to-green-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-700"></div>
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
                <h1 className="text-3xl font-black text-green-900 tracking-tight flex items-center gap-2">
                  <Tractor size={28} className="text-green-800" />
                  Gestion des Équipements
                </h1>

                <p className="text-green-800/70 text-sm mt-1">
                  Gérez les équipements agricoles disponibles.
                </p>
              </div>

              <Link
                to="/equipements/ajouter"
                className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg transition"
              >
                <Plus size={16} />
                Ajouter
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <KpiCard
                title="Total équipements"
                value={equipements.length}
                icon={<Package size={32} />}
              />

              <KpiCard
                title="Actifs"
                value={equipements.filter((e) => e.actif === true).length}
                icon={<CheckCircle size={32} />}
              />

              <KpiCard
                title="Inactifs"
                value={equipements.filter((e) => !e.actif).length}
                icon={<XCircle size={32} />}
              />
            </div>

            <div className="bg-white/50 backdrop-blur-md rounded-2xl p-3 shadow-md border border-white/40 mb-6">
              <div className="relative">
                <Search
                  className="absolute left-3 top-2.5 text-green-800/60"
                  size={18}
                />

                <input
                  type="text"
                  placeholder="Rechercher un équipement..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/60 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 text-sm"
                />
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-700 text-white text-xs font-bold uppercase">
                      <th className="p-4 text-left">Nom</th>

                      <th className="p-4 text-left">Catégorie</th>

                      <th className="p-4 text-left">Quantité</th>

                      <th className="p-4 text-left">Statut</th>

                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEquipements.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-8 text-center text-green-800/50 font-semibold"
                        >
                          Aucun équipement trouvé
                        </td>
                      </tr>
                    ) : (
                      filteredEquipements.map((equipement) => (
                        <tr
                          key={equipement.id}
                          className="hover:bg-white/40 transition"
                        >
                          <td className="p-4 font-bold">{equipement.nom}</td>

                          <td className="p-4">{equipement.categorie}</td>

                          <td className="p-4">
                            {equipement.quantiteDisponible}
                          </td>

                          <td className="p-4">
                            {equipement.actif ? (
                              <span className="bg-green-200 text-green-900 px-3 py-1 rounded-full text-xs font-bold">
                                Actif
                              </span>
                            ) : (
                              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">
                                Inactif
                              </span>
                            )}
                          </td>

                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <Link
                                to={`/equipements/modifier/${equipement.id}`}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl"
                              >
                                <Pencil size={15} />
                              </Link>

                              <button
                                onClick={() =>
                                  supprimerEquipement(equipement.id)
                                }
                                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
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

function KpiCard({ title, value, icon }) {
  return (
    <div className="bg-white/50 backdrop-blur-md border border-white/40 rounded-2xl shadow-md p-5 flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-green-800/70 uppercase">{title}</p>

        <h2 className="text-3xl font-black text-green-950 mt-1">{value}</h2>
      </div>

      <div className="text-green-700">{icon}</div>
    </div>
  );
}
