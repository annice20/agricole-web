import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Leaf, X, Sprout } from "lucide-react";
import { toast } from "react-toastify";

import { login, saveSession } from "../services/authService";
import { getAgriculteurByUtilisateurId } from "../services/agriculteurService";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ anti double-soumission

  const [formData, setFormData] = useState({
    email: "",
    motDePasse: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return; // ✅ garde-fou : empêche un second clic pendant la requête
    setLoading(true);

    try {
      const response = await login(formData);

      const data = response.data;

      // Compte en attente de validation
      if (data.statusCompte === "EN_ATTENTE") {
        toast.info(data.message, {
          position: "top-center",
          autoClose: 7000,
        });

        return;
      }

      // Connexion avec OTP
      if (data.otpRequis || data.isOtpRequired) {
        navigate("/verification-otp", {
          state: {
            email: formData.email,
            rememberMe,
          },
        });

        return;
      }

      /*
        Connexion directe réussie (pas d'OTP requis)
        data.id correspond à utilisateurs.id
      */
      let sessionData = {
        token: data.token,
        role: data.role,
        id: data.id,
        nom: data.nom,
        prenom: data.prenom,
        regionId: data.regionId,
        regionNom: data.regionNom,
      };

      // ✅ On pose le token AVANT tout appel API protégé (évite le 403)
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      /*
        Cas AGRICULTEUR :
        récupération du vrai id dans la table agriculteurs
      */
      if (data.role === "AGRICULTEUR") {
        try {
          const responseAgriculteur = await getAgriculteurByUtilisateurId(
            data.id,
          );

          sessionData.agriculteurId = responseAgriculteur.data.id;
        } catch (error) {
          console.error("Erreur récupération agriculteur :", error);
          toast.error("Profil agriculteur introuvable");
          return;
        }
      }

      // Sauvegarde session complète
      saveSession(sessionData, rememberMe);

      toast.success("Connexion réussie");

      /*
        Redirection selon rôle
        (sans erreur ESLint switch/case)
      */
      if (
        data.role === "ADMIN_NATIONAL" ||
        data.role === "RESPONSABLE_REGIONAL"
      ) {
        navigate("/dashboard");
      } else if (data.role === "AGENT_TERRAIN") {
        navigate("/agriculteurs");
      } else if (data.role === "AGRICULTEUR") {
        navigate("/programmes");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur de connexion");
    } finally {
      setLoading(false); // ✅ réactive le bouton dans tous les cas
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300 p-4 font-sans antialiased">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-green-600 p-4 rounded-full mb-4 shadow-md">
            <Leaf className="text-white w-8 h-8" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Connexion
          </h1>

          <p className="text-gray-500 mt-2 font-medium">Plateforme Agricole</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="Votre email"
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="motDePasse"
                placeholder="Votre mot de passe"
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-green-500 outline-none transition disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                disabled={loading}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              Se souvenir de moi
            </label>

            <Link
              to="/mot-de-passe-oublie"
              className="text-green-700 text-sm font-medium hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6 font-medium">
          Pas encore de compte ?
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-green-700 font-bold ml-1 hover:underline focus:outline-none"
          >
            S'inscrire
          </button>
        </p>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-green-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-white/20 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-black text-green-900 mb-1">
              Créer un compte
            </h3>

            <p className="text-sm text-gray-500 mb-6 font-medium">
              L'inscription en ligne est réservée aux producteurs agricoles.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  navigate("/inscription");
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-green-100 hover:border-green-600 hover:bg-green-50/40 text-left transition group"
              >
                <div className="bg-green-100 p-3 rounded-xl text-green-700 group-hover:bg-green-700 group-hover:text-white transition shadow-sm">
                  <Sprout size={22} />
                </div>

                <div>
                  <p className="font-bold text-gray-900 text-sm sm:text-base">
                    Espace Agriculteur
                  </p>

                  <p className="text-xs text-gray-500 mt-0.5">
                    Demander des subventions et suivre mes réclamations.
                  </p>
                </div>
              </button>

              <p className="text-xs text-gray-400 text-center pt-2">
                Agent de terrain ou responsable régional ? Votre compte vous est
                créé par un administrateur.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
