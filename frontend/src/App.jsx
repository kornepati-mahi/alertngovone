import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import FloatingContactActions from "./components/FloatingContactActions";
import GoverningBody from "./pages/GoverningBody";
import VisionMission from "./pages/VisionMission";
import CoreValues from "./pages/CoreValues";
import OrganizationalProfile from "./pages/OrganizationalProfile";
import Organogram from "./pages/Organogram";
import AlertPolicies from "./pages/AlertPolicies";
import AreaOfOperation from "./pages/AreaOfOperation";
import FloodRelief from "./pages/FloodRelief";
import FloodRelief2023 from "./pages/FloodRelief2023";
import FloodRelief2022 from "./pages/FloodRelief2022";
import FloodRelief2021 from "./pages/FloodRelief2021";
import FloodRelief2020 from "./pages/FloodRelief2020";
import BlanketsDistributionEastGodavari from "./pages/BlanketsDistributionEastGodavari";
import GroceriesDistributionWestGodavari from "./pages/GroceriesDistributionWestGodavari";
import Chatbot from "./components/Chatbot";
import "./index.css";

/* Route-level code splitting: only the landing page ships in the initial bundle. */
const About = lazy(() => import("./pages/About"));
const Programs = lazy(() => import("./pages/Programs"));
const Stories = lazy(() => import("./pages/Stories"));
const PolavaramLaRr = lazy(() => import("./pages/PolavaramLaRr"));
const Grievances = lazy(() => import("./pages/Grievances"));
const Downloads = lazy(() => import("./pages/Downloads"));
const NewsViews = lazy(() => import("./pages/NewsViews"));
const Faqs = lazy(() => import("./pages/Faqs"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Careers = lazy(() => import("./pages/Careers"));
const Partner = lazy(() => import("./pages/Partner"));
const Donate = lazy(() => import("./pages/Donate"));
const Contact = lazy(() => import("./pages/Contact"));
const PageDetail = lazy(() => import("./pages/PageDetail"));
const AllPages = lazy(() => import("./pages/AllPages"));
const AdminFlashNews = lazy(() => import("./pages/AdminFlashNews"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminEditHome = lazy(() => import("./pages/AdminEditHome"));
const AdminEditPages = lazy(() => import("./pages/AdminEditPages"));
const AdminTeam = lazy(() => import("./pages/AdminTeam"));
const AdminPrograms = lazy(() => import("./pages/AdminPrograms"));
const AdminReels = lazy(() => import("./pages/AdminReels"));
const AdminTestimonials = lazy(() => import("./pages/AdminTestimonials"));
const AdminAboutPages = lazy(() => import("./pages/AdminAboutPages"));
const AdminPolavaram = lazy(() => import("./pages/AdminPolavaram"));
const AdminLaRr = lazy(() => import("./pages/AdminLaRr"));
const AdminLaRrSections = lazy(() => import("./pages/AdminLaRrSections"));
const AdminLarrSectionsManager = lazy(() => import("./pages/AdminLarrSectionsManager"));
const AdminRofr = lazy(() => import("./pages/AdminRofr"));
const AdminFloodRelief = lazy(() => import("./pages/AdminFloodRelief"));
const AdminAchievements = lazy(() => import("./pages/AdminAchievements"));
const AdminAllPages = lazy(() => import("./pages/AdminAllPages"));
const AdminStories = lazy(() => import("./pages/AdminStories"));
const AdminNews = lazy(() => import("./pages/AdminNews"));
const AdminGallery = lazy(() => import("./pages/AdminGallery"));
const AdminCareers = lazy(() => import("./pages/AdminCareers"));
const AdminPartner = lazy(() => import("./pages/AdminPartner"));
const AdminContact = lazy(() => import("./pages/AdminContact"));
const AdminDonate = lazy(() => import("./pages/AdminDonate"));
const AdminChatbot = lazy(() => import("./pages/AdminChatbot"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function RouteFallback() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <span className="route-loading-spinner" />
      <span className="route-loading-text">Loading…</span>
    </div>
  );
}

function PublicLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/governing-body" element={<GoverningBody />} />
          <Route path="/team" element={<GoverningBody />} />
          <Route path="/vision-mission-2" element={<VisionMission />} />
          <Route path="/core-values" element={<CoreValues />} />
          <Route path="/organizational-profile" element={<OrganizationalProfile />} />
          <Route path="/organogram" element={<Organogram />} />
          <Route path="/alert-policies" element={<AlertPolicies />} />
          <Route path="/area-of-operation" element={<AreaOfOperation />} />
          <Route path="/flood-relief-measures" element={<FloodRelief />} />
          <Route path="/2023-2" element={<FloodRelief2023 />} />
          <Route path="/flood-relief-measures-2022" element={<FloodRelief2022 />} />
          <Route path="/flood-relief-measures-2021-2" element={<FloodRelief2021 />} />
          <Route path="/flood-relief-measures-2020" element={<FloodRelief2020 />} />
          <Route path="/blankets-distribution-in-east-godavari" element={<BlanketsDistributionEastGodavari />} />
          <Route path="/groceries-distribution-in-west-godavari" element={<GroceriesDistributionWestGodavari />} />
          <Route path="/about" element={<About />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/la-rr" element={<PolavaramLaRr />} />
          <Route path="/grievances" element={<Grievances />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/news" element={<NewsViews />} />
          <Route path="/news-views" element={<NewsViews />} />
          <Route path="/faqs" element={<Faqs />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery-9" element={<Gallery />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/donate-now" element={<Donate />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/quick-links" element={<PageDetail />} />
          <Route path="/all-pages" element={<AllPages />} />
          <Route path="/page/:slug" element={<PageDetail />} />
          {/* Dynamic content rendering for all 90 original page slugs */}
          <Route path="/:slug" element={<PageDetail />} />
          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      {isHome ? <FloatingContactActions /> : <Chatbot />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* ── Admin routes: NO navbar / footer ── */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/edit-home" element={<AdminEditHome />} />
          <Route path="/admin/pages" element={<AdminEditPages />} />
          <Route path="/admin/flash-news" element={<AdminFlashNews />} />
          <Route path="/admin/team" element={<AdminTeam />} />
          <Route path="/admin/programs" element={<AdminPrograms />} />
          <Route path="/admin/reels" element={<AdminReels />} />
          <Route path="/admin/testimonials" element={<AdminTestimonials />} />
          <Route path="/admin/about-pages" element={<AdminAboutPages />} />
          <Route path="/admin/about" element={<AdminAboutPages />} />
          <Route path="/admin/polavaram" element={<AdminPolavaram />} />
          <Route path="/admin/polavaram-project" element={<AdminPolavaram />} />
          <Route path="/admin/la-rr" element={<AdminLaRr />} />
          <Route path="/admin/la-rr-sections" element={<AdminLaRrSections />} />
          <Route path="/admin/larr" element={<AdminLarrSectionsManager />} />
          <Route path="/admin/larr-sections" element={<AdminLarrSectionsManager />} />
          <Route path="/admin/larr" element={<AdminLaRr />} />
          <Route path="/admin/legal-compliances" element={<Navigate to="/admin/la-rr?slug=legal-compliances" replace />} />
          <Route path="/admin/cases" element={<Navigate to="/admin/la-rr?slug=cases" replace />} />
          <Route path="/admin/court-cases" element={<Navigate to="/admin/la-rr?slug=cases" replace />} />
          <Route path="/admin/rofr" element={<AdminRofr />} />
          <Route path="/admin/rofr-ltr" element={<Navigate to="/admin/rofr" replace />} />
          <Route path="/admin/abstract-rofr" element={<Navigate to="/admin/rofr?slug=abstract-rofr" replace />} />
          <Route path="/admin/reasons-for-rejections" element={<Navigate to="/admin/rofr?slug=reasons-for-rejections" replace />} />
          <Route path="/admin/compendium-of-judgements-rofr" element={<Navigate to="/admin/rofr?slug=compendium-of-judgements-rofr" replace />} />
          <Route path="/admin/rofr-g-os" element={<Navigate to="/admin/rofr?slug=rofr-g-os" replace />} />
          <Route path="/admin/ltr" element={<Navigate to="/admin/rofr?slug=ltr" replace />} />
          <Route path="/admin/ltr-asr" element={<Navigate to="/admin/rofr?slug=ltr" replace />} />
          <Route path="/admin/ltr-eluru" element={<Navigate to="/admin/rofr?slug=ltr-eluru" replace />} />
          <Route path="/admin/ltr-disposal-meanings" element={<Navigate to="/admin/rofr?slug=ltr-disposal-meanings" replace />} />
          <Route path="/admin/flood-relief" element={<AdminFloodRelief />} />
          <Route path="/admin/relief" element={<Navigate to="/admin/flood-relief" replace />} />
          <Route path="/admin/flood-relief-measures" element={<Navigate to="/admin/flood-relief?slug=flood-relief-measures" replace />} />
          <Route path="/admin/2023-2" element={<Navigate to="/admin/flood-relief?slug=2023-2" replace />} />
          <Route path="/admin/flood-relief-measures-2022" element={<Navigate to="/admin/flood-relief?slug=flood-relief-measures-2022" replace />} />
          <Route path="/admin/flood-relief-measures-2021-2" element={<Navigate to="/admin/flood-relief?slug=flood-relief-measures-2021-2" replace />} />
          <Route path="/admin/flood-relief-measures-2020" element={<Navigate to="/admin/flood-relief?slug=flood-relief-measures-2020" replace />} />
          <Route path="/admin/blankets-distribution-in-east-godavari" element={<Navigate to="/admin/flood-relief?slug=blankets-distribution-in-east-godavari" replace />} />
          <Route path="/admin/groceries-distribution-in-west-godavari" element={<Navigate to="/admin/flood-relief?slug=groceries-distribution-in-west-godavari" replace />} />
          <Route path="/admin/achievements" element={<AdminAchievements />} />
          <Route path="/admin/child-interventions" element={<Navigate to="/admin/achievements?slug=child-interventions" replace />} />
          <Route path="/admin/child-bare-acts" element={<Navigate to="/admin/achievements?slug=child-bare-acts" replace />} />
          <Route path="/admin/reports" element={<Navigate to="/admin/achievements?slug=reports" replace />} />
          <Route path="/admin/portfolio-3" element={<Navigate to="/admin/achievements?slug=portfolio-3" replace />} />
          <Route path="/admin/portfolio" element={<Navigate to="/admin/achievements?slug=portfolio-3" replace />} />
          <Route path="/admin/all-pages" element={<AdminAllPages />} />
          <Route path="/admin/all-pages-repo" element={<Navigate to="/admin/all-pages" replace />} />
          <Route path="/admin/stories" element={<AdminStories />} />
          <Route path="/admin/stories-of-change" element={<Navigate to="/admin/stories" replace />} />
          <Route path="/admin/news" element={<AdminNews />} />
          <Route path="/admin/news-views" element={<Navigate to="/admin/news" replace />} />
          <Route path="/admin/gallery" element={<AdminGallery />} />
          <Route path="/admin/gallery-9" element={<Navigate to="/admin/gallery" replace />} />
          <Route path="/admin/videos-images" element={<Navigate to="/admin/gallery" replace />} />
          <Route path="/admin/media" element={<Navigate to="/admin/gallery" replace />} />
          <Route path="/admin/careers" element={<AdminCareers />} />
          <Route path="/admin/careers-page" element={<Navigate to="/admin/careers" replace />} />
          <Route path="/admin/jobs" element={<Navigate to="/admin/careers" replace />} />
          <Route path="/admin/recruitment" element={<Navigate to="/admin/careers" replace />} />
          <Route path="/admin/partner" element={<AdminPartner />} />
          <Route path="/admin/partner-with-us" element={<Navigate to="/admin/partner" replace />} />
          <Route path="/admin/grievances" element={<Navigate to="/admin/partner?tab=grievances" replace />} />
          <Route path="/admin/grievance-pages" element={<Navigate to="/admin/partner?tab=grievance_pages" replace />} />
          <Route path="/admin/abstract" element={<Navigate to="/admin/partner?tab=grievance_pages&slug=abstract" replace />} />
          <Route path="/admin/rr-grievances" element={<Navigate to="/admin/partner?tab=grievance_pages&slug=rr-grievances" replace />} />
          <Route path="/admin/types-of-grievances" element={<Navigate to="/admin/partner?tab=grievance_pages&slug=types-of-grievances" replace />} />
          <Route path="/admin/rr-grievance-full-forms" element={<Navigate to="/admin/partner?tab=grievance_pages&slug=rr-grievance-full-forms" replace />} />
          <Route path="/admin/downloads" element={<Navigate to="/admin/partner?tab=downloads" replace />} />
          <Route path="/admin/download-pages" element={<Navigate to="/admin/partner?tab=download_pages" replace />} />
          <Route path="/admin/legislative-acts-2" element={<Navigate to="/admin/partner?tab=download_pages&slug=legislative-acts-2" replace />} />
          <Route path="/admin/gos" element={<Navigate to="/admin/partner?tab=download_pages&slug=gos" replace />} />
          <Route path="/admin/rr-gos" element={<Navigate to="/admin/partner?tab=download_pages&slug=rr-gos" replace />} />
          <Route path="/admin/others" element={<Navigate to="/admin/partner?tab=download_pages&slug=others" replace />} />
          <Route path="/admin/quick-links" element={<Navigate to="/admin/partner?tab=quick_links" replace />} />
          <Route path="/admin/faqs" element={<Navigate to="/admin/partner?tab=faqs" replace />} />
          <Route path="/admin/contact" element={<AdminContact />} />
          <Route path="/admin/contact-us" element={<Navigate to="/admin/contact" replace />} />
          <Route path="/admin/leads" element={<Navigate to="/admin/contact" replace />} />
          <Route path="/admin/donate" element={<AdminDonate />} />
          <Route path="/admin/donations" element={<Navigate to="/admin/donate" replace />} />
          <Route path="/admin/chatbot" element={<AdminChatbot />} />
          <Route path="/admin/chatbot-api" element={<Navigate to="/admin/chatbot" replace />} />
          <Route path="/admin/api-key" element={<Navigate to="/admin/chatbot" replace />} />
          <Route path="/admin/api-keys" element={<Navigate to="/admin/chatbot" replace />} />

          {/* ── Public routes: with Navbar + Footer ── */}
          <Route path="*" element={<PublicLayout />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
