import { useState, useEffect, useRef } from "react";
import { supabase } from "./lib/supabase";
import { Menu, X, History, Settings, LogOut, ChevronLeft, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/focus.png";

const DIFFICULTIES = [
  { id: "easy",   label: "Easy",   icon: "🌱", focusSec: 60,   color: "#4ade80", accent: "#16a34a", desc: "1 Menit Focus" },
  { id: "medium", label: "Medium", icon: "🔥", focusSec: 300,  color: "#fbbf24", accent: "#d97706", desc: "5 Menit Focus" },
  { id: "hard",   label: "Hard",   icon: "⚡", focusSec: 600,  color: "#f87171", accent: "#dc2626", desc: "10 Menit Focus" },
  { id: "elzen",  label: "eL Zen", icon: "🌌", focusSec: 1200, color: "#c4b5fd", accent: "#7c3aed", desc: "20 Menit Focus" },
];

const BUMPS = [
  { id: 0, label: "Bump Reality",    sub: "Deep Clarity", emoji: "✦", color: "#7dd3fc", accent: "#0ea5e9" },
  { id: 1, label: "Bump Reality",    sub: "Deep Relax",   emoji: "◈", color: "#86efac", accent: "#22c55e" },
  { id: 2, label: "Bump Keinginan",  sub: "Deep Clarity", emoji: "◉", color: "#fcd34d", accent: "#f59e0b" },
  { id: 3, label: "Bump Keinginan",  sub: "Deep Relax",   emoji: "❋", color: "#c4b5fd", accent: "#8b5cf6" },
];

const FOCUS_BUBBLES = [
  { atPct: 1,  text: "Fokuskan ke titik ini saja..." },
  { atPct: 10, text: "Abaikan pikiran lain, tidak ada keharusan — hanya fokus ke titik ini saja" },
  { atPct: 25, text: "Biarkan pikiran lewat, kamu tidak perlu mengikutinya" },
  { atPct: 50, text: "Tarik semua perhatian kembali ke sini" },
  { atPct: 75, text: "Semakin dalam, semakin jernih — tetap di sini" },
  { atPct: 99, text: "Volume hampir penuh — pertahankan..." },
];

const BUMP_BUBBLES: Record<number, { atPct: number; text: (desire?: string) => string }[]> = {
  0: [
    { atPct: 1,  text: () => "Sekarang niatkan yang kamu lihat ini... Jelas begitu dalam" },
    { atPct: 10, text: () => "Niatkan saja jelas begitu dalam, tidak ada keharusan terjadi" },
    { atPct: 50, text: () => "Pertahankan niat yang dalam and santai ini..." },
  ],
  1: [
    { atPct: 1,  text: () => "Sekarang niatkan yang kamu lihat ini... Pasrah begitu dalam" },
    { atPct: 10, text: () => "Niatkan saja pasrah begitu dalam, tidak ada keharusan terjadi" },
    { atPct: 50, text: () => "Pertahankan kepasrahan yang dalam and santai ini..." },
  ],
  2: [
    { atPct: 1,  text: (d) => `Sekarang niatkan "${d}" itu terasa begitu jelas yang dalam` },
    { atPct: 10, text: (d) => `Niatkan saja "${d}" itu jelas begitu dalam, tidak ada keharusan terjadi` },
    { atPct: 50, text: () => "Pertahankan niat kejelasan yang dalam and santai ini..." },
  ],
  3: [
    { atPct: 1,  text: (d) => `Sekarang niatkan "${d}" itu pasrah begitu dalam` },
    { atPct: 10, text: (d) => `Niatkan saja "${d}" itu pasrah begitu dalam, tidak ada keharusan terjadi` },
    { atPct: 50, text: () => "Pertahankan kepasrahan yang dalam and santai ini..." },
  ],
};

function fmt(sec: number) {
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return m > 0 ? `${m}m ${ss < 10 ? "0" : ""}${ss}s` : `${ss}s`;
}

interface TutorialProps {
  onClose: () => void;
  accentColor: string;
}

function Tutorial({ onClose, accentColor }: TutorialProps) {
  const steps = [
    { icon: "◎", title: "Step 1: Isi Focus", body: "Isi volume hingga 100% dengan fokus tenang pada satu titik." },
    { icon: "⚡", title: "Step 2-5: The Bumps", body: "Lakukan Bump 1 hingga 4 secara berurutan. Setiap Bump mengambil durasi 25% dari waktu focus Anda." },
    { icon: "🌊", title: "Step 6: Balik Focus", body: "Setelah semua Bump selesai, kembali isi volume hingga 100% untuk mengunci hasil latihan." },
    { icon: "🌸", title: "Kunci Utama", body: "Selesaikan 6 tahap protokol secara disiplin tanpa terburu-buru." },
  ];
  return (
    <div style={{ position:"fixed",inset:0,background:"#000000cc",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
      <div style={{ background:"#0f172a",border:`1px solid ${accentColor}44`,borderRadius:20,maxWidth:600,width:"100%",maxHeight:"90vh",overflowY:"auto",padding:"32px 24px", boxShadow: "0 0 40px rgba(0,0,0,0.5)" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
          <div>
            <div style={{ fontSize:15,letterSpacing:4,color:accentColor,textTransform:"uppercase" }}>Panduan Protokol</div>
            <div style={{ fontSize:24,color:"#ffffff",fontFamily:"Georgia,serif",marginTop:2 }}>The Bump - 6 Step Protocol</div>
          </div>
          <button onClick={onClose} style={{ background:"#1e293b",border:"1px solid #334155",borderRadius:8,color:"#ffffff",width:34,height:34,cursor:"pointer",fontSize:15 }}>✕</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap:12 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ background:"#1e293b",borderRadius:10,padding:"14px",display:"flex",gap:10,alignItems:"flex-start",border:"1px solid #334155" }}>
              <div style={{ fontSize:16,minWidth:30,height:30,borderRadius:8,background:accentColor+"22",display:"flex",alignItems:"center",justifyContent:"center",color:accentColor }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:15,color:accentColor,fontWeight:"bold",marginBottom:2 }}>{s.title}</div>
                <div style={{ fontSize:15,color:"#ffffff",lineHeight:1.6 }}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop:24,width:"100%",padding:"14px",borderRadius:12,background:`linear-gradient(135deg,${accentColor},${accentColor}88)`,border:"none",color:"#fff",fontSize:15,fontWeight:"bold",cursor:"pointer",letterSpacing:1 }}>
          Saya Mengerti & Mulai Berlatih →
        </button>
      </div>
    </div>
  );
}

