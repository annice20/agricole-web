import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  DollarSign,
  Calendar,
  FileText,
  Upload,
  Sprout,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { getSession } from "../utils/auth";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

export default function AjouterDistribution() {
  const navigate = useNavigate();
  const location = useLocation();

  // Stocke l'utilisateur connecté avec son rôle extrait de la session
  const [currentUser, setCurrentUser] = useState({
    nom: "Utilisateur",
    role: "",
  });

  useEffect(() => {
    const session = getSession();
    if (session) {
      setCurrentUser({
        nom: session.nom || "Utilisateur",
        role: session.role || "",
      });
    }
  }, []);

  // Données passées depuis GestionDemandes
  const demandeId = location.state?.demandeId || null;
  const agriculteurNom = location.state?.agriculteurNom || "";
  const programmeTitre = location.state?.programmeTitre || "";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    montant: "",
    dateDistribution: "",
    description: "",
    preuveDistribution: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!demandeId) {
      toast.error("Aucune demande sélectionnée.");
      return;
    }

    try {
      setLoading(true);
      const session = getSession(); // Récupération de la session pour l'agentId
      await axios.post("http://localhost:8081/api/distributions", {
        demandeId: Number(demandeId),
        montant: Number(formData.montant),
        dateDistribution: formData.dateDistribution,
        description: formData.description,
        preuveDistribution: formData.preuveDistribution,
        agentId: session?.id ? Number(session.id) : null,
      });
      toast.success("Distribution enregistrée avec succès");
      navigate(-1);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Erreur lors de l'enregistrement",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex flex-col">
        {/* Barre de navigation haute */}
        <MyNavbar />

        {/* ZONE DE CONTENU GLOBAL HARMONISÉE */}
        <div className="flex flex-1 pt-16">
          <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 lg:ml-64 flex justify-center items-start">
            {/* CARTE DU FORMULAIRE */}
            <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl shadow-xl w-full max-w-2xl p-6 md:p-8 relative mt-4">
              {/* Bouton Retour */}
              <button
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 flex items-center gap-1 text-green-800 hover:text-green-950 font-bold text-sm transition"
              >
                <ArrowLeft size={16} />
                Retour
              </button>

              {/* Header Formulaire */}
              <div className="flex flex-col items-center mb-6 mt-4">
                <div className="bg-green-700 p-3 rounded-2xl shadow-md text-white mb-2">
                  <Sprout size={24} />
                </div>
                <h1 className="text-2xl font-black text-green-900 tracking-tight">
                  Distribution d'Aide
                </h1>
              </div>

              {/* Informations de la Demande */}
              <div className="bg-green-50/80 border border-green-200 rounded-xl px-4 py-3 mb-6 flex flex-col gap-1">
                <p className="text-xs font-bold uppercase text-green-800 tracking-wider">
                  Demande concernée
                </p>
                <p className="text-sm font-bold text-green-900">
                  Demande #{demandeId}
                </p>
                {agriculteurNom && (
                  <p className="text-xs text-green-700">
                    Agriculteur :{" "}
                    <span className="font-semibold">{agriculteurNom}</span>
                  </p>
                )}
                {programmeTitre && (
                  <p className="text-xs text-green-700">
                    Programme :{" "}
                    <span className="font-semibold">{programmeTitre}</span>
                  </p>
                )}
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Montant */}
                <div>
                  <label className="block text-xs font-bold uppercase text-green-900 mb-2 tracking-wide">
                    <DollarSign
                      size={13}
                      className="inline mr-1 text-green-700"
                    />
                    Montant Distribué (Ar)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="montant"
                    value={formData.montant}
                    onChange={handleChange}
                    required
                    placeholder="Ex: 500000"
                    className="w-full bg-white focus:outline-none focus:ring-2 focus:ring-green-500 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-900 font-medium transition"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold uppercase text-green-900 mb-2 tracking-wide">
                    <Calendar
                      size={13}
                      className="inline mr-1 text-green-700"
                    />
                    Date de Distribution
                  </label>
                  <input
                    type="date"
                    name="dateDistribution"
                    value={formData.dateDistribution}
                    onChange={handleChange}
                    required
                    className="w-full bg-white focus:outline-none focus:ring-2 focus:ring-green-500 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-900 font-medium transition"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase text-green-900 mb-2 tracking-wide">
                    <FileText
                      size={13}
                      className="inline mr-1 text-green-700"
                    />
                    Description
                  </label>
                  <textarea
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Détails sur la remise du matériel, des semences ou fonds..."
                    className="w-full bg-white focus:outline-none focus:ring-2 focus:ring-green-500 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-900 font-medium transition resize-none"
                  />
                </div>

                {/* Preuve */}
                <div>
                  <label className="block text-xs font-bold uppercase text-green-900 mb-2 tracking-wide">
                    <Upload size={13} className="inline mr-1 text-green-700" />
                    Preuve de Distribution
                  </label>
                  <input
                    type="text"
                    name="preuveDistribution"
                    value={formData.preuveDistribution}
                    onChange={handleChange}
                    placeholder="Référence ou URL du justificatif"
                    className="w-full bg-white focus:outline-none focus:ring-2 focus:ring-green-500 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-900 font-medium transition"
                  />
                </div>

                {/* Bouton de Validation */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-bold text-sm transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Package size={16} />
                      Valider la Distribution
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
