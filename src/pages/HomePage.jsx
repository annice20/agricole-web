import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wheat,
  MapPin,
  BarChart3,
  Bell,
  Users,
  ShieldCheck,
  Building2,
  Map,
  UserCheck,
  Sprout,
  ArrowRight,
  Menu,
  X,
  CheckCircle2,
  Globe,
  Loader2,
} from "lucide-react";
import axios from "axios";

// ── Données statiques ──────────────────────────────────────────────────
const features = [
  {
    icon: Wheat,
    title: "Gestion des Aides",
    desc: "Centralisation et suivi des subventions, semences, équipements et financements agricoles en temps réel.",
    color: "text-emerald-800",
    bg: "bg-emerald-100/50 border-emerald-200",
  },
  {
    icon: MapPin,
    title: "Géolocalisation GPS",
    desc: "Cartographie des exploitations agricoles et visualisation régionale des distributions sur carte interactive.",
    color: "text-[#d97706]",
    bg: "bg-amber-100/60 border-amber-200",
  },
  {
    icon: BarChart3,
    title: "Tableau de Bord",
    desc: "Statistiques analytiques, rapports nationaux et suivi des bénéficiaires par région en un clin d'œil.",
    color: "text-blue-800",
    bg: "bg-blue-100/50 border-blue-200",
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "Alertes en temps réel pour les distributions, rappels administratifs et suivi des demandes d'aides.",
    color: "text-[#d97706]",
    bg: "bg-amber-100/60 border-amber-200",
  },
  {
    icon: Users,
    title: "Gestion Bénéficiaires",
    desc: "Enregistrement, validation et historique complet des agriculteurs bénéficiaires avec contrôle anti-fraude.",
    color: "text-purple-800",
    bg: "bg-purple-100/50 border-purple-200",
  },
  {
    icon: ShieldCheck,
    title: "Sécurité & Transparence",
    desc: "Double authentification, gestion des rôles et traçabilité complète de toutes les opérations.",
    color: "text-emerald-800",
    bg: "bg-emerald-100/50 border-emerald-200",
  },
];

const roles = [
  {
    icon: Building2,
    title: "Administrateur National",
    desc: "Supervision globale, rapports nationaux et contrôle de sécurité du système.",
    perms: [
      "Gestion des utilisateurs",
      "Rapports nationaux",
      "Contrôle sécurité",
    ],
  },
  {
    icon: Map,
    title: "Responsables Régionaux",
    desc: "Gestion des bénéficiaires et supervision des distributions régionales.",
    perms: [
      "Bénéficiaires régionaux",
      "Statistiques régionales",
      "Projets agricoles",
    ],
  },
  {
    icon: UserCheck,
    title: "Agents de Terrain",
    desc: "Enregistrement des agriculteurs et collecte de données GPS sur le terrain.",
    perms: [
      "Enregistrement agriculteurs",
      "Collecte données GPS",
      "Suivi distributions",
    ],
  },
  {
    icon: Sprout,
    title: "Agriculteurs",
    desc: "Consultation des aides disponibles, suivi des demandes et signalement de problèmes.",
    perms: ["Consulter les aides", "Suivi des demandes", "Réclamations"],
  },
];

const navLinks = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Utilisateurs", href: "#utilisateurs" },
  { label: "À propos", href: "#apropos" },
];

const progressItems = [
  { label: "Transparence des distributions", val: 95 },
  { label: "Couverture régionale (26 régions)", val: 100 },
  { label: "Suivi numérique des bénéficiaires", val: 88 },
  { label: "Réduction des risques de fraude", val: 92 },
  { label: "Efficacité administrative", val: 85 },
];

