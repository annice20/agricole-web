import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sprout, ArrowLeft, Calendar, DollarSign } from "lucide-react";

import { toast } from "react-toastify";

import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

import { getProgramme, updateProgramme } from "../services/programmeService";

export default function ModifierProgrammeAide() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    typeAide: "",
    budget: "",
    dateDebut: "",
    dateFin: "",
    actif: false,
  });

  // ============================
  // Chargement du programme
  // ============================

  useEffect(() => {
    const chargerProgramme = async () => {
      try {
        const response = await getProgramme(id);

        const programme = response.data;

        setFormData({
          titre: programme.titre || "",

          description: programme.description || "",

          typeAide: programme.typeAide || "",

          budget: programme.budget || "",

          dateDebut: programme.dateDebut
            ? programme.dateDebut.substring(0, 10)
            : "",

          dateFin: programme.dateFin ? programme.dateFin.substring(0, 10) : "",

          actif: programme.actif ?? false,
        });
      } catch (error) {
        console.error(error);

        toast.error("Impossible de charger le programme");

        navigate("/programmes");
      } finally {
        setLoadingData(false);
      }
    };

    chargerProgramme();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData({
      ...formData,

      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.dateFin &&
      formData.dateDebut &&
      formData.dateFin < formData.dateDebut
    ) {
      toast.warning("La date de fin doit être postérieure à la date de début.");

      return;
    }

    try {
      setLoading(true);

      await updateProgramme(id, {
        titre: formData.titre,

        description: formData.description,

        typeAide: formData.typeAide,

        budget: Number(formData.budget),

        dateDebut: formData.dateDebut,

        dateFin: formData.dateFin,

        actif: formData.actif,
      });

      toast.success("Programme modifié avec succès");

      navigate("/programmes");
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Impossible de modifier le programme",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div
        className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-green-100
      "
      >
        <p
          className="
          text-green-800
          font-bold
        "
        >
          Chargement du programme...
        </p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div
        className="
        min-h-screen
        bg-gradient-to-br
        from-green-100
        via-green-200
        to-green-300
        flex
        flex-col
        font-sans
        antialiased
        text-green-950
      "
      >
        <MyNavbar />

        <div className="flex flex-1 pt-16">
          <main
            className="
            flex-1
            min-w-0
            p-4
            md:p-6
            lg:p-8
            lg:ml-64
            flex
            justify-center
            items-start
          "
          >
            <div
              className="
              bg-white/60
              backdrop-blur-md
              border
              border-white/40
              rounded-3xl
              shadow-xl
              w-full
              max-w-2xl
              p-6
              sm:p-10
              relative
              mt-4
            "
            >
              <button
                onClick={() => navigate(-1)}
                className="
                  absolute
                  top-6
                  left-6
                  flex
                  items-center
                  gap-1
                  text-green-800
                  hover:text-green-950
                  font-bold
                  text-sm
                "
              >
                <ArrowLeft size={16} />
                Retour
              </button>

              <div
                className="
                flex
                flex-col
                items-center
                mb-8
                mt-4
              "
              >
                <div
                  className="
                  bg-green-700
                  p-3
                  rounded-2xl
                  shadow-md
                  text-white
                  mb-2
                "
                >
                  <Sprout size={24} />
                </div>

                <h1
                  className="
                  text-2xl
                  font-black
                  text-green-900
                  tracking-tight
                "
                >
                  Modifier Programme d'Aide
                </h1>

                <p
                  className="
                  text-xs
                  text-green-700/80
                  font-medium
                  mt-1
                  text-center
                "
                >
                  Mise à jour d'un programme de soutien agricole.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    className="
                    block
                    text-xs
                    font-bold
                    uppercase
                    text-green-900
                    mb-2
                  "
                  >
                    Titre du programme
                  </label>

                  <input
                    type="text"
                    name="titre"
                    value={formData.titre}
                    onChange={handleChange}
                    required
                    className="
                      w-full
                      border
                      border-green-200
                      bg-white
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      text-green-900
                      font-medium
                      focus:ring-2
                      focus:ring-green-500
                      outline-none
                    "
                  />
                </div>

                <div>
                  <label
                    className="
                    block
                    text-xs
                    font-bold
                    uppercase
                    text-green-900
                    mb-2
                  "
                  >
                    Description
                  </label>

                  <textarea
                    rows="4"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="
                      w-full
                      border
                      border-green-200
                      bg-white
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      resize-none
                      focus:ring-2
                      focus:ring-green-500
                      outline-none
                    "
                  />
                </div>

                <div>
                  <label
                    className="
                    block
                    text-xs
                    font-bold
                    uppercase
                    text-green-900
                    mb-2
                  "
                  >
                    Type d'aide
                  </label>

                  <select
                    name="typeAide"
                    value={formData.typeAide}
                    onChange={handleChange}
                    required
                    className="
                      w-full
                      border
                      border-green-200
                      bg-white
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                    "
                  >
                    <option value="">-- Sélectionner --</option>

                    <option value="FINANCEMENT">Financement</option>

                    <option value="SEMENCE">Distribution de semences</option>

                    <option value="EQUIPEMENT">Matériel agricole</option>

                    <option value="FORMATION">Formation technique</option>

                    <option value="SUBVENTION">Subvention</option>

                    <option value="IRRIGATION">Irrigation</option>
                  </select>
                </div>

                <div
                  className="
                  grid
                  grid-cols-1
                  md:grid-cols-3
                  gap-4
                "
                >
                  <div>
                    <label
                      className="
                      block
                      text-xs
                      font-bold
                      uppercase
                      mb-2
                    "
                    >
                      <DollarSign size={13} className="inline mr-1" />
                      Budget
                    </label>

                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      required
                      className="
                        w-full
                        border
                        border-green-200
                        rounded-xl
                        px-3
                        py-3
                      "
                    />
                  </div>

                  <div>
                    <label
                      className="
                      block
                      text-xs
                      font-bold
                      uppercase
                      mb-2
                    "
                    >
                      <Calendar size={13} className="inline mr-1" />
                      Début
                    </label>

                    <input
                      type="date"
                      name="dateDebut"
                      value={formData.dateDebut}
                      onChange={handleChange}
                      required
                      className="
                        w-full
                        border
                        border-green-200
                        rounded-xl
                        px-3
                        py-3
                      "
                    />
                  </div>

                  <div>
                    <label
                      className="
                      block
                      text-xs
                      font-bold
                      uppercase
                      mb-2
                    "
                    >
                      <Calendar size={13} className="inline mr-1" />
                      Fin
                    </label>

                    <input
                      type="date"
                      name="dateFin"
                      value={formData.dateFin}
                      onChange={handleChange}
                      required
                      className="
                        w-full
                        border
                        border-green-200
                        rounded-xl
                        px-3
                        py-3
                      "
                    />
                  </div>
                </div>

                <label
                  className="
                  flex
                  items-center
                  gap-3
                  text-sm
                  font-bold
                  text-green-900
                "
                >
                  <input
                    type="checkbox"
                    name="actif"
                    checked={formData.actif}
                    onChange={handleChange}
                  />
                  Programme actif
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full
                    bg-green-700
                    hover:bg-green-800
                    text-white
                    py-3
                    rounded-xl
                    font-bold
                    transition
                    shadow-md
                    disabled:opacity-50
                  "
                >
                  {loading
                    ? "Modification en cours..."
                    : "Enregistrer les modifications"}
                </button>
              </form>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
