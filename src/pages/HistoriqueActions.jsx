import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  History,
  Search,
  RefreshCcw,
  User,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";

import MyNavbar from "./MyNavbar";
import { getHistoriqueActions } from "../services/historiqueService";
import { getSession } from "../utils/auth";
import { ThemeProvider } from "../context/ThemeContext";

const ROLES_AUTORISES = ["ADMIN_NATIONAL"];

export default function HistoriqueActions() {
  const navigate = useNavigate();
  const [historique, setHistorique] = useState([]);
  const [historiqueFiltre, setHistoriqueFiltre] = useState([]);

  const [recherche, setRecherche] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    const role = session?.role;

    if (!session || !ROLES_AUTORISES.includes(role)) {
      toast.error("Accès réservé aux administrateurs nationaux.");
      navigate("/dashboard");
      return;
    }

    chargerHistorique();
  }, []);

  const chargerHistorique = async () => {
    try {
      setLoading(true);

      const response = await getHistoriqueActions();

      setHistorique(response.data || []);
      setHistoriqueFiltre(response.data || []);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Impossible de charger l'historique",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const resultat = historique.filter((item) => {
      const texte = `

        ${item.utilisateur || ""}
        ${item.role || ""}
        ${item.action || ""}
        ${item.module || ""}
        ${item.description || ""}

      `.toLowerCase();

      return texte.includes(recherche.toLowerCase());
    });

    setHistoriqueFiltre(resultat);
  }, [recherche, historique]);

  return (
    <ThemeProvider>
      <div
        className="
      min-h-screen
      bg-gradient-to-br
      from-green-100
      via-green-200
      to-green-300
      text-green-950
      "
      >
        <div className="flex pt-16">
          <MyNavbar />

          <main
            className="
          flex-1
          p-4
          lg:p-8
          lg:ml-64
          "
          >
            <div className="mb-8">
              <h1
                className="
              text-3xl
              font-black
              text-green-900
              flex
              items-center
              gap-3
              "
              >
                <History size={32} />
                Historique des actions
              </h1>

              <p
                className="
              text-green-800
              mt-2
              "
              >
                Traçabilité des opérations réalisées sur la plateforme.
              </p>
            </div>

            <div
              className="
            bg-white/50
            backdrop-blur-md
            rounded-2xl
            shadow-xl
            border
            border-white/40
            p-6
            mb-6
            "
            >
              <div
                className="
              flex
              flex-col
              md:flex-row
              gap-4
              "
              >
                <div className="relative flex-1">
                  <Search
                    size={20}
                    className="
                  absolute
                  left-3
                  top-3
                  text-green-700
                  "
                  />

                  <input
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                    placeholder="Rechercher une action..."
                    className="
                  w-full
                  pl-10
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-green-200
                  bg-white
                  focus:ring-2
                  focus:ring-green-600
                  outline-none
                  "
                  />
                </div>

                <button
                  onClick={chargerHistorique}
                  className="
                flex
                items-center
                justify-center
                gap-2
                px-5
                py-2.5
                bg-green-700
                text-white
                rounded-xl
                font-bold
                hover:bg-green-800
                transition
                "
                >
                  <RefreshCcw size={18} />
                  Actualiser
                </button>
              </div>
            </div>

            <div
              className="
            bg-white/50
            backdrop-blur-md
            rounded-2xl
            shadow-xl
            border
            border-white/40
            overflow-hidden
            "
            >
              {loading ? (
                <div
                  className="
                py-16
                flex
                flex-col
                items-center
                "
                >
                  <RefreshCcw
                    className="
                  animate-spin
                  text-green-700
                  "
                    size={40}
                  />

                  <p className="mt-3 font-semibold">Chargement...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead
                      className="
                  bg-green-800
                  text-white
                  "
                    >
                      <tr>
                        <th className="p-4 text-left">Utilisateur</th>

                        <th className="p-4 text-left">Rôle</th>

                        <th className="p-4 text-left">Action</th>

                        <th className="p-4 text-left">Module</th>

                        <th className="p-4 text-left">Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {historiqueFiltre.length > 0 ? (
                        historiqueFiltre.map((item) => (
                          <tr
                            key={item.id}
                            className="
                      border-b
                      border-green-100
                      hover:bg-white/60
                      transition
                      "
                          >
                            <td className="p-4 flex items-center gap-2">
                              <User size={18} className="text-green-700" />

                              {item.utilisateur}
                            </td>

                            <td className="p-4">
                              <span
                                className="
                          inline-flex
                          items-center
                          gap-1
                          bg-green-100
                          text-green-800
                          px-3
                          py-1
                          rounded-lg
                          text-sm
                          font-bold
                          "
                              >
                                <ShieldCheck size={15} />

                                {item.role}
                              </span>
                            </td>

                            <td className="p-4 font-semibold">{item.action}</td>

                            <td className="p-4">{item.module}</td>

                            <td className="p-4 flex items-center gap-2">
                              <Calendar size={16} />

                              {item.dateAction
                                ? new Date(item.dateAction).toLocaleString()
                                : "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="
                        text-center
                        p-10
                        text-green-800
                        font-semibold
                        "
                          >
                            Aucun historique trouvé.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
