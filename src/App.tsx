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

function fmt(sec) {
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return m > 0 ? `${m}m ${ss < 10 ? "0" : ""}${ss}s` : `${ss}s`;
}

function Tutorial({ onClose, accentColor }) {
  const steps = [
    { icon: "◎", title: "Pilih Tingkat Kesulitan", body: "Easy (1 menit) hingga eL Zen (20 menit). Semakin lama bengong, semakin besar volume yang bisa ditampung dan semakin kuat efek bumpnya." },
    { icon: "🌊", title: "Mulai Bengong — Isi Volume", body: "Tekan MULAI BENGONG. Fokuskan perhatian ke satu titik — biarkan pikiran menetap tenang seperti air yang diam. Lingkaran akan terisi sesuai waktu. 90% waktumu adalah di sini." },
    { icon: "⚡", title: "Prinsip Volume", body: "Volume adalah mata uang. Setiap Bump menghabiskan 25% volume (setara 25% waktu bengong). Bump hanya efektif jika volume cukup. Jangan paksa jika kosong." },
    { icon: "✦", title: "Bump 1 — Reality Deep Clarity", body: "Tanyakan dalam hati: "Apakah saya sudah bisa melihat realitas dengan sangat jelas sekarang?" — lalu lupakan, kembali ke bengong." },
    { icon: "◈", title: "Bump 2 — Reality Deep Relax", body: ""Apakah saya sudah bisa pasrah total di realitas ini sekarang?" — ini membangun Deep Reality Set, patokan dari semua keinginan." },
    { icon: "◉", title: "Bump 3 — Keinginan Deep Clarity", body: ""Apakah saya sudah bisa merasakan keinginan saya dengan sangat jelas sekarang?" — rasakan, lalu lepaskan kembali ke bengong." },
    { icon: "❋", title: "Bump 4 — Keinginan Deep Relax", body: ""Apakah saya sudah bisa pasrah total pada keinginan ini sekarang?" — setelah ini, lupakan semua. Kembali bengong. System bekerja otomatis di bawah sadar." },
    { icon: "🌸", title: "Kunci Utama", body: "Jangan paksa bump jika volume kosong. Kembali bengong, isi dulu. Ritme ideal: 90% bengong, 10% bump. Volume adalah segalanya." },
  ];
  return (
    <div style={{ position:"fixed",inset:0,background:"#000000cc",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
      <div style={{ background:"#0f172a",border:`1px solid ${accentColor}44`,borderRadius:20,maxWidth:460,width:"100%",maxHeight:"85vh",overflowY:"auto",padding:"24px 20px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
          <div>
            <div style={{ fontSize:9,letterSpacing:4,color:accentColor,textTransform:"uppercase" }}>Panduan Lengkap</div>
            <div style={{ fontSize:20,color:"#f8fafc",fontFamily:"Georgia,serif",marginTop:2 }}>Tutorial The Bump</div>
          </div>
          <button onClick={onClose} style={{ background:"#1e293b",border:"1px solid #334155",borderRadius:8,color:"#94a3b8",width:34,height:34,cursor:"pointer",fontSize:15 }}>✕</button>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ background:"#1e293b",borderRadius:10,padding:"10px 12px",display:"flex",gap:10,alignItems:"flex-start",border:"1px solid #334155" }}>
              <div style={{ fontSize:16,minWidth:30,height:30,borderRadius:8,background:accentColor+"22",display:"flex",alignItems:"center",justifyContent:"center",color:accentColor }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:11,color:accentColor,fontWeight:"bold",marginBottom:2 }}>{i+1}. {s.title}</div>
                <div style={{ fontSize:11,color:"#94a3b8",lineHeight:1.6 }}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:16,padding:"10px 14px",background:accentColor+"11",borderRadius:10,border:`1px solid ${accentColor}33`,textAlign:"center" }}>
          <div style={{ fontSize:10,color:accentColor,letterSpacing:1,fontStyle:"italic" }}>"Volume adalah Mata Uang · Bump adalah Kunci · Realitas adalah Fondasi"</div>
        </div>
        <button onClick={onClose} style={{ marginTop:14,width:"100%",padding:"11px",borderRadius:10,background:`linear-gradient(135deg,${accentColor},${accentColor}88)`,border:"none",color:"#fff",fontSize:13,fontWeight:"bold",cursor:"pointer",letterSpacing:1 }}>
          Mulai Berlatih →
        </button>
      </div>
    </div>
  );
}

