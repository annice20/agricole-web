import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { toast } from "react-toastify";
import { reinitialiserMotDePasse } from "../services/authService";

export default function ReinitialiserMotDePasse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Lien invalide — aucun token trouvé.");
      return;
    }

    if (nouveauMotDePasse !== confirmation) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await reinitialiserMotDePasse(token, nouveauMotDePasse);
      toast.success("Mot de passe réinitialisé avec succès !");
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la réinitialisation",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300 p-4">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-green-600 p-4 rounded-full mb-4">
            <KeyRound className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            Nouveau mot de passe
          </h1>
          <p className="text-gray-500 mt-2 text-center">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={nouveauMotDePasse}
            onChange={(e) => setNouveauMotDePasse(e.target.value)}
            required
            minLength={6}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center focus:ring-2 focus:ring-green-500 outline-none"
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            required
            minLength={6}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center focus:ring-2 focus:ring-green-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition duration-300 disabled:opacity-50"
          >
            {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}
