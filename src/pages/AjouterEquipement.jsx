import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tractor, Save, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { ajouterEquipement } from "../services/equipementService";
import { getSession } from "../utils/auth";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

export default function AjouterEquipement() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // Stocke l'utilisateur connecté avec son rôle extrait de la session
  const [currentUser, setCurrentUser] = useState({
    nom: "Utilisateur",
    role: "",
  });

  const [formData, setFormData] = useState({
    nom: "",
    categorie: "",
    quantiteDisponible: "",
    description: "",
    actif: true,
  });

  // Récupération de la session utilisateur
  useEffect(() => {
    const session = getSession();
    if (session) {
      setCurrentUser({
        nom: session.nom || "Utilisateur",
        role: session.role || "",
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await ajouterEquipement({
        ...formData,
        quantiteDisponible: Number(formData.quantiteDisponible),
      });

      toast.success("Équipement ajouté avec succès");
      navigate("/equipements");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex flex-col font-sans antialiased text-green-950">
        {/* Barre de navigation haute et Sidebar intégrées */}
        <MyNavbar />

        {/* ZONE DE CONTENU GLOBAL HARMONISÉE */}
        <div className="flex flex-1 pt-16">
          <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 lg:ml-64 flex justify-center items-start">
            {/* CARTE DU FORMULAIRE EN GLASSMORPHISM */}
            <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl w-full max-w-2xl p-6 sm:p-10 relative mt-4">
              {/* Bouton Retour */}
              <button
                onClick={() => navigate("/equipements")}
                className="absolute top-6 left-6 text-green-800 hover:text-green-950 flex items-center gap-1 text-sm font-bold transition"
              >
                <ArrowLeft size={16} /> Retour
              </button>

              {/* Header Formulaire */}
              <div className="flex flex-col items-center mb-8 mt-4 sm:mt-0">
                <div className="bg-green-700 p-3 rounded-2xl shadow-md text-white mb-2">
                  <Tractor size={24} />
                </div>
                <h1 className="text-2xl font-black text-green-900 tracking-tight">
                  Ajouter un équipement
                </h1>
                <p className="text-xs text-green-700/80 font-medium mt-1 text-center max-w-md">
                  Enregistrez un nouvel équipement agricole dans le système de
                  gestion.
                </p>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* NOM */}
                <div>
                  <label className="block text-xs font-bold uppercase text-green-900 mb-2 tracking-wide">
                    Nom de l'équipement
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    className="w-full border border-green-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl px-4 py-3 text-sm text-green-900 font-medium transition"
                    placeholder="Ex : Tracteur, Motopompe..."
                  />
                </div>

                {/* CATEGORIE */}
                <div>
                  <label className="block text-xs font-bold uppercase text-green-900 mb-2 tracking-wide">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    name="categorie"
                    value={formData.categorie}
                    onChange={handleChange}
                    required
                    className="w-full border border-green-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl px-4 py-3 text-sm text-green-900 font-medium transition"
                    placeholder="Ex : Mécanisation, Irrigation..."
                  />
                </div>

                {/* QUANTITE */}
                <div>
                  <label className="block text-xs font-bold uppercase text-green-900 mb-2 tracking-wide">
                    Quantité disponible
                  </label>
                  <input
                    type="number"
                    name="quantiteDisponible"
                    value={formData.quantiteDisponible}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full border border-green-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl px-4 py-3 text-sm text-green-900 font-medium transition"
                    placeholder="0"
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="block text-xs font-bold uppercase text-green-900 mb-2 tracking-wide">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border border-green-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl px-4 py-3 text-sm text-green-900 font-medium transition resize-none"
                    placeholder="Description détaillée des spécificités techniques de l'équipement..."
                  />
                </div>

                {/* ACTIF */}
                <div className="flex items-center gap-2.5 py-1">
                  <input
                    type="checkbox"
                    name="actif"
                    id="actif"
                    checked={formData.actif}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-700 focus:ring-green-500 border-green-300 rounded cursor-pointer transition"
                  />
                  <label
                    htmlFor="actif"
                    className="text-sm font-bold text-green-900 cursor-pointer select-none"
                  >
                    Équipement disponible et actif immédiatement
                  </label>
                </div>

                {/* BOUTON SOUMISSION */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-bold transition text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Enregistrer l'équipement</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
