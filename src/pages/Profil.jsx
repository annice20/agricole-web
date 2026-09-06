import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, ShieldCheck, Lock, Save } from "lucide-react";
import { toast } from "react-toastify";
import {
  getProfil,
  modifierProfil,
  changerMotDePasse,
} from "../services/profilService";
import { getSession, updateSessionUser } from "../utils/auth";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

export default function Profil() {
  const navigate = useNavigate();
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [changementMdp, setChangementMdp] = useState(false);

  const [formInfos, setFormInfos] = useState({
    nom: "",
    prenom: "",
    telephone: "",
  });
  const [formMdp, setFormMdp] = useState({
    ancienMotDePasse: "",
    nouveauMotDePasse: "",
    confirmationMotDePasse: "",
  });

  useEffect(() => {
    const session = getSession();
    if (!session?.id) {
      navigate("/");
      return;
    }
    chargerProfil(session.id);
  }, []);

  const chargerProfil = async (id) => {
    try {
      const response = await getProfil(id);
      setProfil(response.data);
      setFormInfos({
        nom: response.data.nom || "",
        prenom: response.data.prenom || "",
        telephone: response.data.telephone || "",
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Impossible de charger le profil",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEnregistrerInfos = async (e) => {
    e.preventDefault();
    setEnregistrement(true);
    try {
      const response = await modifierProfil(profil.id, formInfos);
      setProfil(response.data);
      updateSessionUser({
        nom: response.data.nom,
        prenom: response.data.prenom,
      });
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Impossible de mettre à jour le profil",
      );
    } finally {
      setEnregistrement(false);
    }
  };

  const handleChangerMotDePasse = async (e) => {
    e.preventDefault();

    if (formMdp.nouveauMotDePasse !== formMdp.confirmationMotDePasse) {
      toast.error("Les deux mots de passe ne correspondent pas");
      return;
    }
    if (formMdp.nouveauMotDePasse.length < 6) {
      toast.error(
        "Le nouveau mot de passe doit contenir au moins 6 caractères",
      );
      return;
    }

    setChangementMdp(true);
    try {
      await changerMotDePasse(profil.id, {
        ancienMotDePasse: formMdp.ancienMotDePasse,
        nouveauMotDePasse: formMdp.nouveauMotDePasse,
      });
      toast.success("Mot de passe modifié avec succès");
      setFormMdp({
        ancienMotDePasse: "",
        nouveauMotDePasse: "",
        confirmationMotDePasse: "",
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Impossible de modifier le mot de passe",
      );
    } finally {
      setChangementMdp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
        <div className="bg-white/40 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-10 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-700 mb-4"></div>
          <p className="text-lg font-semibold text-green-900 animate-pulse">
            Chargement du profil...
          </p>
        </div>
      </div>
    );
  }

  if (!profil) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
        <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-3xl shadow-2xl p-8 text-center max-w-sm">
          <p className="text-red-800 font-bold text-lg mb-4">
            Échec de synchronisation
          </p>
          <p className="text-green-900 text-sm mb-6">
            Impossible de charger les informations du profil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex flex-col font-sans antialiased text-green-950">
        <div className="flex flex-1 pt-16">
          <MyNavbar />

          <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-8 lg:ml-64">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-green-900 tracking-tight">
                Mon Profil
              </h1>
              <p className="text-green-800/80 text-sm font-medium mt-1">
                Gérez vos informations personnelles et votre sécurité.
              </p>
            </div>

            {/* En-tête identité */}
            <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl mb-6 flex items-center gap-5">
              <div className="h-16 w-16 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-xl shadow-md uppercase flex-shrink-0">
                {profil.nom.substring(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-xl font-black text-green-950 tracking-tight">
                  {profil.prenom} {profil.nom}
                </p>
                <p className="text-sm text-green-800/80 font-medium flex items-center gap-1.5 mt-1">
                  <Mail size={14} />
                  {profil.email}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profil.roles.map((role, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-700 text-white rounded-lg text-xs font-bold shadow-md"
                    >
                      <ShieldCheck size={12} />
                      {role.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations personnelles */}
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
                <h2 className="text-lg font-extrabold text-green-900 flex items-center gap-2 mb-6">
                  <User size={20} />
                  Informations personnelles
                </h2>
                <form onSubmit={handleEnregistrerInfos} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-green-800 uppercase tracking-wider mb-1.5">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={formInfos.nom}
                      onChange={(e) =>
                        setFormInfos({ ...formInfos, nom: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/40 text-green-950 font-medium focus:outline-none focus:ring-2 focus:ring-green-600 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-green-800 uppercase tracking-wider mb-1.5">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={formInfos.prenom}
                      onChange={(e) =>
                        setFormInfos({ ...formInfos, prenom: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/40 text-green-950 font-medium focus:outline-none focus:ring-2 focus:ring-green-600 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-green-800 uppercase tracking-wider mb-1.5">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formInfos.telephone}
                      onChange={(e) =>
                        setFormInfos({
                          ...formInfos,
                          telephone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/40 text-green-950 font-medium focus:outline-none focus:ring-2 focus:ring-green-600 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-green-800 uppercase tracking-wider mb-1.5">
                      Email (non modifiable)
                    </label>
                    <input
                      type="email"
                      value={profil.email}
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl bg-green-900/5 border border-white/30 text-green-800/60 font-medium cursor-not-allowed"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={enregistrement}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 transition shadow-md disabled:opacity-60"
                  >
                    <Save size={16} />
                    {enregistrement
                      ? "Enregistrement..."
                      : "Enregistrer les modifications"}
                  </button>
                </form>
              </div>

              {/* Sécurité */}
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
                <h2 className="text-lg font-extrabold text-green-900 flex items-center gap-2 mb-6">
                  <Lock size={20} />
                  Sécurité — Changer le mot de passe
                </h2>
                <form onSubmit={handleChangerMotDePasse} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-green-800 uppercase tracking-wider mb-1.5">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      value={formMdp.ancienMotDePasse}
                      onChange={(e) =>
                        setFormMdp({
                          ...formMdp,
                          ancienMotDePasse: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/40 text-green-950 font-medium focus:outline-none focus:ring-2 focus:ring-green-600 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-green-800 uppercase tracking-wider mb-1.5">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={formMdp.nouveauMotDePasse}
                      onChange={(e) =>
                        setFormMdp({
                          ...formMdp,
                          nouveauMotDePasse: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/40 text-green-950 font-medium focus:outline-none focus:ring-2 focus:ring-green-600 transition"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-green-800 uppercase tracking-wider mb-1.5">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={formMdp.confirmationMotDePasse}
                      onChange={(e) =>
                        setFormMdp({
                          ...formMdp,
                          confirmationMotDePasse: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/40 text-green-950 font-medium focus:outline-none focus:ring-2 focus:ring-green-600 transition"
                      required
                      minLength={6}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={changementMdp}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-900 text-white rounded-xl text-sm font-bold hover:bg-green-950 transition shadow-md disabled:opacity-60"
                  >
                    <Lock size={16} />
                    {changementMdp
                      ? "Modification..."
                      : "Modifier le mot de passe"}
                  </button>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
