import { useState, useEffect, useRef } from "react";
import { supabase } from "./lib/supabase";
import { Zap } from "lucide-react";

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
  0: [ // Bump 1 - Reality Deep Clarity
    { atPct: 1,  text: () => "Sekarang niatkan yang kamu lihat ini... Jelas begitu dalam" },
    { atPct: 10, text: () => "Niatkan saja jelas begitu dalam, tidak ada keharusan terjadi" },
    { atPct: 50, text: () => "Pertahankan niat yang dalam and santai ini..." },
  ],
  1: [ // Bump 2 - Reality Deep Relax
    { atPct: 1,  text: () => "Sekarang niatkan yang kamu lihat ini... Pasrah begitu dalam" },
    { atPct: 10, text: () => "Niatkan saja pasrah begitu dalam, tidak ada keharusan terjadi" },
    { atPct: 50, text: () => "Pertahankan kepasrahan yang dalam and santai ini..." },
  ],
  2: [ // Bump 3 - Keinginan Deep Clarity
    { atPct: 1,  text: (d) => `Sekarang niatkan "${d}" itu terasa begitu jelas yang dalam` },
    { atPct: 10, text: (d) => `Niatkan saja "${d}" itu jelas begitu dalam, tidak ada keharusan terjadi` },
    { atPct: 50, text: () => "Pertahankan niat kejelasan yang dalam and santai ini..." },
  ],
  3: [ // Bump 4 - Keinginan Deep Relax
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

export default function TheBump({ session }: { session?: any }) {
  const [screen, setScreen] = useState("select");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [diffId, setDiffId] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  
  // Protocol Progress (1-6)
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
  
  const [activeBubble, setActiveBubble] = useState<string | null>(null);
  const [shownFocus, setShownFocus] = useState<Set<number>>(new Set());
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const ringId = useRef(0);
  
  // History Tracking
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll to top on screen or step change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen, protocolStep]);

  const diff = DIFFICULTIES.find(d => d.id === diffId) || DIFFICULTIES[0];
  const bumpDurationSec = diff.focusSec * 0.25;
  const isVolumeFull = volume >= 100;

  // Tracking: Start Session
  const startTracking = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('focus_history')
        .insert({
          user_id: user.id,
          user_email: user.email,
          difficulty: diff.label,
          desire_text: desire,
          status: 'started'
        })
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);
    } catch (err) {
      console.error('Failed to start tracking:', err);
    }
  };

  // Tracking: Complete Session
  const finishTracking = async () => {
    if (!sessionId) return;
    try {
      const totalFocusTime = (protocolStep === 6 ? diff.focusSec : 0) + (bumpDone.filter(Boolean).length * bumpDurationSec);
      
      await supabase
        .from('focus_history')
        .update({
          status: 'completed',
          finished_at: new Date().toISOString(),
          focus_time: Math.floor(totalFocusTime),
          bump_count: bumpDone.filter(Boolean).length
        })
        .eq('id', sessionId);
    } catch (err) {
      console.error('Failed to finish tracking:', err);
    }
  };

  // Tracking: Update Bump Count
  const updateBumpTracking = async (count: number) => {
    if (!sessionId) return;
    try {
      await supabase
        .from('focus_history')
        .update({ bump_count: count })
        .eq('id', sessionId);
    } catch (err) {
      console.error('Failed to update bump tracking:', err);
    }
  };

  // Timer: Focus Phase (Step 1 & Step 6)
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
            setShownFocus(prev => {
              const next2 = new Set(prev);
              next2.add(stepKey);
              return next2;
            });
          }
        }

        if (pct >= 100) {
          setRunning(false);
          if (protocolStep === 1) {
            setProtocolStep(2);
            showToast("Volume Penuh. Siap untuk Bump 1.");
          } else if (protocolStep === 6) {
            finishTracking();
            setTimeout(() => setComplete(true), 700);
          }
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, isBumping, diff, complete, protocolStep, shownFocus, sessionId]);

  // Timer: Bump Phase (Step 2-5)
  useEffect(() => {
    if (!isBumping || complete) return;
    if (protocolStep < 2 || protocolStep > 5) return;

    const id = setInterval(() => {
      setBumpElapsed(prev => {
        const next = prev + 1;
        const remainingPct = 100 - (next / bumpDurationSec) * 100;
        setVolume(Math.max(0, remainingPct));

        const progressPct = Math.floor((next / bumpDurationSec) * 100);
        const activeBumpIdx = protocolStep - 2;
        const key = (activeBumpIdx + 10) * 1000 + progressPct; 
        
        if (!shownFocus.has(key)) {
          const bumpBubbleList = BUMP_BUBBLES[activeBumpIdx] ?? [];
          const match = bumpBubbleList.find(b => b.atPct === progressPct);
          if (match) {
            setActiveBubble(match.text(desire));
            if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
            bubbleTimerRef.current = setTimeout(() => setActiveBubble(null), 4000);
            setShownFocus(prev2 => {
              const next2 = new Set(prev2);
              next2.add(key);
              return next2;
            });
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
          setVolume(nextStep === 6 ? 0 : 100);
          setElapsed(0);
          
          if (nextStep === 6) {
            showToast("Semua Bump Selesai. Balik Focus (Fokus 1 Titik).");
          } else {
            showToast(`Bump ${bumpIndex + 1} Selesai. Lanjut ke Bump ${bumpIndex + 2}.`);
          }
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isBumping, bumpDurationSec, bumpDone, complete, protocolStep, desire, shownFocus, sessionId]);

  // Pulse
  useEffect(() => {
    const id = setInterval(() => setPulseT(t => t + 0.05), 50);
    return () => clearInterval(id);
  }, []);

  // Ring decay
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
    if (bumpDone[i] || isBumping) return;
    
    if (protocolStep !== (i + 2)) {
      if (protocolStep === 1) {
        showToast("Isi Focus (Volume 100%) terlebih dahulu");
      } else {
        showToast(`Sekarang adalah tahap Bump ${protocolStep - 1}`);
      }
      return;
    }

    if (!isVolumeFull) {
      showToast("Volume Fokus kamu belum cukup untuk Bump (Wajib 100%)");
      return;
    }
    
    setIsBumping(true);
    spawnRing(BUMPS[i].color);
  };

  const resetSession = () => {
    setVolume(0); setElapsed(0); setRunning(false); 
    setIsBumping(false); setBumpElapsed(0); setProtocolStep(1);
    setBumpDone([false,false,false,false]); setComplete(false); setRings([]);
    setActiveBubble(null);
    setShownFocus(new Set());
    setSessionId(null);
  };

  const pulseScale = running || isBumping ? 1 + Math.sin(pulseT * 3) * 0.022 * (isBumping ? 1 : volume / 100) : 1;
  const r = 108, cx = 160, cy = 160;
  const circ = 2 * Math.PI * r;
  const dash = circ * (volume / 100);

  function HandleKembali() {
    if (screen === "session") {
      if (protocolStep > 1) {
        const prevStep = protocolStep - 1;
        setProtocolStep(prevStep);
        setIsBumping(false);
        setBumpElapsed(0);
        setRunning(false);
        
        if (prevStep === 1) {
          setVolume(0);
          setElapsed(0);
          setBumpDone([false, false, false, false]);
          setActiveBubble(null);
          setShownFocus(new Set());
        } else {
          setVolume(100);
          const newDone = [...bumpDone];
          for (let i = prevStep - 2; i < 4; i++) {
            if (i >= 0) newDone[i] = false;
          }
          setBumpDone(newDone);
          setShownFocus(prev => {
            const next = new Set(prev);
            const minKeyToRemove = prevStep * 1000;
            for (const key of next) {
              if (key >= minKeyToRemove) next.delete(key);
            }
            return next;
          });
        }
        showToast(`Kembali ke Tahap ${prevStep}`);
      } else {
        resetSession();
        setScreen("select");
      }
    } else {
      window.location.href = "https://focus.elvisiongroup.com";
    }
  }

  const renderBackBtn = () => (
    <button 
      type="button"
      id="back-button-top"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        HandleKembali();
      }} 
      style={{ 
        position: isDesktop ? "fixed" : "absolute", top: 24, left: 24, 
        background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "white", 
        border: "2px solid #ffffff", borderRadius: 8, 
        width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", zIndex: 1100,
        transition: "all 0.3s",
        boxShadow: "0 6px 20px rgba(59, 130, 246, 0.4)"
      }}
    >
       <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" style={{ pointerEvents: "none" }}>
         <path d="M15 18l-6-6 6-6"/>
       </svg>
    </button>
  );

  const Toast = () => toast ? (
    <div style={{ position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.8)", border: `1px solid ${diff.color}`, color: "white", padding: "12px 24px", borderRadius: 12, fontSize: 15, zIndex: 2000, textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", pointerEvents: "none", animation: "fadeIn 0.3s" }}>
      {toast}
    </div>
  ) : null;

  // ── SELECT SCREEN ──────────────────────────────────────────────────
  if (screen === "select") {
    const selDiff = DIFFICULTIES.find(d => d.id === diffId) || DIFFICULTIES[0];
    return (
      <div style={{ minHeight:"100vh", width: "100%", background:"radial-gradient(ellipse at 50% 0%,#0c1445 0%,#020617 70%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 16px",fontFamily:"Georgia,'Times New Roman',serif",color:"#ffffff", position: "relative" }}>
        {renderBackBtn()}
        {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} accentColor="#7dd3fc" />}

        <div style={{ textAlign:"center",marginBottom:20 }}>
          <Zap className="w-16 h-16 mx-auto text-blue-400 mb-4" />
          <div style={{ fontSize:15,letterSpacing:8,color:"#ffffff",textTransform:"uppercase",marginBottom:8 }}>eL Vision Group</div>
          <div style={{ fontSize:15,letterSpacing:5,color:"#7dd3fc",textTransform:"uppercase",marginBottom:6 }}>Metode Fokus Konsentrasi</div>
          <h1 style={{ fontSize: isDesktop ? 64 : 54,fontWeight:300,margin:0,letterSpacing:4,color:"#ffffff" }}>
            The <span style={{ fontStyle:"italic",color:"#7dd3fc" }}>Bump</span>
          </h1>
        </div>


        <div style={{ textAlign: "center", marginBottom: 24, zIndex: 2 }}>
          <button onClick={() => setShowTutorial(true)} style={{ 
            padding:"10px 24px",borderRadius:20,
            background:"#3b82f622",
            border:"1px solid #3b82f6",
            color:"#3b82f6",fontSize:15,fontWeight: "bold",
            cursor:"pointer", marginBottom: 16,
            boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)"
          }}>
            ? The Protocol
          </button>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,maxWidth:380,width:"100%",marginBottom:24 }}>
          {DIFFICULTIES.map(d => (
            <button key={d.id} onClick={() => setDiffId(d.id)} style={{
              background: diffId===d.id ? d.color+"22" : "#0f172a",
              border: `2px solid ${diffId===d.id ? d.color : "#1e293b"}`,
              borderRadius:14,padding:"16px 12px",cursor:"pointer",textAlign:"left",
              transition:"all 0.3s",
            }}>
              <div style={{ fontSize:22,marginBottom:6 }}>{d.icon}</div>
              <div style={{ fontSize:15,color:diffId===d.id?d.color:"#ffffff",fontWeight:"bold" }}>{d.label}</div>
              <div style={{ fontSize:15,color:"#ffffff",marginTop:3 }}>{d.desc}</div>
            </button>
          ))}
        </div>

        <div style={{ display:"flex",gap:10 }}>
          <button onClick={() => { 
            if (diffId) { 
              if (!session) {
                setShowLoginPrompt(true);
                return;
              }
              resetSession(); 
              setScreen("session"); 
              startTracking(); 
            } 
          }} style={{
            padding:"13px 40px",borderRadius:12,
            background: diffId ? `linear-gradient(135deg,${selDiff?.accent},${selDiff?.color}88)` : "#1e293b",
            border:`1px solid ${diffId ? selDiff?.color : "#334155"}`,
            color:diffId?"#fff":"#ffffff",fontSize:15,fontWeight:"bold",
            cursor:diffId?"pointer":"not-allowed",letterSpacing:1,transition:"all 0.4s",
          }}>Mulai Sesi →</button>
        </div>

        {/* LOGIN PROMPT MODAL */}
        {showLoginPrompt && (
          <div style={{ position:"fixed",inset:0,background:"#000000cc",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
            <div style={{ background:"#0f172a",border:`1px solid #3b82f644`,borderRadius:20,maxWidth:400,width:"100%",padding:"32px 24px",textAlign:"center" }}>
              <div style={{ fontSize:40,marginBottom:16 }}>🔒</div>
              <h2 style={{ fontSize:22,color:"#fff",marginBottom:12 }}>Login Terlebih Dahulu</h2>
              <p style={{ fontSize:15,color:"#94a3b8",lineHeight:1.6,marginBottom:24 }}>
                Simpan progress fokus dan histori pencapaian Anda dengan masuk ke akun eL Vision.
              </p>
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                <button 
                  onClick={() => window.location.href = "/auth"} 
                  style={{ width:"100%",padding:"14px",borderRadius:12,background:"#3b82f6",color:"#fff",fontWeight:"bold",fontSize:15,cursor:"pointer",border:"none" }}
                >
                  Login Sekarang →
                </button>
                <button 
                  onClick={() => setShowLoginPrompt(false)} 
                  style={{ width:"100%",padding:"14px",borderRadius:12,background:"transparent",color:"#94a3b8",fontSize:15,cursor:"pointer",border:"1px solid #334155" }}
                >
                  Nanti Saja
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── SESSION SCREEN ─────────────────────────────────────────────────
  return (
    <div style={{ 
      minHeight:"100vh",
      width: "100%",
      background:"radial-gradient(ellipse at 60% 10%,#0c1445 0%,#020617 80%)",
      display:"flex",
      flexDirection:"column",
      alignItems:"center",
      padding: isDesktop ? "48px 80px" : "18px 16px 48px",
      fontFamily:"Georgia,'Times New Roman',serif",
      color:"#ffffff",position:"relative",overflowX:"hidden" 
    }}>
      {renderBackBtn()}
      <Toast />

      {/* COMPLETE OVERLAY */}
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

      {/* Orb Section */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{ position:"relative",width:320,height:320,marginBottom: isDesktop ? 24 : 8,zIndex:1 }}>
          {rings.map(ring => (
            <div key={ring.id} style={{ position:"absolute",top:"50%",left:"50%",width:280,height:280,borderRadius:"50%",border:`1.5px solid ${ring.color||diff.color}`,transform:`translate(-50%,-50%) scale(${ring.scale})`,opacity:ring.opacity,pointerEvents:"none" }} />
          ))}
          <svg width={320} height={320} style={{ position:"absolute",top:0,left:0 }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={10} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={isBumping ? BUMPS[protocolStep - 2]?.color || diff.color : diff.color} strokeWidth={10}
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          </svg>

          {activeBubble && (
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -175px)",
              background: "rgba(15, 23, 42, 0.92)",
              border: `1px solid ${diff.color}66`,
              borderRadius: 12,
              padding: "10px 14px",
              maxWidth: 220,
              textAlign: "center",
              zIndex: 10,
            }}>
              <div style={{ fontSize: 15, color: diff.color, fontStyle: "italic" }}>"{activeBubble}"</div>
            </div>
          )}

          <div style={{ position:"absolute",top:"50%",left:"50%",transform:`translate(-50%,-50%) scale(${pulseScale})`,textAlign:"center" }}>
            <div style={{ fontSize:50,fontWeight:300,color:isBumping ? BUMPS[protocolStep - 2]?.color || diff.color : diff.color,lineHeight:1 }}>
              {Math.floor(volume)}<span style={{ fontSize:16,color:"#ffffff" }}>%</span>
            </div>
            <div style={{ fontSize:15,color:"#ffffff",marginTop:3 }}>
              {isBumping ? `sisa ${fmt(Math.max(0, bumpDurationSec - bumpElapsed))}` : running ? `sisa ${fmt(Math.max(0,diff.focusSec-elapsed))}` : "paused"}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 460, width: "100%" }}>
        <div style={{ marginBottom:16,zIndex:1,display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:15,color:"#ffffff" }}>Keinginan:</span>
          {editingDesire ? (
            <input autoFocus value={desire} onChange={e=>setDesire(e.target.value)} onBlur={()=>setEditingDesire(false)} onKeyDown={e=>e.key==="Enter"&&setEditingDesire(false)} style={{ background:"#1e293b",border:`1px solid ${diff.color}`,borderRadius:8,padding:"3px 10px",color:diff.color,fontSize:15,outline:"none" }} />
          ) : (
            <button onClick={()=>setEditingDesire(true)} style={{ background:diff.color+"18",border:`1px solid ${diff.color}44`,borderRadius:8,padding:"3px 12px",color:diff.color,fontSize:15,cursor:"pointer" }}>{desire} ✏️</button>
          )}
        </div>

        <div style={{ display:"flex",gap:8,zIndex:1,marginBottom:32 }}>
          <button onClick={()=>setRunning(r=>!r)} disabled={isBumping || (isVolumeFull && protocolStep >= 2 && protocolStep <= 5)} style={{
            padding:"11px 32px",borderRadius:12,
            background:running?"#1e293b":`linear-gradient(135deg,${diff.accent},${diff.color}88)`,
            border:`1px solid ${running?"#334155":diff.accent}`,
            color:running?"#94a3b8":"#fff",fontSize:15,fontWeight:"bold",
            cursor:"pointer",letterSpacing:1,
          }}>
            {running?"⏸ Pause":"◎ Mulai Focus"}
          </button>
        </div>

        <div style={{ zIndex:1,width:"100%" }}>
          <div style={{ display:"grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, width: "100%" }}>
            {BUMPS.map((b,i) => {
              const done = bumpDone[i];
              const active = isBumping && (protocolStep === i + 2);
              const isNext = protocolStep === (i + 2);
              const canClick = isVolumeFull && isNext && !isBumping;
              
              return (
                <button key={b.id} onClick={()=>handleBump(i)} style={{
                  padding: "20px 16px",
                  borderRadius:12,cursor: done || isBumping || !isNext ? "default" : "pointer",
                  background:done?"#0f172a":active?b.color+"44":canClick?b.color+"33":"#0c1422",
                  border:`1.5px solid ${done?"#1e293b":active?b.color:canClick?b.color:"#ffffff"}`,
                  textAlign:"left",
                  opacity: done ? 0.6 : isNext || active ? 1 : 0.4,
                }}>
                  <div style={{ fontSize: 22,marginBottom:2,color:b.color }}>{b.emoji}</div>
                  <div style={{ fontSize: 15,color:b.color,fontWeight:"bold" }}>{b.label}</div>
                  <div style={{ fontSize: 17,color:"#ffffff",marginTop:1 }}>{b.sub}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
