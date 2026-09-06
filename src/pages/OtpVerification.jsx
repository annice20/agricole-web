import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import axios from "axios";

import { verifyOtp, resendOtp } from "../services/authService";
import { saveSession } from "../utils/auth";
import { getAgriculteurByUtilisateurId } from "../services/agriculteurService";

export default function OtpVerification() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";
  const rememberMe = location.state?.rememberMe || false;

  const [codeOtp, setCodeOtp] = useState("");
  const [loading, setLoading] = useState(false); // anti double-soumission
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return; // empêche un second envoi pendant la requête
    setLoading(true);

    try {
      const response = await verifyOtp({ email, codeOtp });
      const data = response.data;
      const role = data.role;
      const token = data.token;

      /*
        Création de la session
        data.id = utilisateurs.id
      */
      let sessionData = {
        email,
        token,
        role,
        id: data.id,
        nom: data.nom,
        prenom: data.prenom,
        regionId: data.regionId,
        regionNom: data.regionNom,
      };

      /*
        ✅ CORRECTIF PRINCIPAL :
        On pose le token JWT AVANT tout appel API protégé.
        Avant, getAgriculteurByUtilisateurId() était appelé alors que
        localStorage ne contenait pas encore le token → l'intercepteur
        axios envoyait la requête sans Authorization → 403 côté backend.
      */
      if (token) {
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      /*
        Si AGRICULTEUR :
        récupérer le vrai id agriculteur (utilisateur.id !== agriculteur.id)
      */
      if (role === "AGRICULTEUR") {
        try {
          const responseAgriculteur = await getAgriculteurByUtilisateurId(
            data.id,
          );

          sessionData.agriculteurId = responseAgriculteur.data.id;
        } catch (error) {
          console.error("Erreur récupération agriculteur :", error);
          alert("Profil agriculteur introuvable");
          return;
        }
      }

      // Sauvegarde session complète (nom, prénom, rôle, agriculteurId...)
      saveSession(sessionData, rememberMe);

      /*
        Redirection selon rôle
      */
      if (role === "ADMIN_NATIONAL" || role === "RESPONSABLE_REGIONAL") {
        navigate("/dashboard");
      } else if (role === "AGENT_TERRAIN") {
        navigate("/agriculteurs");
      } else if (role === "AGRICULTEUR") {
        navigate("/programmes");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "OTP incorrect");
    } finally {
      setLoading(false); // ✅ réactive le formulaire dans tous les cas
    }
  };

  const handleResendOtp = async () => {
    if (resending) return;

    setResending(true);
    setMessage("");

    try {
      await resendOtp(email);

      setMessage("Un nouveau code OTP vient d'être envoyé sur votre email.");
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message || "Impossible de renvoyer le code OTP",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300 p-4">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-green-600 p-4 rounded-full mb-4">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800">Vérification OTP</h1>

          <p className="text-gray-500 mt-2 text-center">
            Entrez le code reçu par email
          </p>

          {/*
            ⚠️ Rappel : si vous recevez deux emails OTP suite à un double envoi,
            seul le code du DERNIER email reçu est valide (le précédent est
            écrasé en base à chaque nouvelle demande de connexion).
          */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Code OTP"
            value={codeOtp}
            onChange={(e) => setCodeOtp(e.target.value)}
            required
            disabled={loading}
            maxLength={6}
            inputMode="numeric"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center tracking-[10px] text-xl focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Vérification..." : "Vérifier"}
          </button>

          <div className="text-center mt-5">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              className="text-green-600 hover:text-green-700 font-semibold disabled:opacity-50"
            >
              {resending ? "Envoi en cours..." : "Renvoyer le code OTP"}
            </button>
          </div>

          {message && (
            <p className="text-center text-sm text-gray-600 mt-3">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