export default function TheBump() {
  const [screen, setScreen] = useState("select");
  const [diffId, setDiffId] = useState(null);
  const [volume, setVolume] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [bumpFlash, setBumpFlash] = useState([false,false,false,false]);
  const [bumpDone, setBumpDone] = useState([false,false,false,false]);
  const [rings, setRings] = useState([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [desire, setDesire] = useState("Keinginanku");
  const [editingDesire, setEditingDesire] = useState(false);
  const [complete, setComplete] = useState(false);
  const [pulseT, setPulseT] = useState(0);
  const ringId = useRef(0);

  const diff = DIFFICULTIES.find(d => d.id === diffId) || DIFFICULTIES[0];
  const bumpCostSec = diff.bengongSec * 0.25;
  const canBump = volume >= 25;
  const sessionStarted = running || volume > 0;

  // Timer
  useEffect(() => {
    if (!running || complete) return;
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
  }, [running, diff, complete]);

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

  const spawnRing = (color) => setRings(prev => [...prev, { id: ringId.current++, scale: 1, opacity: 0.75, color }]);

  const handleBump = (i) => {
    if (!canBump || bumpDone[i]) return;
    spawnRing(BUMPS[i].color);
    setBumpFlash(prev => { const n=[...prev]; n[i]=true; return n; });
    setTimeout(() => setBumpFlash(prev => { const n=[...prev]; n[i]=false; return n; }), 500);
    const newDone = [...bumpDone]; newDone[i] = true;
    setBumpDone(newDone);
    const newPct = Math.max(0, volume - 25);
    setVolume(newPct);
    const newElapsed = Math.max(0, elapsed - bumpCostSec);
    setElapsed(newElapsed);
    if (newDone.every(Boolean)) setTimeout(() => setComplete(true), 700);
  };

  const resetSession = () => {
    setVolume(0); setElapsed(0); setRunning(false);
    setBumpDone([false,false,false,false]); setComplete(false); setRings([]);
  };

  const pulseScale = running ? 1 + Math.sin(pulseT * 3) * 0.022 * (volume / 100) : 1;
  const r = 108, cx = 160, cy = 160;
  const circ = 2 * Math.PI * r;
  const dash = circ * (volume / 100);

  // ── SELECT SCREEN ──────────────────────────────────────────────────
  if (screen === "select") {
    const selDiff = DIFFICULTIES.find(d => d.id === diffId);
    return (
      <div style={{ minHeight:"100vh",background:"radial-gradient(ellipse at 50% 0%,#0c1445 0%,#020617 70%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 16px",fontFamily:"Georgia,'Times New Roman',serif",color:"#e2e8f0" }}>
        {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} accentColor="#7dd3fc" />}

        <div style={{ textAlign:"center",marginBottom:4 }}>
          <div style={{ fontSize:9,letterSpacing:8,color:"#334155",textTransform:"uppercase",marginBottom:8 }}>eL Vision Group</div>
          <div style={{ fontSize:10,letterSpacing:5,color:"#7dd3fc",textTransform:"uppercase",marginBottom:6 }}>Metode Fokus Konsentrasi</div>
          <h1 style={{ fontSize:54,fontWeight:300,margin:0,letterSpacing:4,color:"#f8fafc" }}>
            The <span style={{ fontStyle:"italic",color:"#7dd3fc" }}>Bump</span>
          </h1>
          <p style={{ fontSize:12,color:"#64748b",marginTop:8,letterSpacing:1 }}>Sundul · Bengong yang Terarah · Realitas yang Dalam</p>
        </div>

        <div style={{ width:110,height:110,borderRadius:"50%",margin:"20px 0",background:"radial-gradient(circle at 40% 35%,#7dd3fc33,#0ea5e911 60%,transparent)",border:"1px solid #7dd3fc22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:38 }}>◎</div>

        <div style={{ fontSize:13,color:"#94a3b8",marginBottom:24,textAlign:"center",maxWidth:320,lineHeight:1.7 }}>
          Pilih tingkat kesulitan sesuai kemampuan fokusmu saat ini
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
              <div style={{ fontSize:14,color:diffId===d.id?d.color:"#e2e8f0",fontWeight:"bold",fontFamily:"Georgia,serif" }}>{d.label}</div>
              <div style={{ fontSize:11,color:"#64748b",marginTop:3 }}>{d.desc}</div>
              <div style={{ fontSize:10,color:diffId===d.id?d.color+"99":"#334155",marginTop:6 }}>Bump = {fmt(d.bengongSec*0.25)} / 25%</div>
            </button>
          ))}
        </div>

        <div style={{ display:"flex",gap:10 }}>
          <button onClick={() => { if (diffId) { resetSession(); setScreen("session"); } }} style={{
            padding:"13px 32px",borderRadius:12,
            background: diffId ? `linear-gradient(135deg,${selDiff?.accent},${selDiff?.color}88)` : "#1e293b",
            border:`1px solid ${diffId ? selDiff?.color : "#334155"}`,
            color:diffId?"#fff":"#475569",fontSize:14,fontWeight:"bold",
            cursor:diffId?"pointer":"not-allowed",letterSpacing:1,transition:"all 0.4s",
          }}>Mulai Sesi →</button>
          <button onClick={() => setShowTutorial(true)} style={{ padding:"13px 20px",borderRadius:12,background:"transparent",border:"1px solid #334155",color:"#64748b",fontSize:13,cursor:"pointer" }}>? Tutorial</button>
        </div>

        <div style={{ marginTop:32,fontSize:9,color:"#1e293b",letterSpacing:1 }}>© eL Vision Group</div>
      </div>
    );
  }

  // ── SESSION SCREEN ─────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh",background:"radial-gradient(ellipse at 60% 10%,#0c1445 0%,#020617 80%)",display:"flex",flexDirection:"column",alignItems:"center",padding:"18px 16px 48px",fontFamily:"Georgia,'Times New Roman',serif",color:"#e2e8f0",position:"relative",overflow:"hidden" }}>
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} accentColor={diff.color} />}

      {/* Ambient */}
      <div style={{ position:"fixed",top:"12%",left:"50%",transform:"translateX(-50%)",width:480,height:480,borderRadius:"50%",background:`radial-gradient(circle,${diff.accent}14 0%,transparent 70%)`,pointerEvents:"none",transition:"background 1.2s" }} />

      {/* COMPLETE OVERLAY */}
      {complete && (
        <div style={{ position:"fixed",inset:0,background:"#000000bb",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center" }}>
          <div style={{ background:"#0f172a",border:`1px solid ${diff.color}44`,borderRadius:20,padding:"30px 26px",textAlign:"center",maxWidth:320 }}>
            <div style={{ fontSize:46,marginBottom:10 }}>🌸</div>
            <div style={{ fontSize:10,color:diff.color,letterSpacing:3,textTransform:"uppercase",marginBottom:6 }}>Semua Bump Selesai</div>
            <div style={{ fontSize:19,color:"#f8fafc",fontFamily:"Georgia,serif",marginBottom:10 }}>Kembali ke Bengong</div>
            <div style={{ fontSize:12,color:"#94a3b8",lineHeight:1.7,marginBottom:18 }}>
              Lupakan semua bump. System kini bekerja otomatis di alam bawah sadar.<br/>
              Tugasmu hanya satu: <strong style={{ color:diff.color }}>jaga volume tetap penuh.</strong>
            </div>
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
              <button onClick={() => { setComplete(false); resetSession(); }} style={{ padding:"11px 20px",borderRadius:10,background:diff.color+"22",border:`1px solid ${diff.color}`,color:diff.color,fontSize:12,cursor:"pointer" }}>Sesi Baru</button>
              <button onClick={() => { setComplete(false); resetSession(); setScreen("select"); }} style={{ padding:"11px 20px",borderRadius:10,background:"transparent",border:"1px solid #334155",color:"#64748b",fontSize:12,cursor:"pointer" }}>Ganti Level</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign:"center",marginBottom:12,zIndex:1,width:"100%" }}>
        <div style={{ fontSize:8,letterSpacing:6,color:"#1e293b",textTransform:"uppercase" }}>eL Vision Group</div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:2 }}>
          <h1 style={{ fontSize:26,fontWeight:300,margin:0,letterSpacing:3,color:"#f8fafc" }}>
            The <span style={{ fontStyle:"italic",color:diff.color,transition:"color 0.8s" }}>Bump</span>
          </h1>
          <span style={{ fontSize:9,padding:"3px 8px",borderRadius:20,background:diff.color+"22",border:`1px solid ${diff.color}55`,color:diff.color,letterSpacing:1 }}>{diff.icon} {diff.label}</span>
        </div>
      </div>

      {/* Orb */}
      <div style={{ position:"relative",width:320,height:320,marginBottom:8,zIndex:1 }}>
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
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={diff.color} strokeWidth={10}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition:"stroke 0.8s",filter:`drop-shadow(0 0 ${Math.floor(volume/100*22)}px ${diff.accent})` }}
          />
          <circle cx={cx} cy={cy} r={78*(volume/100)+8} fill="url(#og2)"
            transform={`scale(${pulseScale}) translate(${cx*(1-pulseScale)},${cy*(1-pulseScale)})`}
          />
        </svg>
        <div style={{ position:"absolute",top:"50%",left:"50%",transform:`translate(-50%,-50%) scale(${pulseScale})`,textAlign:"center" }}>
          <div style={{ fontSize:50,fontWeight:300,color:diff.color,lineHeight:1,letterSpacing:-2,transition:"color 0.8s" }}>
            {Math.floor(volume)}<span style={{ fontSize:16,color:"#64748b" }}>%</span>
          </div>
          <div style={{ fontSize:9,color:diff.accent,letterSpacing:3,textTransform:"uppercase",marginTop:2 }}>Volume</div>
          <div style={{ fontSize:10,color:"#475569",marginTop:3 }}>
            {running ? `sisa ${fmt(Math.max(0,diff.bengongSec-elapsed))}` : volume>=100?"Penuh!":"paused"}
          </div>
        </div>
      </div>

      {/* Desire */}
      <div style={{ marginBottom:8,zIndex:1,display:"flex",alignItems:"center",gap:8 }}>
        <span style={{ fontSize:10,color:"#475569" }}>Keinginan:</span>
        {editingDesire ? (
          <input autoFocus value={desire} onChange={e=>setDesire(e.target.value)} onBlur={()=>setEditingDesire(false)} onKeyDown={e=>e.key==="Enter"&&setEditingDesire(false)} style={{ background:"#1e293b",border:`1px solid ${diff.color}`,borderRadius:8,padding:"3px 10px",color:diff.color,fontSize:12,outline:"none",minWidth:120 }} />
        ) : (
          <button onClick={()=>setEditingDesire(true)} style={{ background:diff.color+"18",border:`1px solid ${diff.color}44`,borderRadius:8,padding:"3px 12px",color:diff.color,fontSize:12,cursor:"pointer" }}>{desire} ✏️</button>
        )}
      </div>

      {/* Main Controls */}
      <div style={{ display:"flex",gap:8,zIndex:1,marginBottom:16,flexWrap:"wrap",justifyContent:"center" }}>
        <button onClick={()=>setRunning(r=>!r)} style={{
          padding:"11px 22px",borderRadius:12,
          background:running?"#1e293b":`linear-gradient(135deg,${diff.accent},${diff.color}88)`,
          border:`1px solid ${running?"#334155":diff.accent}`,
          color:running?"#94a3b8":"#fff",fontSize:13,fontWeight:"bold",
          cursor:"pointer",letterSpacing:1,transition:"all 0.3s",
        }}>
          {running?"⏸ Pause":volume>=100?"◎ Bengong Lagi":"◎ Mulai Bengong"}
        </button>
        <button onClick={resetSession} style={{ padding:"11px 13px",borderRadius:12,background:"transparent",border:"1px solid #1e293b",color:"#475569",cursor:"pointer",fontSize:13 }}>↺</button>
        <button onClick={()=>setShowTutorial(true)} style={{ padding:"11px 13px",borderRadius:12,background:"transparent",border:"1px solid #1e293b",color:"#475569",cursor:"pointer",fontSize:13 }}>?</button>
        <button onClick={()=>{ resetSession(); setScreen("select"); }} style={{ padding:"11px 13px",borderRadius:12,background:"transparent",border:"1px solid #1e293b",color:"#475569",cursor:"pointer",fontSize:12 }}>⟵</button>
      </div>

      {/* BUMP BUTTONS */}
      {sessionStarted && (
        <div style={{ zIndex:1,width:"100%",maxWidth:400 }}>
          <div style={{ fontSize:9,color:"#334155",letterSpacing:3,textTransform:"uppercase",textAlign:"center",marginBottom:8 }}>
            ⚡ BUMP — {fmt(bumpCostSec)} / 25% vol per bump
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
            {BUMPS.map((b,i) => {
              const done = bumpDone[i];
              const flash = bumpFlash[i];
              const enabled = canBump && !done;
              return (
                <button key={b.id} onClick={()=>handleBump(i)} disabled={!enabled} style={{
                  padding:"12px 10px",borderRadius:12,cursor:enabled?"pointer":"not-allowed",
                  background:done?"#0f172a":flash?b.color+"44":enabled?b.color+"18":"#0c1422",
                  border:`1.5px solid ${done?"#1e293b":enabled?b.color+"66":"#1e293b"}`,
                  textAlign:"left",transition:"all 0.3s",
                  transform:flash?"scale(0.94)":"scale(1)",
                  boxShadow:enabled&&!done?`0 0 10px ${b.color}22`:"none",
                  position:"relative",overflow:"hidden",
                }}>
                  {done&&<div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"#0f172acc",fontSize:20,color:"#4ade80" }}>✓</div>}
                  <div style={{ fontSize:15,marginBottom:2,color:done?"#334155":b.color }}>{b.emoji}</div>
                  <div style={{ fontSize:10,color:done?"#334155":b.color,fontWeight:"bold",lineHeight:1.3 }}>{b.label}</div>
                  <div style={{ fontSize:9,color:done?"#1e293b":"#64748b",marginTop:1 }}>{b.sub}</div>
                </button>
              );
            })}
          </div>
          {!canBump && (
            <div style={{ textAlign:"center",marginTop:8,fontSize:10,color:"#475569",fontStyle:"italic" }}>
              Volume belum cukup — bengong dulu hingga ≥ 25%
            </div>
          )}
          {bumpDone.every(Boolean)&&!complete&&(
            <div style={{ textAlign:"center",marginTop:8,fontSize:11,color:diff.color }}>
              Semua bump selesai — lupakan, kembali bengong 🌸
            </div>
          )}
        </div>
      )}

      {/* Stats row */}
      <div style={{ marginTop:18,zIndex:1,display:"flex",gap:16,alignItems:"center" }}>
        {[
          { label:"Bengong", val:fmt(elapsed) },
          { label:"Target", val:fmt(diff.bengongSec) },
          { label:"Bump", val:`${bumpDone.filter(Boolean).length}/4` },
        ].map((s,i) => (
          <div key={i} style={{ display:"flex",alignItems:"center",gap:16 }}>
            {i>0&&<div style={{ width:1,height:28,background:"#1e293b" }}/>}
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:9,color:"#334155",letterSpacing:2,textTransform:"uppercase" }}>{s.label}</div>
              <div style={{ fontSize:16,color:i===1?"#475569":diff.color }}>{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:24,fontSize:9,color:"#1e293b",letterSpacing:1,zIndex:1 }}>© eL Vision Group · The Bump Method</div>
    </div>
  );
}
