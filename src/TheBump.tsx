import { useState, useEffect, useRef } from "react";

const DIFFICULTIES = [
  { id: "easy",   label: "Easy",   icon: "🌱", bengongSec: 60,   color: "#4ade80", accent: "#16a34a", desc: "1 Menit Bengong" },
  { id: "medium", label: "Medium", icon: "🔥", bengongSec: 300,  color: "#fbbf24", accent: "#d97706", desc: "5 Menit Bengong" },
  { id: "hard",   label: "Hard",   icon: "⚡", bengongSec: 600,  color: "#f87171", accent: "#dc2626", desc: "10 Menit Bengong" },
  { id: "elzen",  label: "eL Zen", icon: "🌌", bengongSec: 1200, color: "#c4b5fd", accent: "#7c3aed", desc: "20 Menit Bengong" },
];

const BUMPS = [
  { id: 0, label: "Bump Reality",    sub: "Deep Clarity", emoji: "✦", color: "#7dd3fc", accent: "#0ea5e9" },
  { id: 1, label: "Bump Reality",    sub: "Deep Relax",   emoji: "◈", color: "#86efac", accent: "#22c55e" },
  { id: 2, label: "Bump Keinginan",  sub: "Deep Clarity", emoji: "◉", color: "#fcd34d", accent: "#f59e0b" },
  { id: 3, label: "Bump Keinginan",  sub: "Deep Relax",   emoji: "❋", color: "#c4b5fd", accent: "#8b5cf6" },
];

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
    { icon: "◎", title: "Pilih Tingkat Kesulitan", body: "Easy (1 menit) hingga eL Zen (20 menit). Anda harus Bengong hingga Volume 100% sebelum bisa melakukan Bump." },
    { icon: "🌊", title: "Mulai Bengong — Isi Volume", body: "Tekan MULAI BENGONG. Fokuskan perhatian ke satu titik. Anda harus mencapai 100% volume (waktu penuh) untuk mengaktifkan Bump." },
    { icon: "⚡", title: "Prinsip Bump (25%)", body: "Setiap Bump membutuhkan waktu 25% dari total waktu bengong. Contoh: Di level Easy (1 menit), setiap Bump berdurasi 15 detik." },
    { icon: "✦", title: "Proses Bump", body: "Klik Bump saat volume 100%. Tunggu hingga durasi Bump selesai. Setelah selesai, volume akan kosong dan Anda harus Bengong kembali hingga 100% untuk Bump berikutnya." },
    { icon: "🌸", title: "Urutan Protokol", body: "Selesaikan Bump 1 hingga 4 secara berurutan. Di sela-sela Bump, kembalikan fokus ke satu titik untuk mengisi kembali volume Anda." },
  ];
  return (
    <div style={{ position:"fixed",inset:0,background:"#000000cc",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
      <div style={{ background:"#0f172a",border:`1px solid ${accentColor}44`,borderRadius:20,maxWidth:600,width:"100%",maxHeight:"90vh",overflowY:"auto",padding:"32px 24px", boxShadow: "0 0 40px rgba(0,0,0,0.5)" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
          <div>
            <div style={{ fontSize:10,letterSpacing:4,color:accentColor,textTransform:"uppercase" }}>Panduan Lengkap</div>
            <div style={{ fontSize:24,color:"#ffffff",fontFamily:"Georgia,serif",marginTop:2 }}>The Bump Method Protocol</div>
          </div>
          <button onClick={onClose} style={{ background:"#1e293b",border:"1px solid #334155",borderRadius:8,color:"#ffffff",width:34,height:34,cursor:"pointer",fontSize:15 }}>✕</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap:12 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ background:"#1e293b",borderRadius:10,padding:"14px",display:"flex",gap:10,alignItems:"flex-start",border:"1px solid #334155" }}>
              <div style={{ fontSize:16,minWidth:30,height:30,borderRadius:8,background:accentColor+"22",display:"flex",alignItems:"center",justifyContent:"center",color:accentColor }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:11,color:accentColor,fontWeight:"bold",marginBottom:2 }}>{i+1}. {s.title}</div>
                <div style={{ fontSize:11,color:"#ffffff",lineHeight:1.6 }}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop:24,width:"100%",padding:"14px",borderRadius:12,background:`linear-gradient(135deg,${accentColor},${accentColor}88)`,border:"none",color:"#fff",fontSize:14,fontWeight:"bold",cursor:"pointer",letterSpacing:1 }}>
          Saya Mengerti & Siap Berlatih →
        </button>
      </div>
    </div>
  );
}

