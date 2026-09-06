import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  ChevronDown,
  Globe,
} from "lucide-react";
import { toast } from "react-toastify";
import { creerUtilisateur } from "../services/utilisateurService";
import { getRegions } from "../services/locationService";
import { getSession } from "../utils/auth";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

const ROLES_AUTORISES = ["ADMIN_NATIONAL"];

const ROLES_DISPONIBLES = [
  { value: "ADMIN_NATIONAL", label: "Administrateur National" },
  { value: "RESPONSABLE_REGIONAL", label: "Responsable Régional" },
  { value: "AGENT_TERRAIN", label: "Agent de Terrain" },
];

const FORM_VIDE = {
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  motDePasse: "",
  roleName: "",
  regionId: "",
};

export default function CreerUtilisateur() {
  const navigate = useNavigate();
  const [verificationSession, setVerificationSession] = useState(true);
  const [form, setForm] = useState(FORM_VIDE);
  const [enregistrement, setEnregistrement] = useState(false);
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    const session = getSession();
    const role = session?.role;

    if (!session || !ROLES_AUTORISES.includes(role)) {
      toast.error("Accès réservé aux administrateurs nationaux.");
      navigate("/login");
      return;
    }
    setVerificationSession(false);
  }, [navigate]);

  // Chargement des régions (utile seulement si le rôle sélectionné est RESPONSABLE_REGIONAL)
  useEffect(() => {
    const chargerRegions = async () => {
      try {
        const response = await getRegions();
        setRegions(response.data);
      } catch {
        toast.error("Impossible de charger les régions");
      }
    };
    chargerRegions();
  }, []);

  // Version sûre : utilise la forme fonctionnelle pour éviter d'écraser
  // un changement précédent si handleChange est appelé plusieurs fois
  // de suite dans le même gestionnaire d'événement.
  const handleChange = (champ, valeur) => {
    setForm((prev) => ({ ...prev, [champ]: valeur }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.roleName) {
      toast.error("Veuillez sélectionner un rôle");
      return;
    }
    if (form.motDePasse.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    // Un responsable régional doit obligatoirement avoir une région
    if (form.roleName === "RESPONSABLE_REGIONAL" && !form.regionId) {
      toast.error("Veuillez sélectionner la région gérée");
      return;
    }

    setEnregistrement(true);
    try {
      // On n'envoie regionId que si pertinent, pour ne pas polluer le DTO backend
      const donneesAEnvoyer = {
        ...form,
        regionId:
          form.roleName === "RESPONSABLE_REGIONAL"
            ? parseInt(form.regionId, 10)
            : null,
      };

      const response = await creerUtilisateur(donneesAEnvoyer);
      toast.success(
        `Compte créé pour ${response.data.prenom} ${response.data.nom}`,
      );
      setForm(FORM_VIDE);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Impossible de créer le compte",
      );
    } finally {
      setEnregistrement(false);
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
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-green-200 flex flex-col font-sans antialiased text-green-950">
        <div className="flex flex-1 pt-16">
          <MyNavbar />

          <main className="flex-1 min-w-0 overflow-y-auto p-6 lg:p-12 lg:ml-64 flex flex-col items-center">
            <div className="max-w-2xl w-full mb-8 text-left">
              <h1 className="text-3xl font-black text-green-950 tracking-tight">
                Créer un Compte Utilisateur
              </h1>
              <p className="text-green-800/80 text-sm font-medium mt-1">
                Réservé aux comptes internes : administrateurs, responsables
                régionaux et agents de terrain.
              </p>
            </div>

            <div className="max-w-2xl w-full bg-white rounded-3xl border border-gray-100 p-8 shadow-2xl transition duration-300">
              <h2 className="text-xl font-bold text-green-950 flex items-center gap-2.5 mb-6 border-b border-gray-100 pb-4">
                <div className="bg-green-100 p-2 rounded-xl text-green-700">
                  <UserPlus size={20} />
                </div>
                Informations du nouveau compte
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-green-900 uppercase tracking-wider mb-1.5">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={form.nom}
                      onChange={(e) => handleChange("nom", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-green-950 font-medium focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-green-900 uppercase tracking-wider mb-1.5">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={form.prenom}
                      onChange={(e) => handleChange("prenom", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-green-950 font-medium focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-green-900 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-green-950 font-medium focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-green-900 uppercase tracking-wider mb-1.5">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      value={form.telephone}
                      onChange={(e) =>
                        handleChange("telephone", e.target.value)
                      }
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-green-950 font-medium focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-green-900 uppercase tracking-wider mb-1.5">
                    Mot de passe provisoire
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="password"
                      value={form.motDePasse}
                      onChange={(e) =>
                        handleChange("motDePasse", e.target.value)
                      }
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-green-950 font-medium focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-green-900 uppercase tracking-wider mb-1.5">
                    Rôle
                  </label>
                  <div className="relative">
                    <ShieldCheck
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <select
                      value={form.roleName}
                      onChange={(e) => {
                        const nouveauRole = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          roleName: nouveauRole,
                          regionId:
                            nouveauRole === "RESPONSABLE_REGIONAL"
                              ? prev.regionId
                              : "",
                        }));
                      }}
                      className="w-full pl-12 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 text-green-950 font-medium focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition appearance-none cursor-pointer"
                      required
                    >
                      <option value="">Sélectionner un rôle</option>
                      {ROLES_DISPONIBLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Champ région — visible uniquement pour RESPONSABLE_REGIONAL */}
                {form.roleName === "RESPONSABLE_REGIONAL" && (
                  <div>
                    <label className="block text-xs font-bold text-green-900 uppercase tracking-wider mb-1.5">
                      Région gérée
                    </label>
                    <div className="relative">
                      <Globe
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <select
                        value={form.regionId}
                        onChange={(e) =>
                          handleChange("regionId", e.target.value)
                        }
                        className="w-full pl-12 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 text-green-950 font-medium focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition appearance-none cursor-pointer"
                        required
                      >
                        <option value="">-- Sélectionner la région --</option>
                        {regions.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.nom}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={18}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={enregistrement}
                  className="w-full inline-flex items-center justify-center gap-2 mt-2 px-4 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <UserPlus size={18} />
                  {enregistrement ? "Création du compte..." : "Créer le compte"}
                </button>
              </form>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
