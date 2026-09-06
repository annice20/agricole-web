import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { demanderReinitialisation } from "../services/authService";

export default function MotDePasseOublie() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await demanderReinitialisation(email);
      setEnvoye(true);
      toast.success("Email envoyé si le compte existe");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300 p-4">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-green-600 p-4 rounded-full mb-4">
            <Mail className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            Mot de passe oublié
          </h1>
          <p className="text-gray-500 mt-2 text-center">
            {envoye
              ? "Vérifiez votre boîte mail pour le lien de réinitialisation."
              : "Entrez votre email pour recevoir un lien de réinitialisation"}
          </p>
        </div>

        {!envoye && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center focus:ring-2 focus:ring-green-500 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition duration-300 disabled:opacity-50"
            >
              {loading ? "Envoi en cours..." : "Envoyer le lien"}
            </button>
          </form>
        )}

        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center justify-center gap-2 text-green-700 hover:text-green-900 font-semibold mt-6 text-sm"
        >
          <ArrowLeft size={16} />
          Retour à la connexion
        </button>
      </div>
    </div>
  );
}
