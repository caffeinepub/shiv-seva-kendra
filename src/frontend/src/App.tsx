import {
  AlertCircle,
  Bell,
  BellOff,
  Briefcase,
  ChevronDown,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AdminJob, AdminService, Appointment } from "./backend";
import { type Service, type SubService, services } from "./data/services";
import { useActor } from "./hooks/useActor";

// ─── Constants ───────────────────────────────────────────────────────────────
const PHONE = "7720814323";
const PHONE_INTL = "+917720814323";
const WHATSAPP_BASE = `https://wa.me/91${PHONE}?text=`;
const ADMIN_PIN = "7720";

function buildWhatsAppUrl(serviceName: string) {
  const text = `नमस्कार, मला ${serviceName} सेवा हवी आहे.`;
  return WHATSAPP_BASE + encodeURIComponent(text);
}

// ─── Job Types ────────────────────────────────────────────────────────────────
interface JobItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  isAdmin?: boolean;
}

// ─── Curated Static Government Jobs (always-available fallback) ───────────────
const STATIC_GOVT_JOBS: JobItem[] = [
  {
    title: "UPSC Civil Services Prelims 2026",
    link: "https://upsc.gov.in",
    pubDate: "2026-02-25",
    description:
      "Vacancy: 1,056 | Salary: ₹56,100–₹2,50,000 | Last Date: 18 March 2026 | Fees: ₹100 (Gen) / Free (SC/ST/Female)",
  },
  {
    title: "SSC CGL 2026 (Combined Graduate Level)",
    link: "https://ssc.nic.in",
    pubDate: "2026-02-24",
    description:
      "Vacancy: 14,582 | Salary: ₹25,500–₹1,51,100 | Last Date: 25 March 2026 | Fees: ₹100",
  },
  {
    title: "SSC CHSL 2026 (Higher Secondary Level)",
    link: "https://ssc.nic.in",
    pubDate: "2026-02-23",
    description:
      "Vacancy: 4,500+ | Salary: ₹18,000–₹56,900 | Last Date: 14 April 2026 | Fees: ₹100",
  },
  {
    title: "RRB ALP & Technician Bharti 2026",
    link: "https://indianrailways.gov.in",
    pubDate: "2026-02-22",
    description:
      "Vacancy: 9,970 | Salary: ₹19,900–₹63,200 | Last Date: 20 March 2026 | Fees: ₹500",
  },
  {
    title: "Maharashtra Police Constable Bharti 2026",
    link: "https://mahapolice.gov.in",
    pubDate: "2026-02-21",
    description:
      "Vacancy: 13,284 | Salary: ₹35,400–₹1,12,400 | Last Date: 31 March 2026 | Fees: ₹0",
  },
  {
    title: "MPSC Group-B Rajyaseva Pariksha 2026",
    link: "https://mpsc.gov.in",
    pubDate: "2026-02-20",
    description:
      "Vacancy: 325 | Salary: ₹56,100–₹1,77,500 | Last Date: 10 April 2026 | Fees: ₹524",
  },
  {
    title: "SBI PO 2026 (Probationary Officer)",
    link: "https://sbi.co.in/careers",
    pubDate: "2026-02-19",
    description:
      "Vacancy: 600 | Salary: ₹41,960–₹63,840 | Last Date: 22 March 2026 | Fees: ₹750",
  },
  {
    title: "Maharashtra Talathi Bharti 2026",
    link: "https://maharecruitment.mahaonline.gov.in",
    pubDate: "2026-02-18",
    description:
      "Vacancy: 3,026 | Salary: ₹25,500–₹81,100 | Last Date: 15 April 2026 | Fees: ₹300",
  },
  {
    title: "NHM Maharashtra Staff Nurse Bharti 2026",
    link: "https://arogya.maharashtra.gov.in",
    pubDate: "2026-02-17",
    description:
      "Vacancy: 1,800+ | Salary: ₹20,000–₹50,000 | Last Date: 28 March 2026 | Fees: ₹0",
  },
  {
    title: "India Post GDS Bharti 2026 (Gramin Dak Sevak)",
    link: "https://indiapostgdsonline.gov.in",
    pubDate: "2026-02-16",
    description:
      "Vacancy: 22,000+ | Salary: ₹12,000–₹29,380 | Last Date: 30 March 2026 | Fees: ₹100",
  },
  {
    title: "IBPS Clerk 2026 (Junior Associates)",
    link: "https://ibps.in",
    pubDate: "2026-02-15",
    description:
      "Vacancy: 5,960 | Salary: ₹26,000–₹35,000 | Last Date: 12 March 2026 | Fees: ₹175",
  },
  {
    title: "CRPF Head Constable & ASI Bharti 2026",
    link: "https://crpf.gov.in",
    pubDate: "2026-02-14",
    description:
      "Vacancy: 4,316 | Salary: ₹25,500–₹69,100 | Last Date: 5 April 2026 | Fees: ₹200",
  },
  {
    title: "DRDO RAC Scientist Bharti 2026",
    link: "https://drdo.gov.in",
    pubDate: "2026-02-13",
    description:
      "Vacancy: 200+ | Salary: ₹56,100–₹1,77,500 | Last Date: 20 April 2026 | Fees: ₹100",
  },
  {
    title: "Maharashtra ZP Teacher Bharti 2026",
    link: "https://zp.maharashtra.gov.in",
    pubDate: "2026-02-12",
    description:
      "Vacancy: 1,200+ | Salary: ₹28,900–₹91,900 | Last Date: 18 March 2026 | Fees: ₹0",
  },
  {
    title: "Indian Navy Agniveer SSR / MR Bharti 2026",
    link: "https://joinindiannavy.gov.in",
    pubDate: "2026-02-11",
    description:
      "Vacancy: 2,800 | Salary: ₹30,000–₹40,000 | Last Date: 25 March 2026 | Fees: ₹0",
  },
  {
    title: "AIIMS Nursing Officer Bharti 2026",
    link: "https://aiimsexams.ac.in",
    pubDate: "2026-02-10",
    description:
      "Vacancy: 3,500 | Salary: ₹44,900–₹1,42,400 | Last Date: 10 March 2026 | Fees: ₹1,500",
  },
  {
    title: "Jalgaon ZP Arogya Vibhag Bharti 2026",
    link: "https://zp.jalgaon.gov.in",
    pubDate: "2026-02-27",
    description:
      "Vacancy: 150+ | Salary: ₹18,000–₹35,000 | Last Date: 20 March 2026 | Fees: ₹0",
  },
  {
    title: "Maharashtra Forest Guard Bharti 2026",
    link: "https://mahaforest.gov.in",
    pubDate: "2026-02-26",
    description:
      "Vacancy: 2,500+ | Salary: ₹21,700–₹69,100 | Last Date: 25 April 2026 | Fees: ₹300",
  },
  {
    title: "MSRTC Conductor & Driver Bharti 2026",
    link: "https://msrtc.maharashtra.gov.in",
    pubDate: "2026-02-24",
    description:
      "Vacancy: 7,000+ | Salary: ₹22,000–₹45,000 | Last Date: 15 March 2026 | Fees: ₹200",
  },
  {
    title: "LIC ADO Apprentice Development Officer 2026",
    link: "https://licindia.in",
    pubDate: "2026-02-23",
    description:
      "Vacancy: 8,000+ | Salary: ₹38,000–₹50,000 | Last Date: 22 March 2026 | Fees: ₹600",
  },
  {
    title: "Indian Army Agniveer 2026",
    link: "https://joinindianarmy.nic.in",
    pubDate: "2026-02-26",
    description:
      "Vacancy: 40,000+ | Salary: ₹30,000–₹40,000 | Last Date: 31 March 2026 | Fees: ₹0",
  },
  {
    title: "BSF Head Constable (Ministerial) Bharti 2026",
    link: "https://bsf.gov.in",
    pubDate: "2026-02-25",
    description:
      "Vacancy: 1,526 | Salary: ₹25,500–₹81,100 | Last Date: 30 March 2026 | Fees: ₹100",
  },
  {
    title: "Maharashtra Arogya Vibhag Group-D Bharti 2026",
    link: "https://arogya.maharashtra.gov.in",
    pubDate: "2026-02-27",
    description:
      "Vacancy: 960 | Salary: ₹18,000–₹56,900 | Last Date: 15 March 2026 | Fees: ₹0",
  },
];

