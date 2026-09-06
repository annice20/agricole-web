import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Sprout,
  Leaf,
  User,
  Users,
  LogOut,
  LayoutDashboard,
  Map,
  Settings,
  Bell,
  Menu,
  X,
  Handshake,
  AlertTriangle,
  Package,
  FileText,
  PieChart,
  Wallet,
  BellRing,
  History,
  Wrench,
  Sun,
  Moon,
} from "lucide-react";
import { toast } from "react-toastify";
import { getSession, logout } from "../utils/auth";
import { getNotifications } from "../services/notificationService";
import { useTheme } from "../context/ThemeContext";

export default function MyNavbar() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();

  const [currentUser, setCurrentUser] = useState({
    nom: "Utilisateur",
    role: "",
    id: null,
  });

  const [notifNonLues, setNotifNonLues] = useState(0);

  // Extraction des données de session utilisateur pour l'affichage de la Navbar
  useEffect(() => {
    const session = getSession();
    if (session) {
      setCurrentUser({
        nom: session.nom || "Utilisateur",
        role: session.role || "AGENT_TERRAIN",
        id: session.id || null,
      });
    } else {
      navigate("/");
      return;
    }
  }, [navigate]);

  // Chargement du compteur de notifications non lues
  // + rafraîchissement automatique toutes les 30s (polling), pour éviter
  // d'avoir à recharger manuellement la page pour voir un nouveau rappel.
  useEffect(() => {
    if (!currentUser.id) return;

    const chargerCompteur = async () => {
      try {
        const data = await getNotifications(currentUser.id);
        const nonLues = data.filter((n) => !n.lu).length;
        setNotifNonLues(nonLues);
      } catch {
        // silencieux : pas besoin de toast pour un compteur
      }
    };

    chargerCompteur(); // premier appel immédiat au montage
    const interval = setInterval(chargerCompteur, 30000); // puis toutes les 30s

    return () => clearInterval(interval);
  }, [currentUser.id]);

  const handleLogout = () => {
    logout();
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  const isAdmin = currentUser.role === "ADMIN_NATIONAL";
  const isAgriculteur = currentUser.role === "AGRICULTEUR";
  const isResponsableRegional = currentUser.role === "RESPONSABLE_REGIONAL";
  const isAgent = currentUser.role === "AGENT_TERRAIN";

  return (
    <div className="text-green-950 font-sans antialiased">
      {/* NAVBAR */}
      <header className="bg-white/40 backdrop-blur-md border-b border-white/20 h-16 fixed top-0 right-0 left-0 z-30 flex items-center justify-between px-4 lg:px-8 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-green-200/50 rounded-xl lg:hidden text-green-800 transition"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-green-700 p-2 rounded-xl shadow-md">
              <Leaf className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-extrabold text-green-900 hidden sm:inline-block tracking-tight">
              Plateforme Agricole
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-green-800 hover:bg-green-200/50 rounded-xl transition"
            title={
              theme === "dark"
                ? "Passer en mode clair"
                : "Passer en mode sombre"
            }
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => navigate("/notifications")}
            className="p-2 text-green-800 hover:bg-green-200/50 rounded-xl transition relative"
            title="Notifications"
          >
            <Bell size={20} />
            {notifNonLues > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                {notifNonLues > 9 ? "9+" : notifNonLues}
              </span>
            )}
          </button>
          <div className="h-6 w-px bg-green-900/10 hidden sm:block"></div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-green-900">
                {currentUser.nom}
              </p>
              <p className="text-xs text-green-700/80 font-medium uppercase">
                {currentUser.role?.replace("_", " ")}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-700 text-white flex items-center justify-center font-bold shadow-md uppercase">
              {currentUser.nom.substring(0, 2)}
            </div>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-16 bottom-0 left-0 w-64 bg-green-900 text-green-100 z-20 transform transition-transform duration-300 lg:transform-none lg:opacity-100 shadow-2xl border-r border-green-950
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full justify-between p-4">
          <div className="space-y-1.5">
            <p className="px-3 text-xs font-bold text-green-400 uppercase tracking-wider mb-4">
              Menu Principal
            </p>

            {(isAdmin || isResponsableRegional) && (
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
              >
                <LayoutDashboard size={18} />
                Tableau de bord
              </Link>
            )}

            {(isAdmin || isAgent || isResponsableRegional) && (
              <Link
                to="/agriculteurs"
                className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
              >
                <Users size={18} />
                Agriculteurs
              </Link>
            )}

            {(isAdmin || isResponsableRegional) && (
              <Link
                to="/equipements"
                className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
              >
                <Wrench size={18} />
                Équipements
              </Link>
            )}

            {isResponsableRegional && (
              <Link
                to="/beneficiaires-regionaux"
                className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
              >
                <Handshake size={18} />
                Bénéficiaires Régionaux
              </Link>
            )}

            {(isAdmin || isResponsableRegional || isAgriculteur || isAgent) && (
              <Link
                to="/programmes"
                className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
              >
                <Sprout size={18} />
                Programmes d'aide
              </Link>
            )}

            {(isAdmin || isResponsableRegional) && (
              <Link
                to="/demandes"
                className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
              >
                <FileText size={18} />
                Demandes d'aide
              </Link>
            )}

            {(isAdmin || isResponsableRegional) && (
              <Link
                to="/financements"
                className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
              >
                <Sprout size={18} />
                Financements
              </Link>
            )}

            {(isAdmin || isResponsableRegional) && (
              <Link
                to="/reclamations"
                className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
              >
                <AlertTriangle size={18} />
                Réclamations
              </Link>
            )}

            {(isAdmin || isResponsableRegional || isAgent) && (
              <Link
                to="/distributions"
                className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
              >
                <Package size={18} />
                Suivi des distributions
              </Link>
            )}

            {(isAgent || isResponsableRegional) && (
              <button
                onClick={() => navigate("/carte")}
                className="w-full flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
              >
                <Map size={18} />
                GPS
              </button>
            )}

            {isAdmin && (
              <Link
                to="/repartition"
                className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
              >
                <Package size={18} />
                Répartition des aides
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/suivifinancements"
                className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
              >
                <Wallet size={18} />
                Suivi des financements
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/analyse-regionale-stats"
                className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
              >
                <PieChart size={18} />
                Analyse régionale
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/historique"
                className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
              >
                <History size={18} />
                Historique des actions
              </Link>
            )}

            {isResponsableRegional && (
              <Link
                to="/rappel-administratif"
                className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
              >
                <BellRing size={18} />
                Rappel administratif
              </Link>
            )}

            {/* Menu spécifique Agriculteur */}
            {isAgriculteur && (
              <>
                <Link
                  to="/mes-aides"
                  className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
                >
                  <Package size={18} />
                  Mes aides
                </Link>
                <Link
                  to="/mes-demandes"
                  className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
                >
                  <Sprout size={18} />
                  Mes demandes
                </Link>
                <Link
                  to="/reclamations/nouvelle"
                  className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
                >
                  <FileText size={18} />
                  Mes réclamations
                </Link>
                <Link
                  to="/notifications"
                  className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
                >
                  <Bell size={18} />
                  Notifications
                </Link>
              </>
            )}

            {isAdmin && (
              <button
                onClick={() => navigate("/utilisateurs")}
                className="w-full flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
              >
                <Settings size={18} />
                Configuration (Admin)
              </button>
            )}

            <Link
              to="/profil"
              className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl font-medium text-sm transition text-left"
            >
              <User size={18} />
              Mon Profil
            </Link>
          </div>

          <div className="border-t border-green-800 pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 bg-red-900/40 text-red-200 hover:bg-red-900/60 rounded-xl font-bold text-sm transition border border-red-900/30"
            >
              <LogOut size={18} />
              Se déconnecter
            </button>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-green-950/20 backdrop-blur-sm z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
