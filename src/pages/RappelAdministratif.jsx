import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BellRing, Send, ArrowLeft, Bell } from "lucide-react";
import { toast } from "react-toastify";
import { créerNotification } from "../services/notificationService";
import { getSession } from "../utils/auth";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

const ROLES_AUTORISES = ["RESPONSABLE_REGIONAL", "ADMIN_NATIONAL"];

export default function RappelAdministratif() {
  const navigate = useNavigate();

  const [verificationSession, setVerificationSession] = useState(true);
  const [session, setSession] = useState(null);

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [dateEcheance, setDateEcheance] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s || !ROLES_AUTORISES.includes(s.role)) {
      toast.error(
        "Accès réservé aux responsables régionaux et administrateurs.",
      );
      navigate("/dashboard");
      return;
    }
    setSession(s);
    setVerificationSession(false);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titre.trim()) {
      toast.error("Veuillez indiquer un objet pour ce rappel");
      return;
    }

    setLoading(true);
    try {
      const echeanceTexte = dateEcheance
        ? ` — échéance : ${new Date(dateEcheance).toLocaleDateString("fr-FR")}`
        : "";
      const messageFinal = `[Rappel] ${titre}${description ? " : " + description : ""}${echeanceTexte}`;

      await créerNotification(session.id, messageFinal);
      toast.success("Rappel configuré avec succès");
      setTitre("");
      setDescription("");
      setDateEcheance("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la création du rappel",
      );
    } finally {
      setLoading(false);
    }
  };

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
        <MyNavbar />

        <div className="flex flex-1 pt-16">
          <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 lg:ml-64 flex justify-center items-start">
            <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl w-full max-w-2xl p-6 sm:p-10 relative mt-4">
              <button
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 text-green-800 hover:text-green-950 flex items-center gap-1 text-sm font-bold transition"
              >
                <ArrowLeft size={16} />
                Retour
              </button>

              <div className="flex flex-col items-center mb-8 mt-4 sm:mt-0">
                <div className="bg-green-700 p-3 rounded-2xl shadow-md text-white mb-2">
                  <BellRing size={24} />
                </div>
                <h1 className="text-2xl font-black text-green-900 tracking-tight">
                  Configurer un rappel administratif
                </h1>
                <p className="text-xs text-green-700/80 font-medium mt-1 text-center max-w-md">
                  Créez un pense-bête pour vous-même concernant une tâche
                  administrative à ne pas oublier (relance, suivi de dossier,
                  distribution en attente...).
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-green-900 mb-2 tracking-wide">
                    Objet du rappel
                  </label>
                  <input
                    type="text"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    required
                    className="w-full border border-green-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl px-4 py-3 text-sm text-green-900 font-medium transition"
                    placeholder="Ex : Relancer la distribution du programme Semences 2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-green-900 mb-2 tracking-wide">
                    Détails (optionnel)
                  </label>
                  <textarea
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-green-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl px-4 py-3 text-sm text-green-900 font-medium transition resize-none"
                    placeholder="Précisez le contexte, le dossier ou l'agriculteur concerné..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-green-900 mb-2 tracking-wide">
                    Date d'échéance (optionnel)
                  </label>
                  <input
                    type="date"
                    value={dateEcheance}
                    onChange={(e) => setDateEcheance(e.target.value)}
                    className="w-full border border-green-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl px-4 py-3 text-sm text-green-900 font-medium transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-bold transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Configurer le rappel</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/notifications")}
                  className="w-full flex items-center justify-center gap-2 text-green-800 hover:text-green-950 font-semibold text-sm transition py-2"
                >
                  <Bell size={14} />
                  Voir mes rappels dans Notifications
                </button>
              </form>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