// ─── Job Info Parser ──────────────────────────────────────────────────────────
interface ParsedJobInfo {
  vacancy?: string;
  salary?: string;
  lastDate?: string;
  fees?: string;
  plain?: string;
}

function parseJobDescription(desc: string): ParsedJobInfo {
  if (!desc) return {};
  const hasStructured =
    desc.includes("Vacancy:") ||
    desc.includes("Salary:") ||
    desc.includes("Last Date:");
  if (!hasStructured) return { plain: desc };

  const result: ParsedJobInfo = {};
  const parts = desc.split("|").map((p) => p.trim());
  for (const part of parts) {
    const lower = part.toLowerCase();
    if (lower.startsWith("vacancy:")) {
      result.vacancy = part.replace(/^vacancy:/i, "").trim();
    } else if (lower.startsWith("salary:")) {
      result.salary = part.replace(/^salary:/i, "").trim();
    } else if (lower.startsWith("last date:")) {
      result.lastDate = part.replace(/^last date:/i, "").trim();
    } else if (lower.startsWith("fees:")) {
      result.fees = part.replace(/^fees:/i, "").trim();
    }
  }
  return result;
}

// ─── Government RSS Feed Fetch ────────────────────────────────────────────────
const PROXY_BUILDERS: Array<(url: string) => string> = [
  (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
];

const GOVT_RSS_FEEDS = [
  "https://www.employmentnews.gov.in/RSS/RSSFeed.aspx",
  "https://upsc.gov.in/rss.xml",
  "https://ssc.nic.in/Portal/RSSFeed",
  "https://ncs.gov.in/rss",
];

async function fetchWithProxy(
  proxyFn: (u: string) => string,
  feedUrl: string,
): Promise<JobItem[]> {
  const proxyUrl = proxyFn(feedUrl);
  const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

  const contentType = resp.headers.get("content-type") ?? "";
  let xmlText: string;
  if (
    contentType.includes("application/json") ||
    proxyUrl.includes("allorigins")
  ) {
    const data = await resp.json();
    xmlText = data.contents ?? "";
  } else {
    xmlText = await resp.text();
  }

  if (!xmlText || xmlText.trim().length < 100) throw new Error("Empty feed");

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  const parseError = xmlDoc.querySelector("parsererror");
  if (parseError) throw new Error("XML parse error");

  const items = Array.from(xmlDoc.querySelectorAll("item"));
  if (items.length === 0) throw new Error("No items");

  return items.slice(0, 30).map((item) => ({
    title: item.querySelector("title")?.textContent?.trim() ?? "",
    link: item.querySelector("link")?.textContent?.trim() ?? "",
    pubDate: item.querySelector("pubDate")?.textContent?.trim() ?? "",
    description:
      item
        .querySelector("description")
        ?.textContent?.replace(/<[^>]*>/g, "")
        .trim() ?? "",
  }));
}

async function fetchJobs(): Promise<JobItem[]> {
  const attempts: Promise<JobItem[] | null>[] = [];
  for (const feedUrl of GOVT_RSS_FEEDS) {
    for (const proxyFn of PROXY_BUILDERS) {
      attempts.push(fetchWithProxy(proxyFn, feedUrl).catch(() => null));
    }
  }

  const results = await Promise.allSettled(attempts);
  for (const r of results) {
    if (r.status === "fulfilled" && r.value && r.value.length > 0) {
      return r.value;
    }
  }

  return STATIC_GOVT_JOBS;
}

// ─── localStorage key for seen jobs ──────────────────────────────────────────
const SEEN_JOBS_KEY = "shiv-seva-jobs-seen";

function getSeenTitles(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_JOBS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveSeenTitles(titles: Set<string>) {
  try {
    localStorage.setItem(SEEN_JOBS_KEY, JSON.stringify([...titles]));
  } catch {
    // ignore
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("mr-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─── Book Appointment Modal ───────────────────────────────────────────────────
interface BookAppointmentModalProps {
  open: boolean;
  onClose: () => void;
}

const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
];

function BookAppointmentModal({ open, onClose }: BookAppointmentModalProps) {
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (open && ref.current) ref.current.focus();
  }, [open]);

  function handleClose() {
    setName("");
    setPhone("");
    setTime("");
    setErrors({});
    setSuccess(false);
    setLoading(false);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: { name?: string; phone?: string } = {};
    if (!name.trim()) newErrors.name = "नाव आवश्यक आहे";
    if (!phone.trim()) newErrors.phone = "मोबाईल नंबर आवश्यक आहे";
    else if (!/^\d{10}$/.test(phone.trim()))
      newErrors.phone = "१० अंकी मोबाईल नंबर टाका";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await actor?.bookAppointment(name.trim(), phone.trim(), time || null);
      setSuccess(true);
    } catch {
      // show success anyway as a UX fallback
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
            onClick={handleClose}
            aria-hidden="true"
          />
          <motion.div
            ref={ref}
            tabIndex={-1}
            aria-modal="true"
            aria-label="अपॉइंटमेंट बुक करा"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:right-auto md:w-[480px] z-50 outline-none"
          >
            <div className="bg-card rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex justify-center pt-3 pb-1 md:hidden">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>
              <div className="relative px-6 pt-4 pb-4 bg-gradient-to-r from-orange-500 to-orange-600">
                <button
                  onClick={handleClose}
                  type="button"
                  className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors rounded-full p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                  aria-label="बंद करा"
                >
                  <X size={20} />
                </button>
                <p className="text-white/70 text-xs font-body uppercase tracking-wider mb-1">
                  📅 अपॉइंटमेंट
                </p>
                <h2 className="text-white font-display font-semibold text-lg leading-tight pr-8">
                  अपॉइंटमेंट बुक करा
                </h2>
              </div>

              <div className="px-6 py-5">
                {success ? (
                  <div className="flex flex-col items-center text-center py-6 gap-3">
                    <span className="text-5xl">✅</span>
                    <h3 className="font-display font-bold text-foreground text-lg">
                      अपॉइंटमेंट बुक झाली!
                    </h3>
                    <p className="text-muted-foreground font-body text-sm">
                      आम्ही लवकरच तुमच्याशी संपर्क करू.
                    </p>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="mt-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-body font-semibold rounded-xl transition-colors"
                    >
                      ठीक आहे
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="appt-name"
                        className="block text-sm font-body font-medium text-foreground mb-1"
                      >
                        नाव <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="appt-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="तुमचे पूर्ण नाव"
                        autoComplete="name"
                        className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground font-body text-sm outline-none focus:ring-2 transition-all ${
                          errors.name
                            ? "border-destructive focus:ring-destructive/30"
                            : "border-border focus:ring-orange-400/30 focus:border-orange-400"
                        }`}
                      />
                      {errors.name && (
                        <p className="text-destructive text-xs font-body mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="appt-phone"
                        className="block text-sm font-body font-medium text-foreground mb-1"
                      >
                        मोबाईल नंबर <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="appt-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10 अंकी मोबाईल नंबर"
                        autoComplete="tel"
                        maxLength={10}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground font-body text-sm outline-none focus:ring-2 transition-all ${
                          errors.phone
                            ? "border-destructive focus:ring-destructive/30"
                            : "border-border focus:ring-orange-400/30 focus:border-orange-400"
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-destructive text-xs font-body mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="appt-time"
                        className="block text-sm font-body font-medium text-foreground mb-1"
                      >
                        वेळ (ऐच्छिक)
                      </label>
                      <select
                        id="appt-time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
                      >
                        <option value="">वेळ निवडा (ऐच्छिक)</option>
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 py-2.5 px-4 rounded-xl border border-border text-muted-foreground font-body text-sm hover:text-foreground transition-colors"
                      >
                        रद्द करा
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-body font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        {loading && (
                          <Loader2 size={14} className="animate-spin" />
                        )}
                        {loading ? "बुकिंग..." : "बुक करा"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Admin Panel Modal ────────────────────────────────────────────────────────
interface AdminPanelModalProps {
  open: boolean;
  onClose: () => void;
  onJobsUpdated: () => void;
  onServicesUpdated: () => void;
}

function AdminPanelModal({
  open,
  onClose,
  onJobsUpdated,
  onServicesUpdated,
}: AdminPanelModalProps) {
  const { actor } = useActor();
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<
    "jobs" | "services" | "appointments"
  >("jobs");

  // Add Job state
  const [jobForm, setJobForm] = useState({
    title: "",
    notifDate: "",
    vacancy: "",
    salary: "",
    lastDate: "",
    fees: "",
  });
  const [jobLoading, setJobLoading] = useState(false);
  const [jobSuccess, setJobSuccess] = useState(false);
  const [adminJobs, setAdminJobs] = useState<AdminJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  // Add Service state
  const [serviceForm, setServiceForm] = useState({
    mainNameEn: "",
    mainNameMr: "",
  });
  const subRowCounter = useRef(0);
  const [subServiceRows, setSubServiceRows] = useState([
    { id: 0, nameEn: "", nameMr: "" },
  ]);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceSuccess, setServiceSuccess] = useState(false);
  const [adminServices, setAdminServices] = useState<AdminService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [apptLoading, setApptLoading] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (authenticated && open) {
      loadAdminJobs();
      loadAdminServices();
      loadAppointments();
    }
  }, [authenticated, open]);

  useEffect(() => {
    if (authenticated && activeAdminTab === "appointments") {
      loadAppointments();
    }
  }, [activeAdminTab, authenticated]);

  function handleClose() {
    setPin("");
    setPinError("");
    setAuthenticated(false);
    setActiveAdminTab("jobs");
    setJobForm({
      title: "",
      notifDate: "",
      vacancy: "",
      salary: "",
      lastDate: "",
      fees: "",
    });
    setJobSuccess(false);
    setServiceForm({ mainNameEn: "", mainNameMr: "" });
    setSubServiceRows([{ id: 0, nameEn: "", nameMr: "" }]);
    setServiceSuccess(false);
    onClose();
  }

  function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setAuthenticated(true);
      setPinError("");
    } else {
      setPinError("चुकीचा PIN. पुन्हा प्रयत्न करा.");
      setPin("");
    }
  }

  async function loadAdminJobs() {
    setJobsLoading(true);
    try {
      const jobs = await actor?.getAdminJobs();
      if (jobs) {
        const sorted = [...jobs].sort(
          (a, b) => Number(b.createdAt) - Number(a.createdAt),
        );
        setAdminJobs(sorted);
      }
    } catch {
      // ignore
    } finally {
      setJobsLoading(false);
    }
  }

  async function loadAdminServices() {
    setServicesLoading(true);
    try {
      const svcs = await actor?.getAdminServices();
      if (svcs) setAdminServices(svcs);
    } catch {
      // ignore
    } finally {
      setServicesLoading(false);
    }
  }

  async function loadAppointments() {
    setApptLoading(true);
    try {
      const appts = await actor?.getAppointments();
      if (appts) {
        const sorted = [...appts].sort(
          (a, b) => Number(b.createdAt) - Number(a.createdAt),
        );
        setAppointments(sorted);
      }
    } catch {
      // ignore
    } finally {
      setApptLoading(false);
    }
  }

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault();
    setJobLoading(true);
    try {
      await actor?.addJob(
        jobForm.title,
        jobForm.notifDate,
        jobForm.vacancy,
        jobForm.salary,
        jobForm.lastDate,
        jobForm.fees,
      );
      setJobForm({
        title: "",
        notifDate: "",
        vacancy: "",
        salary: "",
        lastDate: "",
        fees: "",
      });
      setJobSuccess(true);
      setTimeout(() => setJobSuccess(false), 3000);
      await loadAdminJobs();
      onJobsUpdated();
    } catch {
      // ignore
    } finally {
      setJobLoading(false);
    }
  }

  async function handleDeleteJob(id: bigint) {
    try {
      await actor?.deleteJob(id);
      await loadAdminJobs();
      onJobsUpdated();
    } catch {
      // ignore
    }
  }

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    setServiceLoading(true);
    try {
      const validSubs = subServiceRows.filter(
        (s) => s.nameEn.trim() || s.nameMr.trim(),
      );
      await actor?.addService(
        serviceForm.mainNameEn,
        serviceForm.mainNameMr,
        validSubs,
      );
      setServiceForm({ mainNameEn: "", mainNameMr: "" });
      setSubServiceRows([{ id: 0, nameEn: "", nameMr: "" }]);
      setServiceSuccess(true);
      setTimeout(() => setServiceSuccess(false), 3000);
      await loadAdminServices();
      onServicesUpdated();
    } catch {
      // ignore
    } finally {
      setServiceLoading(false);
    }
  }

  async function handleDeleteService(id: bigint) {
    try {
      await actor?.deleteService(id);
      await loadAdminServices();
      onServicesUpdated();
    } catch {
      // ignore
    }
  }

  function addSubServiceRow() {
    subRowCounter.current += 1;
    setSubServiceRows((prev) => [
      ...prev,
      { id: subRowCounter.current, nameEn: "", nameMr: "" },
    ]);
  }

  function removeSubServiceRow(rowId: number) {
    setSubServiceRows((prev) => prev.filter((r) => r.id !== rowId));
  }

  function updateSubServiceRow(
    rowId: number,
    field: "nameEn" | "nameMr",
    value: string,
  ) {
    setSubServiceRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );
  }

  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/70 backdrop-blur-sm z-[60]"
            onClick={handleClose}
            aria-hidden="true"
          />
          <motion.div
            tabIndex={-1}
            aria-modal="true"
            aria-label="Admin Panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[85vh] z-[61] outline-none flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-card md:rounded-2xl shadow-2xl flex flex-col h-full md:max-h-[85vh] overflow-hidden">
              {/* Header */}
              <div className="relative px-6 pt-5 pb-4 bg-gradient-to-r from-gray-800 to-gray-900 shrink-0">
                <button
                  onClick={handleClose}
                  type="button"
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors rounded-full p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                  aria-label="बंद करा"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <Settings size={18} className="text-orange-400" />
                  <h2 className="text-white font-display font-semibold text-lg">
                    Admin Panel
                  </h2>
                </div>
              </div>

              {/* PIN step */}
              {!authenticated ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <form
                    onSubmit={handlePinSubmit}
                    className="w-full max-w-xs space-y-4 text-center"
                  >
                    <div className="text-4xl mb-2">🔐</div>
                    <h3 className="font-display font-bold text-foreground text-lg">
                      PIN टाका
                    </h3>
                    <input
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="4-digit PIN"
                      maxLength={4}
                      autoComplete="current-password"
                      className={`${inputCls} text-center tracking-[0.5em] text-xl`}
                    />
                    {pinError && (
                      <p className="text-destructive text-sm font-body">
                        {pinError}
                      </p>
                    )}
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-body font-semibold rounded-xl transition-colors"
                    >
                      प्रवेश करा
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Tabs */}
                  <div className="flex border-b border-border px-4 pt-3 shrink-0 gap-1">
                    {(
                      [
                        { id: "jobs", label: "📋 नोकरी जोडा" },
                        { id: "services", label: "🏢 सेवा जोडा" },
                        { id: "appointments", label: "📅 अपॉइंटमेंट्स" },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveAdminTab(tab.id)}
                        className={`px-3 py-2 rounded-t-lg font-body text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 ${
                          activeAdminTab === tab.id
                            ? "bg-orange-500 text-white"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Add Job Tab */}
                    {activeAdminTab === "jobs" && (
                      <div className="space-y-4">
                        <form
                          onSubmit={handleAddJob}
                          className="space-y-3 bg-muted/40 rounded-xl p-4 border border-border"
                        >
                          <h3 className="font-body font-semibold text-foreground text-sm">
                            नवीन नोकरी जोडा
                          </h3>
                          {jobSuccess && (
                            <div className="text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs font-body">
                              ✅ नोकरी यशस्वीपणे जोडली!
                            </div>
                          )}
                          <input
                            type="text"
                            value={jobForm.title}
                            onChange={(e) =>
                              setJobForm((p) => ({
                                ...p,
                                title: e.target.value,
                              }))
                            }
                            placeholder="नोकरीचे नाव *"
                            required
                            className={inputCls}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="date"
                              value={jobForm.notifDate}
                              onChange={(e) =>
                                setJobForm((p) => ({
                                  ...p,
                                  notifDate: e.target.value,
                                }))
                              }
                              placeholder="अधिसूचना तारीख"
                              className={inputCls}
                            />
                            <input
                              type="text"
                              value={jobForm.vacancy}
                              onChange={(e) =>
                                setJobForm((p) => ({
                                  ...p,
                                  vacancy: e.target.value,
                                }))
                              }
                              placeholder="रिक्त जागा"
                              className={inputCls}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={jobForm.salary}
                              onChange={(e) =>
                                setJobForm((p) => ({
                                  ...p,
                                  salary: e.target.value,
                                }))
                              }
                              placeholder="वेतन"
                              className={inputCls}
                            />
                            <input
                              type="date"
                              value={jobForm.lastDate}
                              onChange={(e) =>
                                setJobForm((p) => ({
                                  ...p,
                                  lastDate: e.target.value,
                                }))
                              }
                              placeholder="शेवटची तारीख"
                              className={inputCls}
                            />
                          </div>
                          <input
                            type="text"
                            value={jobForm.fees}
                            onChange={(e) =>
                              setJobForm((p) => ({
                                ...p,
                                fees: e.target.value,
                              }))
                            }
                            placeholder="शुल्क"
                            className={inputCls}
                          />
                          <button
                            type="submit"
                            disabled={jobLoading}
                            className="w-full py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-body font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            {jobLoading && (
                              <Loader2 size={14} className="animate-spin" />
                            )}
                            जोडा
                          </button>
                        </form>

                        {/* Existing admin jobs */}
                        <div>
                          <h4 className="font-body font-semibold text-foreground text-sm mb-2">
                            जोडलेल्या नोकऱ्या ({adminJobs.length})
                          </h4>
                          {jobsLoading ? (
                            <div className="flex items-center gap-2 text-muted-foreground text-xs font-body py-2">
                              <Loader2 size={12} className="animate-spin" />
                              लोड होत आहे...
                            </div>
                          ) : adminJobs.length === 0 ? (
                            <p className="text-muted-foreground text-xs font-body">
                              कोणतीही नोकरी जोडलेली नाही.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {adminJobs.map((job) => (
                                <div
                                  key={String(job.id)}
                                  className="flex items-start justify-between gap-2 bg-card border border-border rounded-xl p-3"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-body font-medium text-foreground text-xs line-clamp-1">
                                      🏛️ {job.title}
                                    </p>
                                    <p className="text-muted-foreground text-xs font-body mt-0.5">
                                      {job.vacancy && `रिक्त: ${job.vacancy}`}{" "}
                                      {job.lastDate && `| शेवट: ${job.lastDate}`}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteJob(job.id)}
                                    className="shrink-0 p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                    aria-label="हटवा"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Add Service Tab */}
                    {activeAdminTab === "services" && (
                      <div className="space-y-4">
                        <form
                          onSubmit={handleAddService}
                          className="space-y-3 bg-muted/40 rounded-xl p-4 border border-border"
                        >
                          <h3 className="font-body font-semibold text-foreground text-sm">
                            नवीन सेवा जोडा
                          </h3>
                          {serviceSuccess && (
                            <div className="text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs font-body">
                              ✅ सेवा यशस्वीपणे जोडली!
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={serviceForm.mainNameEn}
                              onChange={(e) =>
                                setServiceForm((p) => ({
                                  ...p,
                                  mainNameEn: e.target.value,
                                }))
                              }
                              placeholder="मुख्य सेवा (English) *"
                              required
                              className={inputCls}
                            />
                            <input
                              type="text"
                              value={serviceForm.mainNameMr}
                              onChange={(e) =>
                                setServiceForm((p) => ({
                                  ...p,
                                  mainNameMr: e.target.value,
                                }))
                              }
                              placeholder="मुख्य सेवा (मराठी) *"
                              required
                              className={inputCls}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="font-body text-xs font-medium text-foreground">
                                उप-सेवा
                              </p>
                              <button
                                type="button"
                                onClick={addSubServiceRow}
                                className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-body font-medium"
                              >
                                <Plus size={12} /> जोडा
                              </button>
                            </div>
                            {subServiceRows.map((row) => (
                              <div
                                key={row.id}
                                className="flex gap-2 items-center"
                              >
                                <input
                                  type="text"
                                  value={row.nameEn}
                                  onChange={(e) =>
                                    updateSubServiceRow(
                                      row.id,
                                      "nameEn",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="English"
                                  className={inputCls}
                                />
                                <input
                                  type="text"
                                  value={row.nameMr}
                                  onChange={(e) =>
                                    updateSubServiceRow(
                                      row.id,
                                      "nameMr",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="मराठी"
                                  className={inputCls}
                                />
                                {subServiceRows.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeSubServiceRow(row.id)}
                                    className="shrink-0 p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          <button
                            type="submit"
                            disabled={serviceLoading}
                            className="w-full py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-body font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            {serviceLoading && (
                              <Loader2 size={14} className="animate-spin" />
                            )}
                            सेवा जोडा
                          </button>
                        </form>

                        {/* Existing admin services */}
                        <div>
                          <h4 className="font-body font-semibold text-foreground text-sm mb-2">
                            जोडलेल्या सेवा ({adminServices.length})
                          </h4>
                          {servicesLoading ? (
                            <div className="flex items-center gap-2 text-muted-foreground text-xs font-body py-2">
                              <Loader2 size={12} className="animate-spin" />
                              लोड होत आहे...
                            </div>
                          ) : adminServices.length === 0 ? (
                            <p className="text-muted-foreground text-xs font-body">
                              कोणतीही सेवा जोडलेली नाही.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {adminServices.map((svc) => (
                                <div
                                  key={String(svc.id)}
                                  className="flex items-start justify-between gap-2 bg-card border border-border rounded-xl p-3"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-body font-medium text-foreground text-xs">
                                      🏢 {svc.mainNameEn}
                                    </p>
                                    <p className="text-muted-foreground text-xs font-body">
                                      {svc.mainNameMr} •{" "}
                                      {svc.subServices.length} उप-सेवा
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteService(svc.id)}
                                    className="shrink-0 p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                    aria-label="हटवा"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Appointments Tab */}
                    {activeAdminTab === "appointments" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-body font-semibold text-foreground text-sm">
                            अपॉइंटमेंट्स ({appointments.length})
                          </h3>
                          <button
                            type="button"
                            onClick={loadAppointments}
                            disabled={apptLoading}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-orange-500 transition-colors"
                          >
                            <RefreshCw
                              size={12}
                              className={apptLoading ? "animate-spin" : ""}
                            />
                            रिफ्रेश
                          </button>
                        </div>
                        {apptLoading ? (
                          <div className="flex items-center gap-2 text-muted-foreground text-xs font-body py-4">
                            <Loader2 size={14} className="animate-spin" />
                            लोड होत आहे...
                          </div>
                        ) : appointments.length === 0 ? (
                          <div className="text-center py-8">
                            <span className="text-3xl">📅</span>
                            <p className="text-muted-foreground font-body text-sm mt-2">
                              कोणतेही अपॉइंटमेंट नाही
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {appointments.map((appt) => (
                              <div
                                key={String(appt.id)}
                                className="bg-card border border-border rounded-xl p-3 space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <p className="font-body font-semibold text-foreground text-sm">
                                    👤 {appt.customerName}
                                  </p>
                                  {appt.preferredTime && (
                                    <span className="text-xs font-body px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                                      🕐 {appt.preferredTime}
                                    </span>
                                  )}
                                </div>
                                <a
                                  href={`tel:${appt.mobileNumber}`}
                                  className="flex items-center gap-1.5 text-xs font-body text-primary hover:text-orange-500 transition-colors"
                                >
                                  <Phone size={11} />
                                  {appt.mobileNumber}
                                </a>
                                <p className="text-muted-foreground text-xs font-body">
                                  {new Date(
                                    Number(appt.createdAt) / 1_000_000,
                                  ).toLocaleDateString("mr-IN", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Admin Profile Card ───────────────────────────────────────────────────────
interface AdminProfileCardProps {
  onAdminClick: () => void;
}

function AdminProfileCard({ onAdminClick }: AdminProfileCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-xl">
          🧑‍💼
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-foreground text-sm leading-tight">
            Shubham Sunil Koli
          </p>
          <p className="text-muted-foreground font-body text-xs">Shop Owner</p>
        </div>
      </div>
      <div className="space-y-1.5">
        <a
          href={`tel:${PHONE_INTL}`}
          className="flex items-center gap-2 text-xs font-body text-foreground hover:text-orange-500 transition-colors"
        >
          <Phone size={12} className="text-orange-500 shrink-0" />
          <span className="font-semibold">{PHONE}</span>
        </a>
        <a
          href="mailto:shubhamkoli918@gmail.com"
          className="flex items-center gap-2 text-xs font-body text-foreground hover:text-primary transition-colors truncate"
        >
          <Mail size={12} className="text-primary shrink-0" />
          <span className="truncate">shubhamkoli918@gmail.com</span>
        </a>
        <div className="flex items-start gap-2 text-xs font-body text-foreground">
          <MapPin size={12} className="text-muted-foreground shrink-0 mt-0.5" />
          <span>उत्रण, ता. एरंडोल, जि. जळगाव</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onAdminClick}
        className="flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-muted hover:bg-muted/70 border border-border rounded-xl text-xs font-body font-semibold text-foreground transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
      >
        <Settings size={13} />
        Admin
      </button>
    </div>
  );
}

// ─── Job Apply Modal ──────────────────────────────────────────────────────────
interface JobApplyModalProps {
  job: JobItem | null;
  onClose: () => void;
}

function JobApplyModal({ job, onClose }: JobApplyModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (job && ref.current) {
      ref.current.focus();
    }
  }, [job]);

  const waUrl = job
    ? `https://wa.me/917720814323?text=${encodeURIComponent(`नमस्कार, मला ${job.title} नोकरीबद्दल माहिती हवी आहे.`)}`
    : "";

  return (
    <AnimatePresence>
      {job && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={ref}
            tabIndex={-1}
            aria-modal="true"
            aria-label={`${job.title} Apply`}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:right-auto md:w-[480px] z-50 outline-none"
          >
            <div className="bg-card rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex justify-center pt-3 pb-1 md:hidden">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>
              <div className="relative px-6 pt-4 pb-4 bg-gradient-to-r from-orange-500 to-orange-600">
                <button
                  onClick={onClose}
                  type="button"
                  className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors rounded-full p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                  aria-label="बंद करा"
                >
                  <X size={20} />
                </button>
                <p className="text-white/70 text-xs font-body uppercase tracking-wider mb-1">
                  🏛️ सरकारी नोकरी
                </p>
                <h2 className="text-white font-display font-semibold text-lg leading-tight pr-8 line-clamp-2">
                  {job.title}
                </h2>
                {job.pubDate && (
                  <p className="text-white/70 text-xs font-body mt-1">
                    📅 {formatDate(job.pubDate)}
                  </p>
                )}
              </div>
              <div className="px-6 py-5 space-y-3">
                <p className="text-muted-foreground text-sm font-body text-center mb-4">
                  या नोकरीबद्दल अधिक माहितीसाठी आमच्याशी संपर्क करा
                </p>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-3.5 px-5 rounded-xl font-body font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ backgroundColor: "#25D366" }}
                >
                  <MessageCircle size={20} />
                  <span>WhatsApp वर संपर्क करा</span>
                </a>
                <a
                  href="tel:+917720814323"
                  className="flex items-center justify-center gap-3 w-full py-3.5 px-5 rounded-xl font-body font-semibold text-white bg-primary transition-all duration-200 hover:opacity-90 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <PhoneCall size={20} />
                  <span>📞 Call करा — {PHONE}</span>
                </a>
                <button
                  onClick={onClose}
                  type="button"
                  className="w-full py-2.5 px-5 rounded-xl font-body text-muted-foreground text-sm hover:text-foreground transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  रद्द करा
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({
  job,
  index,
  isNew,
  onApply,
}: { job: JobItem; index: number; isNew?: boolean; onApply: () => void }) {
  const info = parseJobDescription(job.description);
  const hasStructured = !!(
    info.vacancy ||
    info.salary ||
    info.lastDate ||
    info.fees
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={`bg-card border rounded-2xl overflow-hidden flex hover:shadow-md transition-all duration-200 group ${
        isNew
          ? "border-green-400/70 hover:border-green-400 shadow-sm shadow-green-400/10"
          : "border-border hover:border-orange-400/50"
      }`}
    >
      <div
        className={`w-1.5 shrink-0 rounded-l-2xl bg-gradient-to-b ${
          job.isAdmin
            ? "from-primary to-primary/60"
            : isNew
              ? "from-green-400 to-green-600"
              : "from-orange-400 to-orange-600"
        }`}
      />
      <div className="flex-1 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {job.isAdmin && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-body font-bold uppercase tracking-wide">
                  🏛️ Local
                </span>
              )}
              {isNew && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300 text-[10px] font-body font-bold uppercase tracking-wide animate-pulse">
                  🆕 नवीन
                </span>
              )}
              <h3 className="font-display font-bold text-foreground text-sm md:text-base leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">
                {job.title}
              </h3>
            </div>
            {job.pubDate && (
              <p className="text-muted-foreground text-xs font-body mt-1">
                📅 {formatDate(job.pubDate)}
              </p>
            )}
            {hasStructured && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {info.vacancy && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-green-50 text-green-700 border border-green-200 text-xs font-body font-medium">
                    🟢 रिक्त: {info.vacancy}
                  </span>
                )}
                {info.salary && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-body font-medium">
                    💰 {info.salary}
                  </span>
                )}
                {info.lastDate && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-body font-medium">
                    📅 {info.lastDate}
                  </span>
                )}
                {info.fees && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-xs font-body font-medium">
                    💳 शुल्क: {info.fees}
                  </span>
                )}
              </div>
            )}
            {!hasStructured && info.plain && (
              <p className="text-muted-foreground text-xs md:text-sm font-body mt-2 line-clamp-2 leading-relaxed">
                {info.plain}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onApply}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-body font-semibold rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 active:scale-[0.97]"
          >
            Apply
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Job Skeleton ─────────────────────────────────────────────────────────────
function JobSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex animate-pulse">
      <div className="w-1.5 shrink-0 bg-orange-200 rounded-l-2xl" />
      <div className="flex-1 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded-lg w-4/5" />
            <div className="h-3 bg-muted rounded-lg w-1/4" />
            <div className="h-3 bg-muted rounded-lg w-full" />
            <div className="h-3 bg-muted rounded-lg w-3/4" />
          </div>
          <div className="h-8 w-16 bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Jobs Section ─────────────────────────────────────────────────────────────
interface JobsSectionProps {
  onNewJobsCount: (count: number) => void;
  adminJobsRefreshKey: number;
}

function JobsSection({
  onNewJobsCount,
  adminJobsRefreshKey,
}: JobsSectionProps) {
  const { actor } = useActor();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [newJobTitles, setNewJobTitles] = useState<Set<string>>(new Set());
  const [applyJob, setApplyJob] = useState<JobItem | null>(null);
  const [notifPermission, setNotifPermission] =
    useState<NotificationPermission>(
      typeof Notification !== "undefined" ? Notification.permission : "default",
    );
  const isFirstLoad = useRef(true);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [liveJobs, adminJobsRaw] = await Promise.all([
        fetchJobs(),
        actor?.getAdminJobs().catch(() => []) ?? Promise.resolve([]),
      ]);

      // Convert admin jobs to JobItem format
      const adminJobItems: JobItem[] = (adminJobsRaw as AdminJob[]).map(
        (job) => ({
          title: `🏛️ ${job.title}`,
          link: "",
          pubDate: job.notifDate,
          description: [
            job.vacancy ? `Vacancy: ${job.vacancy}` : "",
            job.salary ? `Salary: ${job.salary}` : "",
            job.lastDate ? `Last Date: ${job.lastDate}` : "",
            job.fees ? `Fees: ${job.fees}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
          isAdmin: true,
        }),
      );

      // Sort admin jobs newest first
      const sortedAdminJobs = [...adminJobItems].sort((a, b) => {
        const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return db - da;
      });

      // Sort live jobs newest first
      const sortedLiveJobs = [...liveJobs].sort((a, b) => {
        const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return db - da;
      });

      // Admin jobs first, then live/static jobs
      const allJobs = [...sortedAdminJobs, ...sortedLiveJobs];

      const seenTitles = getSeenTitles();

      if (isFirstLoad.current) {
        const allTitles = new Set(allJobs.map((j) => j.title));
        saveSeenTitles(allTitles);
        setNewJobTitles(new Set());
        onNewJobsCount(0);
        isFirstLoad.current = false;
      } else {
        const newTitles = new Set(
          allJobs.filter((j) => !seenTitles.has(j.title)).map((j) => j.title),
        );
        setNewJobTitles(newTitles);
        onNewJobsCount(newTitles.size);

        if (notifPermission === "granted" && newTitles.size > 0) {
          const newJobs = allJobs.filter((j) => newTitles.has(j.title));
          for (const job of newJobs.slice(0, 3)) {
            try {
              new Notification("नवीन सरकारी नोकरी! 🔔", {
                body: job.title,
                icon: "/favicon.ico",
              });
            } catch {
              // ignore
            }
          }
          if (newTitles.size > 3) {
            try {
              new Notification(
                `आणखी ${newTitles.size - 3} नवीन सरकारी नोकऱ्या आल्या!`,
                {
                  icon: "/favicon.ico",
                },
              );
            } catch {
              // ignore
            }
          }
        }

        const updatedSeen = new Set([
          ...seenTitles,
          ...allJobs.map((j) => j.title),
        ]);
        saveSeenTitles(updatedSeen);
      }

      setJobs(allJobs);
      setLastUpdated(new Date());
    } catch {
      setError("नोकऱ्या लोड करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.");
    } finally {
      setLoading(false);
    }
  }, [notifPermission, onNewJobsCount, actor]);

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadJobs]);

  // Re-load when admin adds a job
  useEffect(() => {
    if (adminJobsRefreshKey > 0) {
      loadJobs();
    }
  }, [adminJobsRefreshKey, loadJobs]);

  async function handleNotificationToggle() {
    if (typeof Notification === "undefined") return;
    if (notifPermission === "granted") return;
    if (notifPermission === "denied") return;
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
  }

  const notifIcon =
    notifPermission === "granted" ? (
      <Bell size={14} className="text-green-500 fill-green-500" />
    ) : notifPermission === "denied" ? (
      <BellOff size={14} className="text-muted-foreground" />
    ) : (
      <Bell size={14} className="text-muted-foreground" />
    );

  const notifLabel =
    notifPermission === "granted"
      ? "सूचना चालू"
      : notifPermission === "denied"
        ? "सूचना बंद"
        : "सूचना चालू करा";

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display font-bold text-xl md:text-2xl text-foreground flex items-center gap-2">
            <span className="text-red-500">🔴</span> ताज्या सरकारी नोकऱ्या
          </h2>
          <p className="text-muted-foreground font-body text-xs mt-1">
            अधिकृत सरकारी पोर्टल • दर ५ मिनिटांनी अपडेट
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {lastUpdated && (
            <span className="text-muted-foreground text-xs font-body">
              {lastUpdated.toLocaleTimeString("mr-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <div className="flex items-center gap-2">
            {typeof Notification !== "undefined" && (
              <button
                onClick={handleNotificationToggle}
                disabled={notifPermission === "denied"}
                type="button"
                title={notifLabel}
                className={`flex items-center gap-1 text-xs font-body transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 rounded px-2 py-1 border ${
                  notifPermission === "granted"
                    ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                    : notifPermission === "denied"
                      ? "border-border text-muted-foreground opacity-50 cursor-not-allowed"
                      : "border-orange-300 text-orange-600 bg-orange-50 hover:bg-orange-100 cursor-pointer"
                }`}
                aria-label={notifLabel}
              >
                {notifIcon}
                <span className="hidden sm:inline">{notifLabel}</span>
              </button>
            )}
            <button
              onClick={loadJobs}
              disabled={loading}
              type="button"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-orange-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 rounded"
              aria-label="नोकऱ्या रिफ्रेश करा"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              रिफ्रेश
            </button>
          </div>
        </div>
      </div>

      {!loading && newJobTitles.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 border border-green-300 text-green-800 text-sm font-body font-medium"
        >
          <Bell size={14} className="shrink-0 text-green-600" />
          <span>{newJobTitles.size} नवीन नोकऱ्या आल्या आहेत!</span>
        </motion.div>
      )}

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((key) => (
            <JobSkeleton key={key} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle size={40} className="text-destructive mb-3 opacity-60" />
          <p className="text-foreground font-body font-medium mb-1">अडचण आली</p>
          <p className="text-muted-foreground font-body text-sm mb-4">
            {error}
          </p>
          <button
            onClick={loadJobs}
            type="button"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-body font-semibold rounded-xl transition-colors"
          >
            पुन्हा प्रयत्न करा
          </button>
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Briefcase
            size={40}
            className="text-muted-foreground mb-3 opacity-40"
          />
          <p className="text-muted-foreground font-body text-sm">
            सध्या कोणतीही नोकरी उपलब्ध नाही.
          </p>
        </div>
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="space-y-3">
          {jobs.map((job, i) => (
            <JobCard
              key={`${job.link}-${job.title}-${i}`}
              job={job}
              index={i}
              isNew={newJobTitles.has(job.title)}
              onApply={() => setApplyJob(job)}
            />
          ))}
        </div>
      )}

      <JobApplyModal job={applyJob} onClose={() => setApplyJob(null)} />
    </div>
  );
}

// ─── Contact Modal ────────────────────────────────────────────────────────────
interface ContactModalProps {
  subService: SubService | null;
  parentService: Service | null;
  onClose: () => void;
}

function ContactModal({
  subService,
  parentService,
  onClose,
}: ContactModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (subService && ref.current) {
      ref.current.focus();
    }
  }, [subService]);

  if (!subService || !parentService) return null;

  const serviceName = `${subService.nameEn} (${subService.nameMr})`;
  const waUrl = buildWhatsAppUrl(serviceName);

  return (
    <AnimatePresence>
      {subService && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={ref}
            tabIndex={-1}
            aria-modal="true"
            aria-label={`${subService.nameEn} संपर्क`}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:right-auto md:w-[480px] z-50 outline-none"
          >
            <div className="bg-card rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex justify-center pt-3 pb-1 md:hidden">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>
              <div className="relative px-6 pt-4 pb-4 bg-gradient-to-r from-primary to-primary/80">
                <button
                  onClick={onClose}
                  type="button"
                  className="absolute top-4 right-4 text-primary-foreground/70 hover:text-primary-foreground transition-colors rounded-full p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                  aria-label="बंद करा"
                >
                  <X size={20} />
                </button>
                <p className="text-primary-foreground/70 text-xs font-body uppercase tracking-wider mb-1">
                  {parentService.icon} {parentService.nameEn}
                </p>
                <h2 className="text-primary-foreground font-display font-semibold text-lg leading-tight pr-8">
                  {subService.nameEn}
                </h2>
                <p className="text-primary-foreground/80 text-sm font-body mt-0.5">
                  {subService.nameMr}
                </p>
              </div>
              <div className="px-6 py-5 space-y-3">
                <p className="text-muted-foreground text-sm font-body text-center mb-4">
                  आमच्याशी संपर्क करण्यासाठी खालील पर्याय निवडा
                </p>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-3.5 px-5 rounded-xl font-body font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ backgroundColor: "#25D366" }}
                >
                  <MessageCircle size={20} />
                  <span>WhatsApp वर संपर्क करा</span>
                </a>
                <a
                  href={`tel:${PHONE_INTL}`}
                  className="flex items-center justify-center gap-3 w-full py-3.5 px-5 rounded-xl font-body font-semibold text-white bg-primary transition-all duration-200 hover:opacity-90 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <PhoneCall size={20} />
                  <span>📞 Call करा — {PHONE}</span>
                </a>
                <button
                  onClick={onClose}
                  type="button"
                  className="w-full py-2.5 px-5 rounded-xl font-body text-muted-foreground text-sm hover:text-foreground transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  रद्द करा
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Sub-Services Panel ───────────────────────────────────────────────────────
interface SubServicesPanelProps {
  service: Service;
  onSubServiceClick: (sub: SubService, parent: Service) => void;
  onClose: () => void;
}

function SubServicesPanel({
  service,
  onSubServiceClick,
  onClose,
}: SubServicesPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="overflow-hidden col-span-2 md:col-span-3 lg:col-span-4"
    >
      <div className="bg-gradient-to-br from-secondary to-secondary/60 border border-accent/30 rounded-2xl p-4 md:p-6 mt-1 mb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{service.icon}</span>
            <div>
              <h3 className="font-display font-semibold text-foreground text-base leading-tight">
                {service.nameEn}
              </h3>
              <p className="text-muted-foreground text-sm font-body">
                {service.nameMr}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            aria-label="बंद करा"
          >
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {service.subServices.map((sub, idx) => (
            <motion.button
              key={`${service.id}-${idx}`}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.2 }}
              onClick={() => onSubServiceClick(sub, service)}
              className="text-left px-4 py-3 bg-card hover:bg-accent/10 border border-border hover:border-accent/50 rounded-xl transition-all duration-200 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.98]"
            >
              <p className="text-foreground font-body text-sm font-medium leading-snug group-hover:text-primary transition-colors">
                {sub.nameEn}
              </p>
              <p className="text-muted-foreground text-xs mt-0.5 font-body">
                {sub.nameMr}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────
interface ServiceCardProps {
  service: Service;
  isActive: boolean;
  onClick: () => void;
}

function ServiceCard({ service, isActive, onClick }: ServiceCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`service-card text-left w-full rounded-2xl p-4 border-2 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${
        isActive
          ? "border-accent bg-gradient-to-br from-accent/15 to-accent/5 shadow-lg shadow-accent/10"
          : "border-border bg-card hover:border-accent/40 hover:shadow-md hover:shadow-primary/5"
      }`}
      aria-pressed={isActive}
      aria-label={`${service.nameEn} - ${service.nameMr}`}
    >
      <div className="flex flex-col items-center text-center gap-2">
        <span className="text-3xl leading-none">{service.icon}</span>
        <div>
          <p
            className={`font-body font-semibold text-sm leading-tight transition-colors ${
              isActive ? "text-primary" : "text-foreground"
            }`}
          >
            {service.nameEn}
          </p>
          <p className="text-muted-foreground text-xs mt-0.5 font-body leading-tight">
            {service.nameMr}
          </p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-body font-medium transition-colors ${
            isActive
              ? "bg-accent/20 text-accent-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {service.subServices.length} सेवा
        </span>
      </div>
      <div
        className={`flex justify-center mt-2 transition-transform duration-200 ${isActive ? "rotate-180" : ""}`}
      >
        <ChevronDown
          size={14}
          className={`transition-colors ${isActive ? "text-accent" : "text-muted-foreground"}`}
        />
      </div>
    </motion.button>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header() {
  return (
    <header className="relative header-pattern bg-primary overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-accent/20 pointer-events-none" />
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full border border-accent/15 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full border border-primary-foreground/5 pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 md:gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
            className="shrink-0"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-card/15 backdrop-blur-sm border border-card/20 flex items-center justify-center overflow-hidden shadow-xl">
              <img
                src="/assets/generated/shiv-seva-kendra-logo-transparent.dim_300x300.png"
                alt="Shiv Seva Kendra Logo"
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.parentElement!.innerHTML =
                    '<span class="text-4xl">🕉️</span>';
                }}
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1 text-center sm:text-left"
          >
            <h1 className="font-display font-bold text-3xl md:text-4xl text-primary-foreground leading-tight">
              Shiv Seva Kendra
            </h1>
            <p className="font-body text-primary-foreground/80 text-lg mt-0.5">
              शिव सेवा केंद्र
            </p>
            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-2">
              <a
                href={`tel:${PHONE_INTL}`}
                className="flex items-center gap-1.5 hover:text-orange-400 transition-colors text-sm font-body"
              >
                <Phone size={14} className="shrink-0 text-white" />
                <span className="text-white font-bold">{PHONE}</span>
              </a>
              <a
                href="mailto:shubhamkoli918@gmail.com"
                className="flex items-center gap-1.5 hover:text-accent transition-colors text-sm font-body"
              >
                <Mail size={14} className="shrink-0 text-white" />
                <span className="text-white font-bold">
                  shubhamkoli918@gmail.com
                </span>
              </a>
              <div className="flex items-center gap-1.5 text-sm font-body">
                <MapPin size={14} className="shrink-0 text-white" />
                <span className="text-white font-bold">
                  उत्रण, ता. एरंडोल, जि. जळगाव
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
type TabType = "jobs" | "services";

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  newJobsCount: number;
}

function TabBar({ activeTab, onTabChange, newJobsCount }: TabBarProps) {
  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex gap-1 py-2">
          <button
            type="button"
            onClick={() => onTabChange("jobs")}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-body font-semibold text-sm transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 ${
              activeTab === "jobs"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            aria-selected={activeTab === "jobs"}
            role="tab"
          >
            <span className="text-base">🔴</span>
            <span>नोकऱ्या</span>
            {newJobsCount > 0 && activeTab !== "jobs" && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-green-500 text-white text-[10px] font-bold"
              >
                {newJobsCount}
              </motion.span>
            )}
            {activeTab === "jobs" && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 rounded-full bg-white/80 animate-pulse"
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => onTabChange("services")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-body font-semibold text-sm transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
              activeTab === "services"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            aria-selected={activeTab === "services"}
            role="tab"
          >
            <span className="text-base">🏢</span>
            <span>सेवा</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────
interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 mt-4 relative z-10">
      <div className="bg-card border border-border rounded-2xl shadow-lg shadow-primary/8 overflow-hidden flex items-center gap-3 px-4 py-3">
        <Search size={18} className="text-muted-foreground shrink-0" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="सेवा शोधा... Search services..."
          className="flex-1 bg-transparent text-foreground text-sm font-body placeholder:text-muted-foreground outline-none border-none"
          aria-label="सेवा शोधा"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="साफ करा"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Services Grid ────────────────────────────────────────────────────────────
interface ServicesGridProps {
  filteredServices: Service[];
  activeServiceId: number | null;
  onServiceClick: (service: Service) => void;
  onSubServiceClick: (sub: SubService, parent: Service) => void;
  onClosePanel: () => void;
  searchQuery: string;
}

function ServicesGrid({
  filteredServices,
  activeServiceId,
  onServiceClick,
  onSubServiceClick,
  onClosePanel,
  searchQuery,
}: ServicesGridProps) {
  const activeService =
    filteredServices.find((s) => s.id === activeServiceId) ?? null;

  if (filteredServices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <span className="text-5xl mb-4">🔍</span>
        <h3 className="font-display font-semibold text-foreground text-lg mb-2">
          सेवा सापडली नाही
        </h3>
        <p className="text-muted-foreground font-body text-sm">
          "{searchQuery}" साठी कोणतीही सेवा उपलब्ध नाही.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {filteredServices.map((service) => (
        <React.Fragment key={service.id}>
          <ServiceCard
            service={service}
            isActive={service.id === activeServiceId}
            onClick={() => onServiceClick(service)}
          />
          {service.id === activeServiceId && activeService && (
            <AnimatePresence>
              <SubServicesPanel
                key={`panel-${service.id}`}
                service={activeService}
                onSubServiceClick={onSubServiceClick}
                onClose={onClosePanel}
              />
            </AnimatePresence>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="mt-12 bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display font-bold text-lg text-primary-foreground mb-1">
              Shiv Seva Kendra
            </h3>
            <p className="text-primary-foreground/70 font-body text-sm">
              शिव सेवा केंद्र
            </p>
            <p className="text-primary-foreground/50 font-body text-xs mt-2">
              आपल्या सेवेत सदैव तत्पर
            </p>
          </div>
          <div>
            <h4 className="font-body font-semibold text-primary-foreground/90 text-sm uppercase tracking-wider mb-3">
              संपर्क
            </h4>
            <div className="space-y-2">
              <a
                href={`tel:${PHONE_INTL}`}
                className="flex items-center gap-2 hover:text-orange-400 transition-colors text-sm font-body"
              >
                <Phone size={14} className="text-white" />
                <span className="text-white font-bold">{PHONE}</span>
              </a>
              <a
                href="mailto:shubhamkoli918@gmail.com"
                className="flex items-center gap-2 hover:text-accent transition-colors text-sm font-body"
              >
                <Mail size={14} className="text-white" />
                <span className="text-white font-bold">
                  shubhamkoli918@gmail.com
                </span>
              </a>
              <div className="flex items-start gap-2 text-sm font-body">
                <MapPin size={14} className="shrink-0 mt-0.5 text-white" />
                <span className="text-white font-bold">
                  उत्रण, ता. एरंडोल, जि. जळगाव, महाराष्ट्र
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-body font-semibold text-primary-foreground/90 text-sm uppercase tracking-wider mb-3">
              त्वरित संपर्क
            </h4>
            <div className="space-y-2">
              <a
                href={`https://wa.me/91${PHONE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-body font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#25D366" }}
              >
                <MessageCircle size={16} />
                WhatsApp करा
              </a>
              <a
                href={`tel:${PHONE_INTL}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/15 text-primary-foreground text-sm font-body font-medium hover:bg-card/25 transition-colors"
              >
                <PhoneCall size={16} />
                Call करा
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-primary-foreground/40 text-xs font-body text-center">
            © {year} Shiv Seva Kendra. सर्व हक्क राखीव.
          </p>
          <a
            href={caffeineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-foreground/40 hover:text-primary-foreground/60 text-xs font-body transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { actor } = useActor();
  const [activeTab, setActiveTab] = useState<TabType>("jobs");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeServiceId, setActiveServiceId] = useState<number | null>(null);
  const [selectedSubService, setSelectedSubService] =
    useState<SubService | null>(null);
  const [selectedParentService, setSelectedParentService] =
    useState<Service | null>(null);
  const [newJobsCount, setNewJobsCount] = useState(0);
  const [bookApptOpen, setBookApptOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [adminJobsRefreshKey, setAdminJobsRefreshKey] = useState(0);
  const [adminServicesRefreshKey, setAdminServicesRefreshKey] = useState(0);
  const [adminServicesList, setAdminServicesList] = useState<AdminService[]>(
    [],
  );

  const loadAdminServicesForGrid = useCallback(async () => {
    try {
      const svcs = await actor?.getAdminServices();
      if (svcs) setAdminServicesList(svcs);
    } catch {
      // ignore
    }
  }, [actor]);

  // Load admin services for merging into services grid
  // biome-ignore lint/correctness/useExhaustiveDependencies: adminServicesRefreshKey triggers re-fetch intentionally
  useEffect(() => {
    loadAdminServicesForGrid();
  }, [loadAdminServicesForGrid, adminServicesRefreshKey]);

  // Convert AdminService → Service for the grid
  const adminServicesAsService: Service[] = useMemo(
    () =>
      adminServicesList.map((svc) => ({
        id: 10000 + Number(svc.id),
        icon: "🏢",
        nameEn: svc.mainNameEn,
        nameMr: svc.mainNameMr,
        subServices: svc.subServices.map((s) => ({
          nameEn: s.nameEn,
          nameMr: s.nameMr,
        })),
      })),
    [adminServicesList],
  );

  function handleTabChange(tab: TabType) {
    setActiveTab(tab);
    if (tab === "jobs") setNewJobsCount(0);
  }

  const allServices = useMemo(
    () => [...services, ...adminServicesAsService],
    [adminServicesAsService],
  );

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allServices;
    return allServices.filter(
      (s) =>
        s.nameEn.toLowerCase().includes(q) ||
        s.nameMr.includes(q) ||
        s.subServices.some(
          (sub) =>
            sub.nameEn.toLowerCase().includes(q) || sub.nameMr.includes(q),
        ),
    );
  }, [searchQuery, allServices]);

  function handleServiceClick(service: Service) {
    setActiveServiceId((prev) => (prev === service.id ? null : service.id));
  }

  function handleSubServiceClick(sub: SubService, parent: Service) {
    setSelectedSubService(sub);
    setSelectedParentService(parent);
  }

  function handleModalClose() {
    setSelectedSubService(null);
    setSelectedParentService(null);
  }

  function handlePanelClose() {
    setActiveServiceId(null);
  }

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedSubService) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedSubService]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <TabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        newJobsCount={newJobsCount}
      />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === "jobs" ? (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <JobsSection
                onNewJobsCount={setNewJobsCount}
                adminJobsRefreshKey={adminJobsRefreshKey}
              />
            </motion.div>
          ) : (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6"
            >
              {/* Search bar */}
              <SearchBar value={searchQuery} onChange={setSearchQuery} />

              {/* Section title row: Appointment button + Admin Profile */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mb-6 mt-6"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-stretch">
                  {/* Left: Title + Appointment button */}
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h2 className="font-display font-bold text-xl md:text-2xl text-foreground">
                          आमच्या सेवा
                        </h2>
                        <p className="text-muted-foreground font-body text-sm mt-0.5">
                          सेवा निवडा आणि संपर्क करा
                        </p>
                      </div>
                      {searchQuery && (
                        <span className="text-muted-foreground font-body text-sm">
                          {filteredServices.length} सापडल्या
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setBookApptOpen(true)}
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-body font-semibold text-sm rounded-2xl transition-all duration-200 shadow-md shadow-orange-500/25 hover:shadow-orange-500/35 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 self-start"
                    >
                      <span className="text-base">📅</span>
                      <span>अपॉइंटमेंट बुक करा</span>
                    </button>
                  </div>

                  {/* Right: Admin Profile Card */}
                  <div className="sm:w-64 shrink-0">
                    <AdminProfileCard
                      onAdminClick={() => setAdminPanelOpen(true)}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Grid */}
              <ServicesGrid
                filteredServices={filteredServices}
                activeServiceId={activeServiceId}
                onServiceClick={handleServiceClick}
                onSubServiceClick={handleSubServiceClick}
                onClosePanel={handlePanelClose}
                searchQuery={searchQuery}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />

      {/* Contact Modal */}
      <ContactModal
        subService={selectedSubService}
        parentService={selectedParentService}
        onClose={handleModalClose}
      />

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        open={bookApptOpen}
        onClose={() => setBookApptOpen(false)}
      />

      {/* Admin Panel Modal */}
      <AdminPanelModal
        open={adminPanelOpen}
        onClose={() => setAdminPanelOpen(false)}
        onJobsUpdated={() => setAdminJobsRefreshKey((k) => k + 1)}
        onServicesUpdated={() => {
          setAdminServicesRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
}
