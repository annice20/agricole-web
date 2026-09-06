import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tractor, Save, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

import {
  getEquipementById,
  updateEquipement,
} from "../services/equipementService";

import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

export default function ModifierEquipement() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);

  const [formData, setFormData] = useState({
    nom: "",
    categorie: "",
    quantiteDisponible: "",
    description: "",
    actif: true,
  });

  useEffect(() => {
    const chargerEquipement = async () => {
      try {
        const data = await getEquipementById(id);
        setFormData({
          nom: data.nom || "",
          categorie: data.categorie || "",
          quantiteDisponible: data.quantiteDisponible ?? "",
          description: data.description || "",
          actif: data.actif ?? true,
        });
      } catch (error) {
        console.error(error);
        toast.error("Impossible de charger l'équipement");
        navigate("/equipements");
      } finally {
        setLoading(false);
      }
    };

    chargerEquipement();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (enregistrement) return;
    setEnregistrement(true);

    try {
      await updateEquipement(id, {
        ...formData,
        quantiteDisponible: parseInt(formData.quantiteDisponible, 10),
      });
      toast.success("Équipement modifié avec succès");
      navigate("/equipements");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la modification de l'équipement",
      );
    } finally {
      setEnregistrement(false);
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

          <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-8 lg:ml-64 flex flex-col items-center">
            <div className="max-w-2xl w-full mb-6">
              <button
                onClick={() => navigate("/equipements")}
                className="flex items-center gap-2 text-green-800 hover:text-green-900 font-semibold text-sm mb-4 transition"
              >
                <ArrowLeft size={16} />
                Retour à la liste
              </button>

              <h1 className="text-3xl font-black text-green-900 tracking-tight flex items-center gap-2">
                <Tractor size={28} />
                Modifier l'équipement
              </h1>
              <p className="text-green-800/70 text-sm mt-1">
                Modifiez les informations de cet équipement agricole.
              </p>
            </div>

            <div className="max-w-2xl w-full bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-8 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-green-900 mb-1.5">
                    Nom de l'équipement
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    className="w-full border border-white/60 bg-white/70 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-green-900 mb-1.5">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    name="categorie"
                    value={formData.categorie}
                    onChange={handleChange}
                    required
                    className="w-full border border-white/60 bg-white/70 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-green-900 mb-1.5">
                    Quantité disponible
                  </label>
                  <input
                    type="number"
                    name="quantiteDisponible"
                    value={formData.quantiteDisponible}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full border border-white/60 bg-white/70 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-green-900 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-white/60 bg-white/70 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-700 outline-none resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 bg-green-50/70 border border-white/60 rounded-xl px-4 py-3">
                  <input
                    type="checkbox"
                    name="actif"
                    checked={formData.actif}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300 text-green-700 focus:ring-green-600 cursor-pointer"
                  />
                  <label className="text-sm font-semibold text-green-900 cursor-pointer">
                    Équipement actif
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={enregistrement}
                  className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-bold text-sm transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {enregistrement
                    ? "Enregistrement..."
                    : "Enregistrer les modifications"}
                </button>
              </form>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
