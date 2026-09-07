import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, ArrowLeft, Calendar, DollarSign } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { getSession } from "../utils/auth";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

export default function AjouterProgrammeAide() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // Stocke l'utilisateur connecté avec son rôle extrait de la session
  const [currentUser, setCurrentUser] = useState({
    nom: "Utilisateur",
    role: "",
  });

  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    typeAide: "",
    budget: "",
    dateDebut: "",
    dateFin: "",
    actif: false,
  });

  // Charger la session utilisateur
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
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.dateFin &&
      formData.dateDebut &&
      formData.dateFin < formData.dateDebut
    ) {
      toast.warning("La date de fin doit être postérieure à la date de début.");
      return;
    }

    try {
      setLoading(true);

      await axios.post("https://agricole-backend.onrender.com/api/programmes", {
        titre: formData.titre,
        description: formData.description,
        typeAide: formData.typeAide,
        budget: parseFloat(formData.budget),
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        actif: formData.actif,
      });

      toast.success("Programme créé avec succès");
      navigate("/programmes");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Impossible de créer le programme",
      );
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
            <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl shadow-xl w-full max-w-2xl p-6 sm:p-10 relative mt-4">
              {/* Bouton Retour */}
              <button
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 flex items-center gap-1 text-green-800 hover:text-green-950 font-bold text-sm transition"
              >
                <ArrowLeft size={16} />
                Retour
              </button>

              {/* Header Formulaire */}
              <div className="flex flex-col items-center mb-8 mt-4 sm:mt-0">
                <div className="bg-green-700 p-3 rounded-2xl shadow-md text-white mb-2">
                  <Sprout size={24} />
                </div>
                <h1 className="text-2xl font-black text-green-900 tracking-tight">
                  Nouveau Programme d'Aide
                </h1>
                <p className="text-xs text-green-700/80 font-medium mt-1 text-center max-w-md">
                  Création d'un programme national de soutien agricole.
                </p>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* TITRE */}
                <div>
                  <label className="block text-xs font-bold uppercase text-green-900 mb-2 tracking-wide">
                    Titre du programme
                  </label>
                  <input
                    type="text"
                    name="titre"
                    value={formData.titre}
                    onChange={handleChange}
                    required
                    className="w-full border border-green-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl px-4 py-3 text-sm text-green-900 font-medium transition"
                    placeholder="Ex : Soutien Riziculture 2026"
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="block text-xs font-bold uppercase text-green-900 mb-2 tracking-wide">
                    Description
                  </label>
                  <textarea
                    rows="4"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full border border-green-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl px-4 py-3 text-sm text-green-900 font-medium transition resize-none"
                    placeholder="Description détaillée des objectifs et critères d'éligibilité du programme..."
                  />
                </div>

                {/* TYPE D'AIDE */}
                <div>
                  <label className="block text-xs font-bold uppercase text-green-900 mb-2 tracking-wide">
                    Type d'aide
                  </label>
                  <select
                    name="typeAide"
                    value={formData.typeAide}
                    onChange={handleChange}
                    required
                    className="w-full border border-green-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl px-4 py-3 text-sm text-green-900 font-medium transition cursor-pointer"
                  >
                    <option value="">-- Sélectionner --</option>
                    <option value="FINANCEMENT">Financement</option>
                    <option value="SEMENCE">Distribution de Semences</option>
                    <option value="EQUIPEMENT">Matériel Agricole</option>
                    <option value="FORMATION">Formation Technique</option>
                    <option value="SUBVENTION">Subvention</option>
                    <option value="IRRIGATION">Irrigation</option>
                  </select>
                </div>

                {/* BUDGET ET DATES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-green-900 mb-2 tracking-wide flex items-center gap-1">
                      <DollarSign size={13} className="text-green-700" />
                      Budget (Ar)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      required
                      placeholder="0.00"
                      className="w-full border border-green-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl px-3 py-3 text-sm text-green-900 font-medium transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-green-900 mb-2 tracking-wide flex items-center gap-1">
                      <Calendar size={13} className="text-green-700" />
                      Début
                    </label>
                    <input
                      type="date"
                      name="dateDebut"
                      value={formData.dateDebut}
                      onChange={handleChange}
                      required
                      className="w-full border border-green-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl px-3 py-3 text-sm text-green-900 font-medium transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-green-900 mb-2 tracking-wide flex items-center gap-1">
                      <Calendar size={13} className="text-green-700" />
                      Fin
                    </label>
                    <input
                      type="date"
                      name="dateFin"
                      value={formData.dateFin}
                      onChange={handleChange}
                      required
                      className="w-full border border-green-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl px-3 py-3 text-sm text-green-900 font-medium transition"
                    />
                  </div>
                </div>

                {/* BOUTON SOUMISSION */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-bold transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>Création en cours...</span>
                    </>
                  ) : (
                    <span>Créer le Programme</span>
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
