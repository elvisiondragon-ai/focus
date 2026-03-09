import { useNavigate } from "react-router-dom";
import { ChevronLeft, Zap, Sliders, Layers, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function Explain() {
    const navigate = useNavigate();

    const sections = [
        {
            icon: <Zap className="w-6 h-6 text-yellow-400" />,
            title: "Volume Focus",
            content: (
                <>
                    Sistem tubuh kita saat fokus pada satu titik membangun apa yang disebut <strong>Volume Focus</strong>.
                    Semakin lama Anda fokus, "kuota" volume ini akan terus naik (bisa mencapai 1.000, 10.000, hingga 30.000)
                    tergantung pada durasi sesi Anda. Volume ini adalah bahan bakar utama untuk eksekusi perubahan realitas.
                </>
            )
        },
        {
            icon: <Layers className="w-6 h-6 text-blue-400" />,
            title: "eL Triangle",
            content: (
                <>
                    <strong>eL Triangle</strong> adalah sebuah nama unik untuk perpaduan tiga elemen inti:
                    <em> Deep Clarity</em>, <em>Deep Relax</em>, dan <em>Fokus pada 1 Objek</em>.
                    Hanya eL Triangle yang dirakit dengan rapi yang dapat dimengerti dan diproses oleh
                    Volume Focus Anda.
                </>
            )
        },
        {
            icon: <Sliders className="w-6 h-6 text-purple-400" />,
            title: "Hukum Kesetaraan Realitas",
            content: (
                <>
                    Keinginan hanya bisa tereksekusi setara dengan realitas kenyataan saat ini.
                    Jika realitas Anda sedang sedih, mustahil menarik keinginan yang sangat bahagia secara instan.
                    eL Triangle membantu Anda menyelaraskan frekuensi ini agar manifestasi menjadi mungkin.
                    Realitas senang menarik keinginan senang, realitas sedih menarik keinginan sedih.
                </>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 font-sans selection:bg-blue-500/30" style={{ fontSize: "18px", lineHeight: "1.7" }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto flex items-center mb-12"
            >
                <button
                    onClick={() => navigate("/")}
                    className="mr-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-3xl md:text-4xl font-serif font-light tracking-tight">
                    Mengenal <span className="italic text-blue-400">The Protocol</span>
                </h1>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-12">
                {/* Core Concepts */}
                <div className="grid gap-8">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    {section.icon}
                                </div>
                                <h2 className="text-2xl font-semibold tracking-wide">{section.title}</h2>
                            </div>
                            <div className="text-slate-300 font-light">
                                {section.content}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* 2 Types of eL Triangle */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Info className="w-6 h-6 text-blue-300" />
                        <h2 className="text-2xl font-bold">Dua Jenis eL Triangle</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 text-[17px]">
                        <div className="p-5 bg-black/30 rounded-xl border border-white/5">
                            <h3 className="text-blue-300 font-bold mb-2">1. eL Triangle Reality</h3>
                            <p className="text-slate-400">Gabungan Realitas Deep Clarity + Deep Relax + Focus. Digunakan untuk memperdalam pijakan pada kenyataan saat ini.</p>
                        </div>
                        <div className="p-5 bg-black/30 rounded-xl border border-white/5">
                            <h3 className="text-purple-300 font-bold mb-2">2. eL Triangle Desire</h3>
                            <p className="text-slate-400">Gabungan Keinginan Deep Clarity + Deep Relax + Focus. Digunakan untuk menarik niat/goal ke dalam realitas.</p>
                        </div>
                    </div>
                </motion.div>

                {/* 3 Step Protocol */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-serif italic text-center mb-8">3 Langkah Merakit eL Triangle</h2>
                    <div className="space-y-4">
                        {[
                            {
                                step: "01",
                                title: "Focus to Clarity Deep",
                                desc: "Lihat satu objek. Niatkan 'Apa yang aku lihat jelas sangat dalam'. Rasakan ketajaman visual Anda bertambah."
                            },
                            {
                                step: "02",
                                title: "Focus to Relax Deep",
                                desc: "Sambil tetap melihat objek, niatkan 'Yang aku lihat relax pasrah sangat dalam'. Rasakan ketegangan tubuh meluruh."
                            },
                            {
                                step: "03",
                                title: "The Fusion (eL Triangle)",
                                desc: "Gabungkan keduanya. Rasakan realita itu jernih sekaligus pasrah secara bersamaan. Inilah bahasa yang dimengerti oleh Volume Fokus."
                            }
                        ].map((step, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ scale: 1.01 }}
                                className="flex gap-6 p-6 bg-white/5 border border-white/5 rounded-xl items-center"
                            >
                                <span className="text-4xl font-extrabold text-white/10">{step.step}</span>
                                <div>
                                    <h4 className="text-xl font-bold text-blue-100">{step.title}</h4>
                                    <p className="text-slate-400 text-[17px]">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Closing Footnote */}
                <div className="text-center py-12 border-t border-white/10">
                    <p className="text-slate-500 italic">
                        "Tugas kita adalah membuild eL Triangle ini serapi mungkin untuk diserahkan ke Volume Fokus."
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-8 px-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-bold transition-all shadow-lg shadow-blue-900/40"
                    >
                        Mulai Latihan Sekarang
                    </button>
                </div>
            </div>
        </div>
    );
}
