import { useEffect, useState } from "react";
import { Bell, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import {
  getNotifications,
  marquerCommeLu,
} from "../services/notificationService";
import { getSession } from "../utils/auth";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Récupérer la session active
    const session = getSession();

    // 2. Extraire l'ID (Tente de le lire depuis la session, sinon directement dans le localStorage)
    const idAUtiliser = session?.id || localStorage.getItem("utilisateurId");

    if (!idAUtiliser) {
      toast.error("Impossible de récupérer votre identifiant de session.");
      setLoading(false);
      return;
    }

    // 3. Déclencher le chargement avec le bon ID trouvé
    const recupererDonnees = async () => {
      try {
        const data = await getNotifications(idAUtiliser);
        setNotifications(data);
      } catch (error) {
        toast.error("Impossible de charger les notifications");
      } finally {
        setLoading(false);
      }
    };

    recupererDonnees();
  }, []);

  const handleMarquerCommeLu = async (id) => {
    try {
      await marquerCommeLu(id);
      setNotifications((old) =>
        old.map((n) => (n.id === id ? { ...n, lu: true } : n)),
      );
      toast.success("Notification marquée comme lue");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex flex-col font-sans antialiased text-green-950">
        <MyNavbar />

        <div className="flex flex-1 pt-16">
          <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-8 lg:ml-64">
            <div className="mb-6">
              <h1 className="text-3xl font-black text-green-900 tracking-tight">
                Notifications
              </h1>
              <p className="text-green-800/70 text-sm mt-1">
                Consultez les informations relatives à vos demandes et aides
                agricoles.
              </p>
            </div>

            {loading ? (
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-12 shadow-xl flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-700 mb-3" />
                <p className="text-green-900 text-sm font-semibold animate-pulse">
                  Chargement des notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-12 shadow-xl text-center">
                <Bell size={42} className="mx-auto text-green-700/50 mb-3" />
                <p className="font-bold text-green-800/60 text-sm">
                  Aucune notification disponible
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white/60 backdrop-blur-md rounded-xl border p-5 shadow-md transition hover:bg-white/80 ${
                      notification.lu
                        ? "border-white/40"
                        : "border-yellow-300 bg-yellow-50/30"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-green-950 text-sm sm:text-base">
                          {notification.message}
                        </p>
                        <p className="text-xs text-green-700/70 mt-2 font-medium">
                          {new Date(notification.dateEnvoi).toLocaleString(
                            "fr-FR",
                          )}
                        </p>
                      </div>

                      {!notification.lu && (
                        <button
                          onClick={() => handleMarquerCommeLu(notification.id)}
                          className="bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold transition shadow-sm shrink-0"
                        >
                          <CheckCircle size={14} />
                          <span>Lu</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