function useCountUp(target, duration, active) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active || target === 0) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);
  return count;
}

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function StatItem({ value, suffix, label, active, loading, isAmber }) {
  const count = useCountUp(value, 1800, active && !loading);
  return (
    <div className="text-center py-8 px-4 transition-all hover:bg-zinc-100">
      <div
        className={`text-4xl md:text-5xl font-black tracking-tight font-display ${isAmber ? "text-[#b45309]" : "text-[#006c40]"}`}
      >
        {loading ? (
          <Loader2 size={32} className="animate-spin mx-auto opacity-40" />
        ) : (
          <>
            {count}
            {suffix}
          </>
        )}
      </div>
      <div className="text-[11px] text-zinc-900 mt-2 uppercase tracking-widest max-w-[180px] mx-auto font-black leading-relaxed">
        {label}
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const [liveStats, setLiveStats] = useState({
    totalAgriculteurs: 0,
    agriculteursActifs: 0,
    programmesActifs: 0,
    regionsCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [statsRef, statsVisible] = useInView(0.2);
  const [featRef, featVisible] = useInView(0.1);
  const [rolesRef, rolesVisible] = useInView(0.1);
  const [aboutRef, aboutVisible] = useInView(0.1);
  const [ctaRef, ctaVisible] = useInView(0.2);

  useEffect(() => {
    const chargerStats = async () => {
      try {
        const res = await axios.get(
          "https://agricole-backend.onrender.com/api/public/stats",
        );
        setLiveStats(res.data);
      } catch {
        setLiveStats({
          totalAgriculteurs: 0,
          agriculteursActifs: 0,
          programmesActifs: 0,
          regionsCount: 0,
        });
      } finally {
        setStatsLoading(false);
      }
    };
    chargerStats();
  }, []);

  const displayStats = [
    {
      value: liveStats.totalAgriculteurs,
      suffix: "",
      label: "Agriculteurs enregistrés",
      isAmber: false,
    },
    {
      value: liveStats.agriculteursActifs,
      suffix: "",
      label: "Producteurs actifs validés",
      isAmber: true,
    },
    {
      value: liveStats.programmesActifs,
      suffix: "",
      label: "Programmes d'aide actifs",
      isAmber: false,
    },
    {
      value: liveStats.regionsCount,
      suffix: "",
      label: "Régions couvertes",
      isAmber: false,
    },
  ];

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-[#163e2b] text-zinc-900 min-h-screen overflow-x-hidden antialiased selection:bg-[#008751] selection:text-white pb-12">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .clip-hex { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
        @keyframes float-slow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
        .animate-fade-up { animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .stagger-2 { animation-delay: 0.15s; }
        
        .btn-green { background: #008751; color: white; font-weight: 800; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 1rem 2.2rem; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)); cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 0.6rem; }
        .btn-green:hover { background: #006c40; box-shadow: 0 10px 25px rgba(0, 135, 81, 0.3); transform: translateY(-1px); }
        
        .btn-amber { background: #d97706; color: white; font-weight: 800; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 1rem 2.2rem; transition: all 0.3s; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 0.6rem; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)); }
        .btn-amber:hover { background: #b45309; box-shadow: 0 10px 25px rgba(217, 119, 6, 0.3); transform: translateY(-1px); }
        
        .progress-bar { height: 7px; background: #e4e4e7; border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(to right, #008751, #d97706); border-radius: 4px; transition: width 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s; }
      `}</style>

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 40 ? "bg-white border-b border-emerald-900/20 shadow-lg py-2" : "bg-white/95 border-b border-emerald-900/10 py-3"}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* LOGO COMBINÉ : FEUILLE + BLÉ */}
            <div className="relative w-10 h-10 bg-[#008751] clip-hex flex items-center justify-center shadow-md">
              <Wheat
                size={14}
                className="text-white stroke-[2.5] absolute top-1.5"
              />
              <Sprout
                size={12}
                className="text-amber-400 absolute bottom-1.5"
              />
            </div>
            <div>
              <span className="font-display text-xl font-black text-emerald-950 tracking-wide block leading-none">
                AgroPlateforme
              </span>
              <span className="block text-[10px] text-[#008751] uppercase tracking-[0.18em] font-extrabold leading-none mt-1">
                Gouvernement de Madagascar
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-xs text-zinc-900 hover:text-[#008751] transition-colors uppercase tracking-widest font-black no-underline"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => navigate("/login")}
              className="btn-green text-[11px] py-2 px-5"
            >
              Espace Sécurisé
            </button>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-zinc-900 bg-transparent border-none cursor-pointer p-2"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* CONTAINER PRINCIPAL SOMBRE HARMONIEUX */}
      <div className="max-w-7xl mx-4 sm:mx-6 lg:mx-auto bg-white rounded-2xl shadow-2xl border border-emerald-900/20 overflow-hidden mt-32 relative z-10">
        {/* ── HERO SECTION ──────────────────────────────────────────────── */}
        <section className="relative flex items-center px-8 md:px-16 py-20 border-b border-zinc-200">
          <div className="w-full grid lg:grid-cols-12 gap-12 items-center">
            {/* Gauche */}
            <div className="opacity-0 animate-fade-up lg:col-span-7 xl:col-span-6">
              <div className="inline-flex items-center gap-2 border border-amber-300 bg-amber-50 px-3 py-1.5 mb-6 rounded-md shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d97706] animate-pulse-dot" />
                <span className="text-[10px] text-[#b45309] uppercase tracking-[0.16em] font-black">
                  Ministère de l'Agriculture • Portail Officiel
                </span>
              </div>

              <h1 className="font-display text-5xl sm:text-6xl font-black leading-[1.1] tracking-tight mb-6 text-emerald-950">
                Suivi{" "}
                <em className="text-[#008751] not-italic font-bold">
                  Intelligent
                </em>
                <br />
                des Distributions
                <br />
                <span className="text-[#d97706] font-medium">Agricoles</span>
              </h1>

              <div className="w-20 h-[4px] bg-[#008751] my-6" />

              <p className="text-zinc-900 text-sm font-medium leading-relaxed mb-8 max-w-lg">
                Un écosystème d'information centralisé et transparent pour la
                gestion, la cartographie des parcelles et la régulation des
                subventions publiques destinées aux producteurs malgaches.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="btn-green"
                >
                  Accéder à l'espace{" "}
                  <ArrowRight size={14} className="stroke-[3]" />
                </button>
                <button
                  onClick={() => navigate("/inscription")}
                  className="btn-amber"
                >
                  S'enregistrer
                </button>
              </div>

              <div className="flex items-center gap-6 mt-12 pt-6 border-t border-zinc-200">
                {["Souveraineté", "Anti-fraude", "Registre Central"].map(
                  (t) => (
                    <div key={t} className="flex items-center gap-2">
                      <CheckCircle2
                        size={16}
                        className="text-[#008751] stroke-[2.5]"
                      />
                      <span className="text-xs text-emerald-950 font-extrabold tracking-wide">
                        {t}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Droite (Section animée contrastée et sombre) */}
            <div className="relative flex items-center justify-center h-[420px] opacity-0 animate-fade-up stagger-2 lg:col-span-5 xl:col-span-6 bg-[#113122] border border-emerald-900 rounded-xl overflow-hidden shadow-inner">
              <div className="absolute w-80 h-80 rounded-full bg-emerald-900/40 shadow-inner border border-emerald-800/50" />

              {/* ANIMATION TOURNANTE RENFORCÉE ET VISIBLE */}
              <div
                className="absolute w-72 h-72 rounded-full border-2 border-white/40 animate-spin-slow"
                style={{ borderStyle: "dashed" }}
              />
              <div
                className="absolute w-60 h-60 rounded-full border border-amber-500/30 animate-spin-slow"
                style={{ borderStyle: "dotted", animationDirection: "reverse" }}
              />

              {/* CŒUR DU LOGO (FEUILLE ET BLÉ) */}
              <div className="relative w-36 h-36 bg-white border-4 border-[#008751] clip-hex flex flex-col items-center justify-center animate-float-slow shadow-2xl">
                <Wheat size={36} className="text-[#008751] stroke-[2.5]" />
                <Sprout size={28} className="text-[#d97706] stroke-[2] mt-1" />
              </div>

              {[
                {
                  icon: <Globe size={14} className="text-[#d97706]" />,
                  text: `${statsLoading ? "—" : liveStats.regionsCount} Régions`,
                  style: "top-[12%] left-[6%]",
                },
                {
                  icon: <Users size={14} className="text-purple-700" />,
                  text: `${statsLoading ? "—" : liveStats.agriculteursActifs} Validés`,
                  style: "top-[78%] left-[8%]",
                },
                {
                  icon: <BarChart3 size={14} className="text-blue-700" />,
                  text: "Analytique live",
                  style: "top-[15%] right-[6%]",
                },
                {
                  icon: <ShieldCheck size={14} className="text-[#008751]" />,
                  text: "Certifié Secure",
                  style: "top-[72%] right-[6%]",
                },
              ].map((c, i) => (
                <div
                  key={i}
                  className={`absolute ${c.style} bg-white border-2 border-zinc-300 px-4 py-2.5 flex items-center gap-2.5 text-xs text-zinc-900 font-black rounded-lg shadow-xl hover:border-[#d97706] transition-colors`}
                >
                  {c.icon}
                  {c.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS SECTION ──────────────────────────────────────────────── */}
        <section
          id="stats"
          ref={statsRef}
          className="bg-zinc-50 border-b border-zinc-200"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-zinc-200">
            {displayStats.map((s, i) => (
              <StatItem
                key={i}
                {...s}
                active={statsVisible}
                loading={statsLoading}
              />
            ))}
          </div>
        </section>

        {/* ── FONCTIONNALITÉS ────────────────────────────────────────────── */}
        <section
          id="fonctionnalites"
          ref={featRef}
          className="py-24 px-8 md:px-16 border-b border-zinc-200"
        >
          <div
            className={`mb-16 transition-all duration-700 ${featVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <p className="text-[11px] text-[#008751] uppercase tracking-[0.2em] font-black mb-2">
              Ingénierie Numérique
            </p>
            <h2 className="font-display text-4xl font-black tracking-tight text-emerald-950">
              Fonctionnalités Clés du Système
            </h2>
            <div className="w-14 h-[4px] bg-[#008751] mt-4" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className={`bg-zinc-50 border border-zinc-300/80 hover:border-[#008751] hover:bg-white hover:shadow-xl p-8 rounded-xl transition-all duration-300 flex flex-col justify-between group ${featVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                  style={{ transitionDelay: `${i * 0.05}s` }}
                >
                  <div>
                    <div
                      className={`w-12 h-12 ${f.bg} border flex items-center justify-center mb-6 rounded-lg`}
                    >
                      <Icon size={22} className={`${f.color} stroke-[2.5]`} />
                    </div>
                    <h3 className="font-display text-2xl font-bold mb-3 text-emerald-950">
                      {f.title}
                    </h3>
                    <p className="text-xs text-zinc-900 leading-relaxed font-medium">
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── ROLES ──────────────────────────────────────────────────────── */}
        <section
          id="utilisateurs"
          ref={rolesRef}
          className="py-24 px-8 md:px-16 bg-zinc-50 border-b border-zinc-200"
        >
          <div
            className={`text-center mb-16 transition-all duration-700 ${rolesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <p className="text-[11px] text-[#008751] uppercase tracking-[0.2em] font-black mb-2">
              Architecture des Habilitations
            </p>
            <h2 className="font-display text-4xl font-black tracking-tight text-emerald-950">
              Gestion Matricielle des Rôles
            </h2>
            <div className="w-14 h-[4px] bg-[#008751] mt-4 mx-auto" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((r, i) => {
              const Icon = r.icon;
              return (
                <div
                  key={i}
                  className={`bg-white border-2 border-zinc-200 hover:border-[#d97706] p-6 flex flex-col justify-between shadow-sm rounded-xl transition-all duration-500 ${rolesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                  style={{ transitionDelay: `${i * 0.05}s` }}
                >
                  <div>
                    <div className="w-10 h-10 bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 rounded-lg">
                      <Icon size={20} className="text-[#b45309] stroke-[2.5]" />
                    </div>
                    <h3 className="font-display font-black text-xl text-emerald-950 mb-2">
                      {r.title}
                    </h3>
                    <p className="text-xs text-zinc-900 leading-relaxed mb-6 font-medium h-14 overflow-hidden">
                      {r.desc}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-zinc-200">
                    <ul className="space-y-2">
                      {r.perms.map((p) => (
                        <li
                          key={p}
                          className="flex items-center gap-2 text-[11px] text-zinc-900 font-extrabold"
                        >
                          <CheckCircle2
                            size={13}
                            className="text-[#008751] stroke-[2.5] flex-shrink-0"
                          />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── À PROPOS ───────────────────────────────────────────────────── */}
        <section
          id="apropos"
          ref={aboutRef}
          className="py-24 px-8 md:px-16 border-b border-zinc-200"
        >
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div
              className={`lg:col-span-7 xl:col-span-6 transition-all duration-700 ${aboutVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              <p className="text-[11px] text-[#008751] uppercase tracking-[0.2em] font-black mb-2">
                Contexte Statutaire
              </p>
              <h2 className="font-display text-4xl font-black tracking-tight text-emerald-950 leading-tight mb-5">
                Moderniser l'Infrastructure Agricole de{" "}
                <em className="text-[#d97706] not-italic font-bold">
                  Madagascar
                </em>
              </h2>
              <div className="w-14 h-[4px] bg-[#008751] mb-6" />
              <p className="text-xs text-zinc-900 font-medium leading-relaxed mb-4">
                Le secteur agraire constitue le pivot économique souverain de la
                Grande Île. Cette plateforme interconnectée répond à l'impératif
                d'équité et d'audit public de la chaîne de distribution des
                aides en substituant les registres physiques par un grand livre
                numérique unifié.
              </p>
              <p className="text-xs text-zinc-900 font-medium leading-relaxed mb-8">
                Par le biais du recoupement des coordonnées géospatiales,
                d'indices analytiques sectoriels et de notifications
                automatisées, l’État et les coopératives disposent d'un outil
                décisionnel de haute précision.
              </p>
              <button onClick={() => navigate("/login")} className="btn-green">
                Ouvrir le portail{" "}
                <ArrowRight size={14} className="stroke-[3]" />
              </button>
            </div>

            <div
              className={`lg:col-span-5 xl:col-span-6 space-y-6 transition-all duration-700 delay-150 ${aboutVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              <div className="bg-zinc-50 border-2 border-zinc-200 p-6 md:p-8 rounded-xl space-y-6">
                <h4 className="text-xs uppercase font-black tracking-widest text-emerald-950 border-b border-zinc-200 pb-3">
                  Indicateurs d'Impact Actuels
                </h4>
                {progressItems.map((item, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-zinc-900 font-black">
                        {item.label}
                      </span>
                      <span className="text-xs text-[#b45309] font-black">
                        {item.val}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: aboutVisible ? `${item.val}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ──────────────────────────────────────────────────── */}
        <section
          ref={ctaRef}
          className="py-20 px-8 bg-gradient-to-b from-white to-zinc-100/60 text-center"
        >
          <div
            className={`transition-all duration-700 ${ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <p className="text-[11px] text-[#008751] uppercase tracking-[0.2em] font-black mb-4">
              Enregistrement et authentification
            </p>
            <h2 className="font-display text-4xl font-black tracking-tight text-emerald-950 mb-5">
              Participez à la Transformation du Secteur Rural
            </h2>
            <div className="w-14 h-[4px] bg-[#d97706] mx-auto mb-6" />
            <p className="text-xs text-zinc-900 font-semibold mb-10 max-w-lg mx-auto">
              Sélectionnez votre terminal d'accès sécurisé selon votre profil
              d'habilitation ministériel ou exploitant.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={() => navigate("/login")} className="btn-green">
                Connexion Sécurisée{" "}
                <ArrowRight size={14} className="stroke-[3]" />
              </button>
              <button
                onClick={() => navigate("/inscription")}
                className="btn-amber"
              >
                Créer un compte
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="max-w-7xl mx-auto px-6 mt-12 text-white/80">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 border-t border-white/10 pt-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#008751] clip-hex flex items-center justify-center border border-white/20">
              <Wheat size={12} className="text-white" />
            </div>
            <span className="font-display font-black text-base text-white tracking-wide">
              AgroPlateforme Madagascar
            </span>
          </div>
          <p className="text-[11px] text-white/70 text-center lg:text-left font-semibold max-w-md">
            Portail institutionnel interministériel d’audit technique des
            intrants. © {new Date().getFullYear()} — Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