export default function TheBump({ session }: { session: any }) {
  const [screen, setScreen] = useState<"select" | "session" | "history" | "settings">("select");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMetadata, setUserMetadata] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [diffId, setDiffId] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  
  const [protocolStep, setProtocolStep] = useState(1);
  const [isBumping, setIsBumping] = useState(false);
  const [bumpElapsed, setBumpElapsed] = useState(0);
  
  const [bumpDone, setBumpDone] = useState([false,false,false,false]);
  const [rings, setRings] = useState<any[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [desire, setDesire] = useState("Contoh: Bisnis tembus 100 juta");
  const [editingDesire, setEditingDesire] = useState(false);
  const [complete, setComplete] = useState(false);
  const [pulseT, setPulseT] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [showFingerHint, setShowFingerHint] = useState(false);
  
  const [activeBubble, setActiveBubble] = useState<string | null>(null);
  const [shownFocus, setShownFocus] = useState<Set<number>>(new Set());
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const ringId = useRef(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const syncUser = async () => {
      if (session?.user) {
        setUserMetadata(session.user.user_metadata);
        
        const { error } = await supabase.from('focus_clients').upsert({
          user_id: session.user.id,
          user_email: session.user.email,
          display_name: session.user.user_metadata?.display_name || session.user.email
        }, { onConflict: 'user_id' });

        if (error) {
          console.error("Supabase Sync Error:", error.message, error.details, error.hint);
        } else {
          console.log("User successfully synced to focus_clients");
        }
      }
    };
    syncUser();
  }, [session]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen, protocolStep]);

  const diff = DIFFICULTIES.find(d => d.id === diffId) || DIFFICULTIES[0];
  const bumpDurationSec = diff.focusSec * 0.25;
  const isVolumeFull = volume >= 100;

  const fetchHistory = async () => {
    if (!session?.user) return;
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('focus_history')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      setHistoryData(data || []);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const startTracking = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from('focus_history').insert({ user_id: user.id, user_email: user.email, difficulty: diff.label, desire_text: desire, status: 'started' }).select().single();
      if (error) throw error;
      setSessionId(data.id);
    } catch (err) {
      console.error('Failed to start tracking:', err);
    }
  };

  const finishTracking = async () => {
    if (!sessionId) return;
    try {
      const totalFocusTime = (protocolStep === 6 ? diff.focusSec : 0) + (bumpDone.filter(Boolean).length * bumpDurationSec);
      await supabase.from('focus_history').update({ status: 'completed', finished_at: new Date().toISOString(), focus_time: Math.floor(totalFocusTime), bump_count: bumpDone.filter(Boolean).length }).eq('id', sessionId);
    } catch (err) {
      console.error('Failed to finish tracking:', err);
    }
  };

  const updateBumpTracking = async (count: number) => {
    if (!sessionId) return;
    try {
      await supabase.from('focus_history').update({ bump_count: count }).eq('id', sessionId);
    } catch (err) {
      console.error('Failed to update bump tracking:', err);
    }
  };

  useEffect(() => {
    if (!running || isBumping || complete) return;
    if (protocolStep !== 1 && protocolStep !== 6) return;
    const id = setInterval(() => {
      setElapsed(e => {
        const next = e + 1;
        const pct = Math.min(100, (next / diff.focusSec) * 100);
        setVolume(pct);
        const floorPct = Math.floor(pct);
        const stepKey = protocolStep * 1000 + floorPct;
        if (!shownFocus.has(stepKey)) {
          const match = FOCUS_BUBBLES.find(b => b.atPct === floorPct);
          if (match) {
            setActiveBubble(match.text);
            if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
            bubbleTimerRef.current = setTimeout(() => setActiveBubble(null), 4000);
            setShownFocus(prev => { const next2 = new Set(prev); next2.add(stepKey); return next2; });
          }
        }
        if (pct >= 100) {
          setRunning(false);
          setShowFingerHint(true);
          if (protocolStep === 1) { setProtocolStep(2); showToast("Volume Penuh. Siap untuk Bump 1."); }
          else if (protocolStep === 6) { finishTracking(); setTimeout(() => setComplete(true), 700); }
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, isBumping, diff, complete, protocolStep, shownFocus, sessionId]);

  useEffect(() => {
    if (!isBumping || complete) return;
    if (protocolStep < 2 || protocolStep > 5) return;
    const id = setInterval(() => {
      setBumpElapsed(prev => {
        const next = prev + 1;
        const progressPctFloat = (next / bumpDurationSec) * 100;
        setVolume(Math.min(100, progressPctFloat));
        const progressPct = Math.floor(progressPctFloat);
        const activeBumpIdx = protocolStep - 2;
        const key = (activeBumpIdx + 10) * 1000 + progressPct;
        if (!shownFocus.has(key)) {
          const bumpBubbleList = BUMP_BUBBLES[activeBumpIdx] ?? [];
          const match = bumpBubbleList.find(b => b.atPct === progressPct);
          if (match) {
            setActiveBubble(match.text(desire));
            if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
            bubbleTimerRef.current = setTimeout(() => setActiveBubble(null), 4000);
            setShownFocus(prev2 => { const next2 = new Set(prev2); next2.add(key); return next2; });
          }
        }
        if (next >= bumpDurationSec) {
          setIsBumping(false);
          setBumpElapsed(0);
          const bumpIndex = protocolStep - 2;
          const newDone = [...bumpDone];
          newDone[bumpIndex] = true;
          setBumpDone(newDone);
          updateBumpTracking(newDone.filter(Boolean).length);
          const nextStep = protocolStep + 1;
          setProtocolStep(nextStep);
          setVolume(0);
          setElapsed(0);
          if (nextStep === 6) { showToast("Semua Bump Selesai. Balik Focus (Fokus 1 Titik)."); }
          else { showToast(`Bump ${bumpIndex + 1} Selesai. Lanjut ke Step ${nextStep}: Isi Focus.`); }
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isBumping, bumpDurationSec, bumpDone, complete, protocolStep, desire, shownFocus, sessionId]);

  useEffect(() => {
    const id = setInterval(() => setPulseT(t => t + 0.05), 50);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setRings(prev => prev.map(r => ({ ...r, scale: r.scale + 0.013, opacity: r.opacity - 0.01 })).filter(r => r.opacity > 0));
    }, 30);
    return () => clearInterval(id);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const spawnRing = (color: string) => setRings(prev => [...prev, { id: ringId.current++, scale: 1, opacity: 0.75, color }]);

  const handleBump = (i: number) => {
    setShowFingerHint(false);
    if (bumpDone[i] || isBumping) return;
    if (protocolStep !== (i + 2)) {
      if (protocolStep === 1) showToast("Isi Focus (Volume 100%) terlebih dahulu");
      else showToast(`Sekarang adalah tahap Bump ${protocolStep - 1}`);
      return;
    }
    if (!isVolumeFull) { showToast("Volume Fokus kamu belum cukup untuk Bump (Wajib 100%)"); return; }
    setIsBumping(true);
    setVolume(0);
    spawnRing(BUMPS[i].color);
  };

  const resetSession = () => {
    setVolume(0); setElapsed(0); setRunning(false); 
    setIsBumping(false); setBumpElapsed(0); setProtocolStep(1);
    setBumpDone([false,false,false,false]); setComplete(false); setRings([]);
    setActiveBubble(null); setShownFocus(new Set()); setSessionId(null);
    setShowFingerHint(false);
  };

  function HandleKembali() {
    if (screen === "session") {
      if (protocolStep > 1) {
        const prevStep = protocolStep - 1;
        setProtocolStep(prevStep); setIsBumping(false); setBumpElapsed(0); setRunning(false);
        if (prevStep === 1) { setVolume(0); setElapsed(0); setBumpDone([false, false, false, false]); setActiveBubble(null); setShownFocus(new Set()); }
        else {
          setVolume(100); const newDone = [...bumpDone];
          for (let i = prevStep - 2; i < 4; i++) { if (i >= 0) newDone[i] = false; }
          setBumpDone(newDone);
          setShownFocus(prev => { const next = new Set(prev); const minKeyToRemove = prevStep * 1000; for (const key of next) { if (key >= minKeyToRemove) next.delete(key); } return next; });
        }
        showToast(`Kembali ke Tahap ${prevStep}`);
      } else { resetSession(); setScreen("select"); }
    } else { window.location.href = "https://focus.elvisiongroup.com"; }
  }

  const renderSidebar = () => (
    <AnimatePresence>
      {isMenuOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 5000, backdropFilter: "blur(4px)" }} />
          <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 280, background: "#0f172a", borderRight: "1px solid #1e293b", zIndex: 5001, padding: "24px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><img src={logo} alt="eL Focus" style={{ width: 24, height: 24, borderRadius: 4 }} /><span style={{ fontSize: 18, fontWeight: "bold", letterSpacing: 1 }}>eL Focus</span></div>
              <button onClick={() => setIsMenuOpen(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><X className="w-6 h-6" /></button>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "16px", marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>Selamat datang,</div>
              <div style={{ fontSize: 16, fontWeight: "bold", color: "#fff", overflow: "hidden", textOverflow: "ellipsis" }}>{userMetadata?.display_name || session?.user?.email || "Guest User"}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => { setScreen("select"); setIsMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 8, background: screen === "select" ? "rgba(59, 130, 246, 0.1)" : "transparent", color: screen === "select" ? "#3b82f6" : "#fff", border: "none", cursor: "pointer", textAlign: "left", fontSize: 15 }}><Zap className="w-5 h-5" /> Mulai Bump Focus</button>
              <button onClick={() => { fetchHistory(); setScreen("history"); setIsMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 8, background: screen === "history" ? "rgba(59, 130, 246, 0.1)" : "transparent", color: screen === "history" ? "#3b82f6" : "#fff", border: "none", cursor: "pointer", textAlign: "left", fontSize: 15 }}><History className="w-5 h-5" /> Check History</button>
              <button onClick={() => { setScreen("settings"); setIsMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 8, background: screen === "settings" ? "rgba(59, 130, 246, 0.1)" : "transparent", color: screen === "settings" ? "#3b82f6" : "#fff", border: "none", cursor: "pointer", textAlign: "left", fontSize: 15 }}><Settings className="w-5 h-5" /> Settings</button>
            </div>
            <div style={{ marginTop: "auto" }}>
              <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 8, color: "#f87171", border: "none", background: "none", cursor: "pointer", width: "100%", textAlign: "left", fontSize: 15 }}><LogOut className="w-5 h-5" /> Logout</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const renderTopMenuBtn = () => (
    <button onClick={() => setIsMenuOpen(true)} style={{ position: "fixed", top: 24, left: 24, background: "rgba(15, 23, 42, 0.8)", border: "1px solid #1e293b", borderRadius: 10, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 4000, backdropFilter: "blur(8px)" }}><Menu className="text-white w-6 h-6" /></button>
  );

  const pulseScale = running || isBumping ? 1 + Math.sin(pulseT * 3) * 0.022 * (isBumping ? 1 : volume / 100) : 1;
  const r = 108, cx = 160, cy = 160, circ = 2 * Math.PI * r, dash = circ * (volume / 100);

  const Toast = () => toast ? (
    <div style={{ position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.8)", border: `1px solid ${diff.color}`, color: "white", padding: "12px 24px", borderRadius: 12, fontSize: 15, zIndex: 2000, textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", pointerEvents: "none", animation: "fadeIn 0.3s" }}>{toast}</div>
  ) : null;

  if (screen === "select") {
    const selDiff = DIFFICULTIES.find(d => d.id === diffId) || DIFFICULTIES[0];
    return (
      <div style={{ minHeight:"100vh", width: "100%", background:"radial-gradient(ellipse at 50% 0%,#0c1445 0%,#020617 70%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 16px",fontFamily:"Georgia,serif",color:"#ffffff", position: "relative" }}>
        {renderTopMenuBtn()} {renderSidebar()}
        {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} accentColor="#7dd3fc" />}
        <div style={{ textAlign:"center",marginBottom:20 }}>
          <img src={logo} alt="Logo" style={{ display: "block", margin: "0 auto 16px", width: 80, height: 80, borderRadius: 20, boxShadow: "0 0 20px rgba(125, 211, 252, 0.3)" }} />
          <div style={{ fontSize:15,letterSpacing:8,color:"#ffffff",textTransform:"uppercase",marginBottom:8 }}>eL Vision Group</div>
          <h1 style={{ fontSize: isDesktop ? 64 : 54,fontWeight:300,margin:0,letterSpacing:4,color:"#ffffff" }}>The <span style={{ fontStyle:"italic",color:"#7dd3fc" }}>Bump</span></h1>
        </div>
        <div style={{ textAlign: "center", marginBottom: 24, zIndex: 2 }}>
          <button onClick={() => setShowTutorial(true)} style={{ padding:"10px 24px",borderRadius:20, background:"#3b82f622", border:"1px solid #3b82f6", color:"#3b82f6",fontSize:15,fontWeight: "bold", cursor:"pointer", marginBottom: 16 }}>? The Protocol</button>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,maxWidth:380,width:"100%",marginBottom:24 }}>
          {DIFFICULTIES.map(d => (
            <button key={d.id} onClick={() => setDiffId(d.id)} style={{ background: diffId===d.id ? d.color+"22" : "#0f172a", border: `2px solid ${diffId===d.id ? d.color : "#1e293b"}`, borderRadius:14,padding:"16px 12px",cursor:"pointer",textAlign:"left", transition:"all 0.3s" }}>
              <div style={{ fontSize:22,marginBottom:6 }}>{d.icon}</div>
              <div style={{ fontSize:15,color:diffId===d.id?d.color:"#ffffff",fontWeight:"bold" }}>{d.label}</div>
              <div style={{ fontSize:15,color:"#ffffff",marginTop:3 }}>{d.desc}</div>
            </button>
          ))}
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={() => { if (diffId) { resetSession(); setScreen("session"); } }} style={{ padding:"13px 40px",borderRadius:12, background: diffId ? `linear-gradient(135deg,${selDiff?.accent},${selDiff?.color}88)` : "#1e293b", border:`1px solid ${diffId ? selDiff?.color : "#334155"}`, color:diffId?"#fff":"#ffffff",fontSize:15,fontWeight:"bold", cursor:diffId?"pointer":"not-allowed",letterSpacing:1 }}>Mulai Sesi →</button>
        </div>
      </div>
    );
  }

  if (screen === "history") {
    return (
      <div style={{ minHeight:"100vh", width: "100%", background:"#020617", padding: isDesktop ? "48px 80px" : "24px 16px", fontFamily:"Georgia,serif", color:"#ffffff" }}>
        {renderTopMenuBtn()} {renderSidebar()}
        <div style={{ maxWidth: 800, margin: "60px auto 0" }}>
          <h2 style={{ fontSize: 32, marginBottom: 24 }}>History Pencapaian</h2>
          {loadingHistory ? <div style={{ textAlign: "center", padding: 40 }}><Zap className="animate-spin w-8 h-8 mx-auto text-blue-500" /></div> : historyData.length === 0 ? <div style={{ textAlign: "center", padding: 40, background: "rgba(255,255,255,0.05)", borderRadius: 16 }}>Belum ada histori fokus.</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {historyData.map((h) => (
                <div key={h.id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "#3b82f6", fontWeight: "bold" }}>{h.difficulty}</span><span style={{ color: "#94a3b8", fontSize: 14 }}>{h.user_email} • {new Date(h.started_at).toLocaleDateString()}</span></div>
                  <div style={{ fontSize: 18, marginBottom: 12 }}>"{h.desire_text}"</div>
                  <div style={{ display: "flex", gap: 20, fontSize: 14, color: "#94a3b8" }}><span>⚡ {h.bump_count} Bumps</span><span>⏱ {fmt(h.focus_time)}</span><span style={{ color: h.status === 'completed' ? '#4ade80' : '#f87171' }}>● {h.status}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === "settings") {
    return (
      <div style={{ minHeight:"100vh", width: "100%", background:"#020617", padding: isDesktop ? "48px 80px" : "24px 16px", fontFamily:"Georgia,serif", color:"#ffffff" }}>
        {renderTopMenuBtn()} {renderSidebar()}
        <div style={{ maxWidth: 600, margin: "60px auto 0" }}>
          <h2 style={{ fontSize: 32, marginBottom: 24 }}>Settings</h2>
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 32 }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}><div style={{ width: 80, height: 80, borderRadius: "50%", background: "#3b82f6", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}><img src={logo} alt="eL Focus" style={{ width: 40, height: 40, borderRadius: 8 }} /></div><h3 style={{ fontSize: 24 }}>{userMetadata?.display_name || "Focus User"}</h3><p style={{ color: "#94a3b8" }}>{session?.user?.email}</p></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}><div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 4 }}>ID Akun</div><div style={{ fontSize: 14, fontFamily: "monospace" }}>{session?.user?.id}</div></div>
              <button onClick={handleLogout} style={{ marginTop: 24, padding: "14px", borderRadius: 12, background: "#f87171", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><LogOut className="w-5 h-5" /> Logout</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", width: "100%", background:"radial-gradient(ellipse at 60% 10%,#0c1445 0%,#020617 80%)", display:"flex", flexDirection:"column", alignItems:"center", padding: isDesktop ? "48px 80px" : "18px 16px 48px", fontFamily:"Georgia,serif", color:"#ffffff", position:"relative", overflowX:"hidden" }}>
      {renderTopMenuBtn()} {renderSidebar()} <Toast />
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} accentColor={diff.color} />}
      <div style={{ position:"fixed",top:"12%",left:"50%",transform:"translateX(-50%)",width:480,height:480,borderRadius:"50%",background:`radial-gradient(circle,${diff.accent}14 0%,transparent 70%)`,pointerEvents:"none", zIndex: 0 }} />
      {complete && (
        <div style={{ position:"fixed",inset:0,background:"#000000bb",zIndex:4000,display:"flex",alignItems:"center",justifyContent:"center" }}>
          <div style={{ background:"#0f172a",border:`1px solid ${diff.color}44`,borderRadius:20,padding:"30px 26px",textAlign:"center",maxWidth:320 }}>
            <div style={{ fontSize:46,marginBottom:10 }}>🌸</div>
            <div style={{ fontSize:15,color:diff.color,letterSpacing:3,textTransform:"uppercase",marginBottom:6 }}>Protokol Selesai</div>
            <div style={{ fontSize:19,color:"#ffffff",marginBottom:10 }}>Misi Fokus Berhasil</div>
            <button onClick={() => { setComplete(false); resetSession(); setScreen("select"); }} style={{ padding:"11px 24px",borderRadius:10,background:diff.color,border:"none",color:"#000",fontWeight:"bold",fontSize:15,cursor:"pointer" }}>Selesai</button>
          </div>
        </div>
      )}
      <div style={{ textAlign: "center", marginBottom: isDesktop ? 48 : 12, zIndex: 1, width: "100%" }}>
        <img src={logo} alt="Logo" style={{ display: "block", margin: "0 auto 8px", width: 40, height: 40, borderRadius: 8 }} />
        <div style={{ fontSize:15,letterSpacing:6,color:"#ffffff",textTransform:"uppercase" }}>eL Vision Group</div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:2 }}>
          <h1 style={{ fontSize: isDesktop ? 42 : 26,fontWeight:300,margin:0,letterSpacing:3,color:"#ffffff" }}>The <span style={{ fontStyle:"italic",color:diff.color }}>Bump</span></h1>
          <span style={{ fontSize:15,padding:"3px 8px",borderRadius:20,background:diff.color+"22",border:`1px solid ${diff.color}55`,color:diff.color }}>{diff.icon} {diff.label}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: isDesktop ? "row" : "column", alignItems: isDesktop ? "flex-start" : "center", justifyContent: "center", gap: isDesktop ? 60 : 0, zIndex: 1, maxWidth: isDesktop ? 1100 : 800, width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
          <div style={{ position:"relative",width:320,height:320,marginBottom: isDesktop ? 24 : 8,zIndex:1 }}>
            {rings.map(ring => ( <div key={ring.id} style={{ position:"absolute",top:"50%",left:"50%",width:280,height:280,borderRadius:"50%",border:`1.5px solid ${ring.color||diff.color}`,transform:`translate(-50%,-50%) scale(${ring.scale})`,opacity:ring.opacity,pointerEvents:"none" }} /> ))}
            <svg width={320} height={320} style={{ position:"absolute",top:0,left:0 }}>
              <defs><radialGradient id="og2" cx="50%" cy="35%" r="60%"><stop offset="0%" stopColor={diff.color} stopOpacity="0.28" /><stop offset="100%" stopColor={diff.accent} stopOpacity="0.04" /></radialGradient></defs>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={10} />
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={isBumping ? BUMPS[protocolStep - 2]?.color || diff.color : diff.color} strokeWidth={10} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} style={{ transition:"stroke 0.8s" }} />
              <circle cx={cx} cy={cy} r={78*(volume/100)+8} fill="url(#og2)" transform={`scale(${pulseScale}) translate(${cx*(1-pulseScale)},${cy*(1-pulseScale)})`} />
            </svg>
            {activeBubble && ( <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -175px)", background: "rgba(15, 23, 42, 0.92)", border: `1px solid ${diff.color}66`, borderRadius: 12, padding: "10px 14px", maxWidth: 220, textAlign: "center", pointerEvents: "none", zIndex: 10 }}><div style={{ fontSize: 15, color: diff.color, fontStyle: "italic" }}>"{activeBubble}"</div></div> )}
            <div style={{ position:"absolute",top:"50%",left:"50%",transform:`translate(-50%,-50%) scale(${pulseScale})`,textAlign:"center" }}>
              <div style={{ fontSize:50,fontWeight:300,color:isBumping ? BUMPS[protocolStep - 2]?.color || diff.color : diff.color,lineHeight:1 }}>{Math.floor(volume)}<span style={{ fontSize:16,color:"#ffffff" }}>%</span></div>
              <div style={{ fontSize:15,color:"#ffffff",marginTop:3 }}>{isBumping ? `sisa ${fmt(Math.max(0, bumpDurationSec - bumpElapsed))}` : running ? `sisa ${fmt(Math.max(0,diff.focusSec-elapsed))}` : volume>=100 ? "Siap Bump!" : "paused"}</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: isDesktop ? "flex-start" : "center", maxWidth: 460, width: "100%", paddingTop: isDesktop ? 20 : 0 }}>
          <div style={{ marginBottom:16,zIndex:1,display:"flex",alignItems:"center",gap:8 }}>
            <span style={{ fontSize:15,color:"#ffffff" }}>Keinginan:</span>
            {editingDesire ? ( <input autoFocus value={desire} onChange={e=>setDesire(e.target.value)} onBlur={()=>setEditingDesire(false)} onKeyDown={e=>e.key==="Enter"&&setEditingDesire(false)} style={{ background:"#1e293b",border:`1px solid ${diff.color}`,borderRadius:8,padding:"3px 10px",color:diff.color,fontSize:15,outline:"none" }} /> ) : ( <button onClick={()=>setEditingDesire(true)} style={{ background:diff.color+"18",border:`1px solid ${diff.color}44`,borderRadius:8,padding:"3px 12px",color:diff.color,fontSize:15,cursor:"pointer" }}>{desire} ✏️</button> )}
          </div>
          <div style={{ display:"flex",gap:12,zIndex:1,marginBottom:32,alignItems:"center" }}>
            <button onClick={() => { if (!session && !running) { setShowLoginPrompt(true); return; } setRunning(r => !r); if (!running && protocolStep === 1 && !sessionId && session) startTracking(); }} disabled={isBumping || (isVolumeFull && protocolStep >= 2 && protocolStep <= 5)} style={{ padding:"11px 32px",borderRadius:12, background:running?"#1e293b":isBumping?"#0c1422":`linear-gradient(135deg,${diff.accent},${diff.color}88)`, border:`1px solid ${running?"#334155":diff.accent}`, color:running?"#94a3b8":"#fff",fontSize:15,fontWeight:"bold", cursor:"pointer" }}>{running?"⏸ Pause": "◎ Mulai Focus"}</button>
            <button onClick={(e) => { e.preventDefault(); HandleKembali(); }} style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><ChevronLeft className="w-3 h-3" /> Kembali</button>
          </div>
          {showLoginPrompt && ( <div style={{ position:"fixed",inset:0,background:"#000000cc",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}><div style={{ background:"#0f172a",border:`1px solid #3b82f644`,borderRadius:20,maxWidth:400,width:"100%",padding:"32px 24px",textAlign:"center" }}><div style={{ fontSize:40,marginBottom:16 }}>🔒</div><h2 style={{ fontSize:22,color:"#fff",marginBottom:12 }}>Login Terlebih Dahulu</h2><p style={{ fontSize:15,color:"#94a3b8",lineHeight:1.6,marginBottom:24 }}>Simpan progress fokus dan histori pencapaian Anda.</p><div style={{ display:"flex",flexDirection:"column",gap:12 }}><button onClick={() => window.location.href = "/auth"} style={{ width:"100%",padding:"14px",borderRadius:12,background:"#3b82f6",color:"#fff",fontWeight:"bold",fontSize:15,cursor:"pointer",border:"none" }}>Login Sekarang →</button><button onClick={() => setShowLoginPrompt(false)} style={{ width:"100%",padding:"14px",borderRadius:12,background:"transparent",color:"#94a3b8",fontSize:15,cursor:"pointer",border:"1px solid #334155" }}>Nanti Saja</button></div></div></div> )}
          <div style={{ zIndex:1,width:"100%" }}>
            <div style={{ fontSize:15,color:"#ffffff",letterSpacing:3,textTransform:"uppercase",marginBottom:12 }}>Step {protocolStep}/6</div>
            <div style={{ display:"grid", gridTemplateColumns: "1fr 1fr", gap: 14, width: "100%" }}>
              {BUMPS.map((b,i) => { const done = bumpDone[i], active = isBumping && (protocolStep === i + 2), isNext = protocolStep === (i + 2), canClick = isVolumeFull && isNext && !isBumping; return ( <div key={b.id} style={{ position: "relative" }}> {canClick && showFingerHint && ( <div style={{ position: "absolute", top: -36, left: "50%", transform: "translateX(-50%)", fontSize: 22, animation: "fingerBounce 0.8s ease-in-out infinite", pointerEvents: "none", zIndex: 20, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>👇</div> )} <button onClick={()=>handleBump(i)} style={{ padding: "20px 16px", borderRadius:12,cursor: done || isBumping || !isNext ? "default" : "pointer", background:done?"#0f172a":active?b.color+"44":canClick?b.color+"33":"#0c1422", border:`1.5px solid ${done?"#1e293b":active?b.color:canClick?b.color:"#ffffff"}`, textAlign:"left", opacity: done ? 0.6 : isNext || active ? 1 : 0.4, width: "100%" }}> {done&&<div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"#0f172acc",fontSize:20,color:"#4ade80" }}>✓</div>} <div style={{ fontSize: 22,marginBottom:2,color:done?"#334155":b.color }}>{b.emoji}</div> <div style={{ fontSize: 15,color:done?"#ffffff":b.color,fontWeight:"bold" }}>{b.label}</div> <div style={{ fontSize: 17,color:"#ffffff",marginTop:1 }}>{b.sub}</div> {active && ( <div style={{ marginTop: 8, fontSize: 15, color: "#fff", fontWeight: "bold", textTransform: "uppercase" }}> Bumping... {Math.floor((bumpElapsed/bumpDurationSec)*100)}% </div> )} </button> </div> ); })}
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: isDesktop ? 60 : 24,fontSize:15,color:"#ffffff",letterSpacing:1,zIndex:1 }}>© eL Vision Group</div>
      <style>{` 
        @keyframes fadeIn { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } } 
        @keyframes fingerBounce { 0% { transform: translateY(0px) translateX(-50%); } 50% { transform: translateY(-8px) translateX(-50%); } 100% { transform: translateY(0px) translateX(-50%); } }
      `}</style>
    </div>
  );
}