export default function TheBump() {
  const [screen, setScreen] = useState("select");
  const [diffId, setDiffId] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isBumping, setIsBumping] = useState(false);
  const [bumpElapsed, setBumpElapsed] = useState(0);
  const [activeBumpIdx, setActiveBumpIdx] = useState<number | null>(null);
  const [bumpDone, setBumpDone] = useState([false,false,false,false]);
  const [rings, setRings] = useState<any[]>([]);
  const [showTutorial, setShowTutorial] = useState(true);
  const [desire, setDesire] = useState("Keinginanku");
  const [editingDesire, setEditingDesire] = useState(false);
  const [complete, setComplete] = useState(false);
  const [pulseT, setPulseT] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const ringId = useRef(0);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll to top on screen change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const diff = DIFFICULTIES.find(d => d.id === diffId) || DIFFICULTIES[0];
  const bumpDurationSec = diff.bengongSec * 0.25;
  const isVolumeFull = volume >= 100;
  const nextBumpIndex = bumpDone.indexOf(false);

  // Timer: Bengong Phase
  useEffect(() => {
    if (!running || isBumping || complete) return;
    const id = setInterval(() => {
      setElapsed(e => {
        const next = e + 1;
        const pct = Math.min(100, (next / diff.bengongSec) * 100);
        setVolume(pct);
        if (pct >= 100) setRunning(false);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, isBumping, diff, complete]);

  // Timer: Bump Phase
  useEffect(() => {
    if (!isBumping || activeBumpIdx === null || complete) return;
    const id = setInterval(() => {
      setBumpElapsed(prev => {
        const next = prev + 1;
        // Calculate volume draining or just showing progress
        const remainingPct = 100 - (next / bumpDurationSec) * 100;
        setVolume(Math.max(0, remainingPct));

        if (next >= bumpDurationSec) {
          setIsBumping(false);
          setBumpElapsed(0);
          const newDone = [...bumpDone];
          newDone[activeBumpIdx] = true;
          setBumpDone(newDone);
          setActiveBumpIdx(null);
          setVolume(0);
          setElapsed(0);
          
          if (newDone.every(Boolean)) {
            setTimeout(() => setComplete(true), 700);
          } else {
            showToast(`Bump Selesai. Kembali Fokus 1 Titik untuk isi Volume.`);
          }
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isBumping, activeBumpIdx, bumpDurationSec, bumpDone, complete]);

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
    if (i !== nextBumpIndex) {
      showToast(`Selesaikan Bump ${nextBumpIndex + 1} terlebih dahulu`);
      return;
    }
    if (!isVolumeFull) {
      showToast("Volume Fokus kamu belum cukup untuk Bump (Wajib 100%)");
      return;
    }
    
    setIsBumping(true);
    setActiveBumpIdx(i);
    spawnRing(BUMPS[i].color);
  };

  const resetSession = () => {
    setVolume(0); setElapsed(0); setRunning(false); setIsBumping(false); setBumpElapsed(0);
    setBumpDone([false,false,false,false]); setComplete(false); setRings([]);
  };

  const pulseScale = running || isBumping ? 1 + Math.sin(pulseT * 3) * 0.022 * (isBumping ? 1 : volume / 100) : 1;
  const r = 108, cx = 160, cy = 160;
  const circ = 2 * Math.PI * r;
  const dash = circ * (volume / 100);

  const KembaliBtn = () => (
    <button 
      onClick={() => window.location.href = "https://elvisiongroup.com"} 
      style={{ 
        position: isDesktop ? "fixed" : "absolute", top: 24, left: 24, 
        background: "rgba(239, 68, 68, 0.4)", color: "white", 
        border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "50%", 
        width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, cursor: "pointer", zIndex: 110,
        transition: "all 0.3s"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(239, 68, 68, 0.8)";
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(239, 68, 68, 0.4)";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
       ←
    </button>
  );

  const Toast = () => toast ? (
    <div style={{ position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.8)", border: `1px solid ${diff.color}`, color: "white", padding: "12px 24px", borderRadius: 12, fontSize: 13, zIndex: 200, textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", pointerEvents: "none", animation: "fadeIn 0.3s" }}>
      {toast}
    </div>
  ) : null;

  // ── SELECT SCREEN ──────────────────────────────────────────────────
  if (screen === "select") {
    const selDiff = DIFFICULTIES.find(d => d.id === diffId);
    return (
      <div style={{ minHeight:"100vh", width: "100%", background:"radial-gradient(ellipse at 50% 0%,#0c1445 0%,#020617 70%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 16px",fontFamily:"Georgia,'Times New Roman',serif",color:"#ffffff", position: "relative" }}>
        <KembaliBtn />
        {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} accentColor="#7dd3fc" />}

        <div style={{ textAlign:"center",marginBottom:20 }}>
          <img src="/logo.png" alt="Logo" style={{ width: 80, height: 80, marginBottom: 16, borderRadius: "50%", boxShadow: "0 0 20px rgba(125, 211, 252, 0.3)" }} />
          <div style={{ fontSize:9,letterSpacing:8,color:"#ffffff",textTransform:"uppercase",marginBottom:8 }}>eL Vision Group</div>
          <div style={{ fontSize:10,letterSpacing:5,color:"#7dd3fc",textTransform:"uppercase",marginBottom:6 }}>Metode Fokus Konsentrasi</div>
          <h1 style={{ fontSize: isDesktop ? 64 : 54,fontWeight:300,margin:0,letterSpacing:4,color:"#ffffff" }}>
            The <span style={{ fontStyle:"italic",color:"#7dd3fc" }}>Bump</span>
          </h1>
          <p style={{ fontSize:12,color:"#ffffff",marginTop:8,letterSpacing:1 }}>Sundul · Bengong yang Terarah · Realitas yang Dalam</p>
        </div>


        <div style={{ textAlign: "center", marginBottom: 24, zIndex: 2 }}>
          <button onClick={() => setShowTutorial(true)} style={{ 
            padding:"10px 24px",borderRadius:20,
            background:"#3b82f622",
            border:"1px solid #3b82f6",
            color:"#3b82f6",fontSize:12,fontWeight: "bold",
            cursor:"pointer", marginBottom: 16,
            boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)"
          }}>
            ? The Protocol
          </button>
          <div style={{ fontSize:13,color:"#ffffff",lineHeight:1.7,maxWidth:320,margin:"0 auto" }}>
            Pilih tingkat kesulitan sesuai kemampuan fokusmu saat ini
          </div>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,maxWidth:380,width:"100%",marginBottom:24 }}>
          {DIFFICULTIES.map(d => (
            <button key={d.id} onClick={() => setDiffId(d.id)} style={{
              background: diffId===d.id ? d.color+"22" : "#0f172a",
              border: `2px solid ${diffId===d.id ? d.color : "#1e293b"}`,
              borderRadius:14,padding:"16px 12px",cursor:"pointer",textAlign:"left",
              transition:"all 0.3s",
              boxShadow: diffId===d.id ? `0 0 22px ${d.color}33` : "none",
            }}>
              <div style={{ fontSize:22,marginBottom:6 }}>{d.icon}</div>
              <div style={{ fontSize:14,color:diffId===d.id?d.color:"#ffffff",fontWeight:"bold",fontFamily:"Georgia,serif" }}>{d.label}</div>
              <div style={{ fontSize:11,color:"#ffffff",marginTop:3 }}>{d.desc}</div>
              <div style={{ fontSize:10,color:diffId===d.id?d.color+"99":"#334155",marginTop:6 }}>Bump Durasi = {fmt(d.bengongSec*0.25)}</div>
            </button>
          ))}
        </div>

        <div style={{ display:"flex",gap:10 }}>
          <button onClick={() => { if (diffId) { resetSession(); setScreen("session"); } }} style={{
            padding:"13px 40px",borderRadius:12,
            background: diffId ? `linear-gradient(135deg,${selDiff?.accent},${selDiff?.color}88)` : "#1e293b",
            border:`1px solid ${diffId ? selDiff?.color : "#334155"}`,
            color:diffId?"#fff":"#475569",fontSize:14,fontWeight:"bold",
            cursor:diffId?"pointer":"not-allowed",letterSpacing:1,transition:"all 0.4s",
          }}>Mulai Sesi →</button>
        </div>

        <div style={{ marginTop:32,fontSize:9,color:"#ffffff",letterSpacing:1 }}>© eL Vision Group</div>
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
      // //////////////////////////////////////////////////////////////////
      // // NOTES: Layout Responsif
      // // Desktop: padding: 48px 80px
      // // Mobile: padding: 18px 16px 48px
      // //////////////////////////////////////////////////////////////////
      padding: isDesktop ? "48px 80px" : "18px 16px 48px",
      fontFamily:"Georgia,'Times New Roman',serif",
color:"#ffffff",position:"relative",overflowX:"hidden" }}>
      <KembaliBtn />
      <Toast />
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} accentColor={diff.color} />}

      {/* COMPLETE OVERLAY */}
      {complete && (
        <div style={{ position:"fixed",inset:0,background:"#000000bb",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center" }}>
          <div style={{ background:"#0f172a",border:`1px solid ${diff.color}44`,borderRadius:20,padding:"30px 26px",textAlign:"center",maxWidth:320 }}>
            <div style={{ fontSize:46,marginBottom:10 }}>🌸</div>
            <div style={{ fontSize:10,color:diff.color,letterSpacing:3,textTransform:"uppercase",marginBottom:6 }}>Semua Bump Selesai</div>
            <div style={{ fontSize:19,color:"#ffffff",fontFamily:"Georgia,serif",marginBottom:10 }}>Misi Fokus Berhasil</div>
            <div style={{ fontSize:12,color:"#ffffff",lineHeight:1.7,marginBottom:18 }}>
              Sistem telah ter-install di bawah sadar.<br/>
              Pertahankan kejernihan ini sepanjang hari.
            </div>
            <button onClick={() => { setComplete(false); resetSession(); setScreen("select"); }} style={{ padding:"11px 24px",borderRadius:10,background:diff.color,border:"none",color:"#000",fontWeight:"bold",fontSize:12,cursor:"pointer" }}>Selesai</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: isDesktop ? 48 : 12, 
        zIndex: 1, 
        width: "100%" 
      }}>
        <img src="/logo.png" alt="Logo" style={{ width: 40, height: 40, marginBottom: 8, borderRadius: "50%" }} />
        <div style={{ fontSize:8,letterSpacing:6,color:"#ffffff",textTransform:"uppercase" }}>eL Vision Group</div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:2 }}>
          <h1 style={{ fontSize: isDesktop ? 42 : 26,fontWeight:300,margin:0,letterSpacing:3,color:"#ffffff" }}>
            The <span style={{ fontStyle:"italic",color:diff.color,transition:"color 0.8s" }}>Bump</span>
          </h1>
          <span style={{ fontSize:9,padding:"3px 8px",borderRadius:20,background:diff.color+"22",border:`1px solid ${diff.color}55`,color:diff.color,letterSpacing:1 }}>{diff.icon} {diff.label}</span>
        </div>
      </div>

      <div style={{ 
        display: "flex", 
        flexDirection: isDesktop ? "row" : "column",
        alignItems: isDesktop ? "flex-start" : "center",
        justifyContent: "center",
        gap: isDesktop ? 60 : 0,
        zIndex: 1, 
        maxWidth: isDesktop ? 1100 : 800, 
        width: "100%" 
      }}>
        {/* ////////////////////////////////////////////////////////////////// */}
        {/* // INI DESKTOP VERSION (Layout Utama Centered)                   // */}
        {/* // INI MOBILE VERSION (Layout Utama Centered)                    // */}
        {/* // Jangan salah edit yah, perbedaan hanya pada margin & padding. // */}
        {/* ////////////////////////////////////////////////////////////////// */}

        {/* Orb Section */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>

          <div style={{ position:"relative",width:320,height:320,marginBottom: isDesktop ? 24 : 8,zIndex:1 }}>
            {rings.map(ring => (
              <div key={ring.id} style={{ position:"absolute",top:"50%",left:"50%",width:280,height:280,borderRadius:"50%",border:`1.5px solid ${ring.color||diff.color}`,transform:`translate(-50%,-50%) scale(${ring.scale})`,opacity:ring.opacity,pointerEvents:"none" }} />
            ))}
            <svg width={320} height={320} style={{ position:"absolute",top:0,left:0 }}>
              <defs>
                <radialGradient id="og2" cx="50%" cy="35%" r="60%">
                  <stop offset="0%" stopColor={diff.color} stopOpacity="0.28" />
                  <stop offset="100%" stopColor={diff.accent} stopOpacity="0.04" />
                </radialGradient>
              </defs>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={10} />
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={isBumping ? BUMPS[activeBumpIdx || 0].color : diff.color} strokeWidth={10}
                strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition:"stroke 0.8s",filter:`drop-shadow(0 0 ${isBumping ? 25 : Math.floor(volume/100*22)}px ${isBumping ? BUMPS[activeBumpIdx || 0].color : diff.accent})` }}
              />
              <circle cx={cx} cy={cy} r={78*(volume/100)+8} fill="url(#og2)"
                transform={`scale(${pulseScale}) translate(${cx*(1-pulseScale)},${cy*(1-pulseScale)})`}
              />
            </svg>
            <div style={{ position:"absolute",top:"50%",left:"50%",transform:`translate(-50%,-50%) scale(${pulseScale})`,textAlign:"center" }}>
              <div style={{ fontSize:50,fontWeight:300,color:isBumping ? BUMPS[activeBumpIdx || 0].color : diff.color,lineHeight:1,letterSpacing:-2,transition:"color 0.8s" }}>
                {Math.floor(volume)}<span style={{ fontSize:16,color:"#ffffff" }}>%</span>
              </div>
              <div style={{ fontSize:9,color:isBumping ? BUMPS[activeBumpIdx || 0].accent : diff.accent,letterSpacing:3,textTransform:"uppercase",marginTop:2 }}>
                {isBumping ? "Bumping..." : "Volume"}
              </div>
              <div style={{ fontSize:10,color:"#ffffff",marginTop:3 }}>
                {isBumping ? `sisa ${fmt(Math.max(0, bumpDurationSec - bumpElapsed))}` : running ? `sisa ${fmt(Math.max(0,diff.bengongSec-elapsed))}` : volume>=100?"Siap Bump!":"paused"}
              </div>
            </div>
          </div>

          <div style={{ marginTop:8,zIndex:1,display:"flex",gap:16,alignItems:"center", marginBottom: isDesktop ? 0 : 24 }}>
            {[
              { label:"Bengong", val:fmt(elapsed) },
              { label:"Bump", val:isBumping ? fmt(bumpElapsed) : "0s" },
              { label:"Status", val:`${bumpDone.filter(Boolean).length}/4` },
            ].map((s,i) => (
              <div key={i} style={{ display:"flex",alignItems:"center",gap:16 }}>
                {i>0&&<div style={{ width:1,height:28,background:"#1e293b" }}/>}
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:9,color:"#ffffff",letterSpacing:2,textTransform:"uppercase" }}>{s.label}</div>
                  <div style={{ fontSize:16,color:diff.color }}>{s.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls Section */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: isDesktop ? "flex-start" : "center", 
          maxWidth: 460, 
          width: "100%",
          paddingTop: isDesktop ? 20 : 0
        }}>
          <div style={{ marginBottom:16,zIndex:1,display:"flex",alignItems:"center",gap:8 }}>
            <span style={{ fontSize:10,color:"#ffffff" }}>Keinginan:</span>
            {editingDesire ? (
              <input autoFocus value={desire} onChange={e=>setDesire(e.target.value)} onBlur={()=>setEditingDesire(false)} onKeyDown={e=>e.key==="Enter"&&setEditingDesire(false)} style={{ background:"#1e293b",border:`1px solid ${diff.color}`,borderRadius:8,padding:"3px 10px",color:diff.color,fontSize:12,outline:"none",minWidth:120 }} />
            ) : (
              <button onClick={()=>setEditingDesire(true)} style={{ background:diff.color+"18",border:`1px solid ${diff.color}44`,borderRadius:8,padding:"3px 12px",color:diff.color,fontSize:12,cursor:"pointer" }}>{desire} ✏️</button>
            )}
          </div>

          <div style={{ display:"flex",gap:8,zIndex:1,marginBottom:32,flexWrap:"wrap",justifyContent: isDesktop ? "flex-start" : "center" }}>
            <button onClick={()=>setRunning(r=>!r)} disabled={isBumping} style={{
              padding:"11px 22px",borderRadius:12,
              background:running?"#1e293b":isBumping?"#0c1422":`linear-gradient(135deg,${diff.accent},${diff.color}88)`,
              border:`1px solid ${running?"#334155":diff.accent}`,
              color:running?"#94a3b8":"#fff",fontSize:13,fontWeight:"bold",
              cursor:isBumping?"not-allowed":"pointer",letterSpacing:1,transition:"all 0.3s",
            }}>
              {running?"⏸ Pause":isVolumeFull?"Wajib Bump":"◎ Mulai Bengong"}
            </button>
            <button onClick={resetSession} style={{ padding:"11px 13px",borderRadius:12,background:"transparent",border:"1px solid #1e293b",color:"#ffffff",cursor:"pointer",fontSize:13 }}>↺</button>
            <button onClick={()=>{ resetSession(); setScreen("select"); }} style={{ padding:"11px 13px",borderRadius:12,background:"transparent",border:"1px solid #1e293b",color:"#ffffff",cursor:"pointer",fontSize:12 }}>⟵</button>
          </div>

          <div style={{ zIndex:1,width:"100%" }}>
            <div style={{ fontSize:9,color:"#ffffff",letterSpacing:3,textTransform:"uppercase",textAlign: isDesktop ? "left" : "center", marginBottom:12 }}>
              ⚡ PROTOKOL BUMP — Wajib 100% Vol
            </div>
            <div style={{ display:"grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr 1fr", gap: isDesktop ? 14 : 12, width: "100%" }}>
              {BUMPS.map((b,i) => {
                const done = bumpDone[i];
                const active = activeBumpIdx === i;
                const isNext = i === nextBumpIndex;
                const canClick = isVolumeFull && isNext && !isBumping;
                
                return (
                  <button key={b.id} onClick={()=>handleBump(i)} style={{
                    padding: isDesktop ? "20px 16px" : "12px 10px",
                    borderRadius:12,cursor: done || isBumping ? "default" : isNext ? "pointer" : "not-allowed",
                    background:done?"#0f172a":active?b.color+"44":canClick?b.color+"33":"#0c1422",
                    border:`1.5px solid ${done?"#1e293b":active?b.color:canClick?b.color:"#ffffff"}`,
                    textAlign:"left",transition:"all 0.3s",
                    opacity: done ? 0.6 : isNext || active ? 1 : 0.4,
                    transform:active?"scale(0.96)":canClick?"scale(1.02)":"scale(1)",
                    boxShadow:active||canClick?`0 0 20px ${b.color}44`:"none",
                    position:"relative",overflow:"hidden",
                  }}>
                    {done&&<div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"#0f172acc",fontSize:20,color:"#4ade80" }}>✓</div>}
                    <div style={{ fontSize: isDesktop ? 22 : 15,marginBottom:2,color:done?"#334155":b.color }}>{b.emoji}</div>
                    <div style={{ fontSize: isDesktop ? 12 : 10,color:done?"#334155":b.color,fontWeight:"bold",lineHeight:1.3 }}>{b.label}</div>
                    <div style={{ fontSize: isDesktop ? 11 : 9,color:done?"#1e293b":"#64748b",marginTop:1 }}>{b.sub}</div>
                    
                    {canClick && (
                      <div style={{ marginTop: 8, fontSize: 8, color: b.color, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5, animation: "flash 1s infinite" }}>
                         SIAP BUMP (Klik Sekarang) →
                      </div>
                    )}
                    {active && (
                      <div style={{ marginTop: 8, fontSize: 8, color: "#fff", fontWeight: "bold", textTransform: "uppercase" }}>
                         Bumping... {Math.floor((bumpElapsed/bumpDurationSec)*100)}%
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {!isVolumeFull && !complete && (
              <div style={{ textAlign: "center", marginTop:16, fontSize:11, color:diff.color, fontStyle:"italic" }}>
                 Fokus 1 Titik hingga Volume 100%...
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: isDesktop ? 60 : 24,fontSize:9,color:"#ffffff",letterSpacing:1,zIndex:1 }}>© eL Vision Group · The Bump Method</div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes flash {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
