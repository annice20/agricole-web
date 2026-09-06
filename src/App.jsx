import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MotDePasseOublie from "./pages/MotDePasseOublie";
import ReinitialiserMotDePasse from "./pages/ReinitialiserMotDePasse";
import OtpVerification from "./pages/OtpVerification";
import ListeUtilisateurs from "./pages/ListeUtilisateurs";
import ListeAgriculteurs from "./pages/ListeAgriculteurs";
import AjouterAgriculteur from "./pages/AjouterAgriculteur";
import ModifierAgriculteur from "./pages/ModifierAgriculteur";
import ListeProgrammesAide from "./pages/ListeProgrammesAide";
import AjouterProgrammeAide from "./pages/AjouterProgrammeAide";
import ModifierProgrammeAide from "./pages/ModifierProgrammeAide";
import AjouterDistribution from "./pages/AjouterDistribution";
import ListeDistributions from "./pages/ListeDistributions";
import GestionDemandes from "./pages/GestionDemandes";
import MesDemandes from "./pages/MesDemandes";
import CarteAgricole from "./pages/CarteAgricole";
import MesAides from "./pages/MesAides";
import GestionReclamations from "./pages/GestionReclamations";
import ReclamationPage from "./pages/ReclamationPage";
import Notifications from "./pages/Notifications";
import Equipements from "./pages/Equipements";
import AjouterEquipement from "./pages/AjouterEquipement";
import ModifierEquipement from "./pages/ModifierEquipement";
import BeneficiairesRegionaux from "./pages/BeneficiairesRegionaux";
import FinancementsAgricoles from "./pages/FinancementsAgricoles";
import SuiviFinancements from "./pages/SuiviFinancements";
import RepartitionAides from "./pages/RepartitionAides";
import AnalyseRegionale from "./pages/AnalyseRegionale";
import Profil from "./pages/Profil";
import CreerUtilisateur from "./pages/CreerUtilisateur";
import Inscription from "./pages/Inscription";
import RappelAdministratif from "./pages/RappelAdministratif";
import HistoriqueActions from "./pages/HistoriqueActions";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/verification-otp" element={<OtpVerification />} />
        <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
        <Route
          path="/reinitialiser-mot-de-passe"
          element={<ReinitialiserMotDePasse />}
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/creer-utilisateur" element={<CreerUtilisateur />} />
        <Route path="/utilisateurs" element={<ListeUtilisateurs />} />
        <Route path="/agriculteurs" element={<ListeAgriculteurs />} />
        <Route path="/agriculteurs/nouveau" element={<AjouterAgriculteur />} />
        <Route
          path="/agriculteurs/modifier/:id"
          element={<ModifierAgriculteur />}
        />
        <Route path="/programmes" element={<ListeProgrammesAide />} />
        <Route path="/programmes/ajouter" element={<AjouterProgrammeAide />} />
        <Route
          path="/programmes/modifier/:id"
          element={<ModifierProgrammeAide />}
        />
        <Route path="/demandes" element={<GestionDemandes />} />
        <Route path="/mes-demandes" element={<MesDemandes />} />
        <Route path="/agriculteurs/:id/aides" element={<MesAides />} />
        <Route path="/mes-aides" element={<MesAides />} />

        <Route path="/reclamations" element={<GestionReclamations />} />
        <Route path="/reclamations/nouvelle" element={<ReclamationPage />} />

        <Route path="/notifications" element={<Notifications />} />
        <Route path="/equipements" element={<Equipements />} />
        <Route path="/equipements/ajouter" element={<AjouterEquipement />} />
        <Route
          path="/equipements/modifier/:id"
          element={<ModifierEquipement />}
        />
        <Route path="/repartition" element={<RepartitionAides />} />
        <Route path="/suivifinancements" element={<SuiviFinancements />} />
        <Route path="/analyse-regionale-stats" element={<AnalyseRegionale />} />
        <Route
          path="/beneficiaires-regionaux"
          element={<BeneficiairesRegionaux />}
        />
        <Route
          path="/distributions/ajouter"
          element={<AjouterDistribution />}
        />
        <Route path="/distributions" element={<ListeDistributions />} />
        <Route path="/carte" element={<CarteAgricole />} />
        <Route path="/financements" element={<FinancementsAgricoles />} />
        <Route path="/rappel-administratif" element={<RappelAdministratif />} />
        <Route path="/historique" element={<HistoriqueActions />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
