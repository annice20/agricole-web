import { useEffect, useState } from "react";
import {
  DollarSign,
  Plus,
  Search,
  Pencil,
  Trash2,
  Building2,
  Calendar,
  Save,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  getAllFinancements,
  createFinancement,
  updateFinancement,
  deleteFinancement,
} from "../services/financementService";

import { getProgrammes } from "../services/programmeService";
import { getSession } from "../utils/auth";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

export default function FinancementsAgricoles() {
  const session = getSession();
  // Seul l'admin national peut créer/modifier/supprimer un financement.
  // Le responsable régional a un accès en lecture seule (consultation).
  const isAdmin = session?.role === "ADMIN_NATIONAL";

  const [financements, setFinancements] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    organisme: "",
    montant: "",
    dateFinancement: "",
    description: "",
    programmeId: "",
  });

  useEffect(() => {
    chargerFinancements();
    if (isAdmin) {
      chargerProgrammes();
    }
  }, []);

  const chargerFinancements = async () => {
    try {
      setLoading(true);
      const response = await getAllFinancements();
      setFinancements(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des financements");
    } finally {
      setLoading(false);
    }
  };

  const chargerProgrammes = async () => {
    try {
      const response = await getProgrammes();
      setProgrammes(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des programmes");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({
      organisme: "",
      montant: "",
      dateFinancement: "",
      description: "",
      programmeId: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        organisme: formData.organisme,
        montant: Number(formData.montant),
        dateFinancement: formData.dateFinancement,
        description: formData.description,
        programmeId: Number(formData.programmeId),
      };

      if (editId) {
        await updateFinancement(editId, payload);
        toast.success("Financement modifié avec succès");
      } else {
        await createFinancement(payload);
        toast.success("Financement ajouté avec succès");
      }

      resetForm();
      chargerFinancements();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (financement) => {
    setEditId(financement.id);
    setFormData({
      organisme: financement.organisme,
      montant: financement.montant,
      dateFinancement: financement.dateFinancement,
      description: financement.description,
      programmeId: financement.programmeId,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer ce financement ?",
    );
    if (!confirmation) return;

    try {
      await deleteFinancement(id);
      toast.success("Financement supprimé avec succès");
      chargerFinancements();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const financementsFiltres = financements.filter((financement) =>
    financement.organisme?.toLowerCase().includes(recherche.toLowerCase()),
  );

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex flex-col">
        <MyNavbar />

        <div className="flex flex-1 pt-16">
          <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 lg:ml-64">
            {/* HEADER */}
            <div className="mb-8">
              <h1 className="text-3xl font-black text-green-900 tracking-tight flex items-center gap-3">
                Gestion des Financements
              </h1>
              <p className="text-green-700 mt-1">
                {isAdmin
                  ? "Gérez les subventions et financements accordés aux programmes agricoles."
                  : "Consultation des subventions et financements accordés aux programmes agricoles."}
              </p>
            </div>

            {/* FORMULAIRE — réservé à l'admin national */}
            {isAdmin && (
              <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/40 p-6 mb-8">
                <h2 className="text-xl font-bold text-green-950 mb-6 flex items-center gap-2">
                  <div className="p-2 bg-green-700 text-white rounded-lg">
                    <DollarSign size={18} />
                  </div>
                  {editId
                    ? "Modifier un financement"
                    : "Ajouter un nouveau financement"}
                </h2>

                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-green-900 uppercase tracking-wider">
                      Organisme financeur
                    </label>
                    <input
                      type="text"
                      name="organisme"
                      value={formData.organisme}
                      onChange={handleChange}
                      required
                      placeholder="Ex: Banque Mondiale, FAO..."
                      className="w-full border border-green-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl p-3 text-green-900 font-medium transition"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-green-900 uppercase tracking-wider">
                      Montant (Ar)
                    </label>
                    <input
                      type="number"
                      name="montant"
                      value={formData.montant}
                      onChange={handleChange}
                      required
                      placeholder="Montant en Ariary"
                      className="w-full border border-green-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl p-3 text-green-900 font-medium transition"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-green-900 uppercase tracking-wider">
                      Date du financement
                    </label>
                    <input
                      type="date"
                      name="dateFinancement"
                      value={formData.dateFinancement}
                      onChange={handleChange}
                      required
                      className="w-full border border-green-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl p-3 text-green-900 font-medium transition"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-green-900 uppercase tracking-wider">
                      Programme concerné
                    </label>
                    <select
                      name="programmeId"
                      value={formData.programmeId}
                      onChange={handleChange}
                      required
                      className="w-full border border-green-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl p-3 text-green-900 font-medium transition"
                    >
                      <option value="">Sélectionner un programme</option>
                      {programmes.map((programme) => (
                        <option key={programme.id} value={programme.id}>
                          {programme.titre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-semibold text-green-900 uppercase tracking-wider">
                      Description
                    </label>
                    <textarea
                      rows="3"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Détails du financement..."
                      className="w-full border border-green-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl p-3 text-green-900 font-medium transition"
                    />
                  </div>

                  <div className="md:col-span-2 flex gap-3 mt-2">
                    <button
                      type="submit"
                      className="bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition shadow-md"
                    >
                      {editId ? <Save size={18} /> : <Plus size={18} />}
                      {editId ? "Mettre à jour" : "Ajouter le financement"}
                    </button>

                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-white/80 border border-green-200 hover:bg-green-50 text-green-900 font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition"
                    >
                      <X size={18} />
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* BARRE DE RECHERCHE */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/40 p-4 mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un organisme financeur..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="w-full border border-green-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl p-3 pl-10 text-green-900 transition"
                />
                <Search
                  className="absolute left-3 top-3.5 text-green-600/60"
                  size={18}
                />
              </div>
            </div>

            {/* TABLEAU */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-md border border-white/40 overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-green-800 font-medium animate-pulse">
                  Chargement des financements...
                </div>
              ) : financementsFiltres.length === 0 ? (
                <div className="p-12 text-center text-green-700 font-medium">
                  Aucun financement trouvé.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-green-800 text-white border-b border-green-900">
                        <th className="p-4 text-left font-semibold tracking-wide">
                          Organisme
                        </th>
                        <th className="p-4 text-left font-semibold tracking-wide">
                          Montant
                        </th>
                        <th className="p-4 text-left font-semibold tracking-wide">
                          Date
                        </th>
                        <th className="p-4 text-left font-semibold tracking-wide">
                          Programme
                        </th>
                        {isAdmin && (
                          <th className="p-4 text-center font-semibold tracking-wide w-28">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-100">
                      {financementsFiltres.map((financement) => (
                        <tr
                          key={financement.id}
                          className="hover:bg-white/40 transition-colors"
                        >
                          <td className="p-4 font-semibold text-green-950">
                            <div className="flex items-center gap-2">
                              <Building2 size={16} className="text-green-600" />
                              {financement.organisme}
                            </div>
                          </td>
                          <td className="p-4 text-green-950 font-bold whitespace-nowrap">
                            {Number(financement.montant).toLocaleString(
                              "fr-FR",
                            )}{" "}
                            Ar
                          </td>
                          <td className="p-4 text-green-900">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar size={14} className="text-green-600" />
                              {financement.dateFinancement}
                            </div>
                          </td>
                          <td className="p-4 text-green-900 font-medium">
                            {financement.programmeNom || "Non associé"}
                          </td>
                          {isAdmin && (
                            <td className="p-4 text-center">
                              <div className="flex justify-center gap-3">
                                <button
                                  onClick={() => handleEdit(financement)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="Modifier"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(financement.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Supprimer"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
