import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ChevronRight, Shield, Swords, Users, Trophy, Calendar, Zap } from "lucide-react";
import { Link } from "wouter";
import { useGetStore, getGetStoreQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const SERVER_IP = "play.infernosmp.fun";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Home() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { data: ranks } = useGetStore({ query: { queryKey: getGetStoreQueryKey() } });

  const handleCopyIp = () => {
    navigator.clipboard.writeText(SERVER_IP);
    setCopied(true);
    toast({ title: "IP Copied!", description: `${SERVER_IP} copied to clipboard` });
    setTimeout(() => setCopied(false), 2500);
  };

  const features = [
    { icon: Swords, title: "Lifesteal PvP", desc: "Kill players to steal their hearts. Lose all hearts and face elimination." },
    { icon: Calendar, title: "Weekly Events", desc: "Every Sunday at 2PM IST — PvP Tournaments, Clutch Tournaments, and much more." },
    { icon: Users, title: "Active Community", desc: "A thriving, passionate community of players ready to compete and collaborate." },
    { icon: Trophy, title: "Competitive", desc: "Climb the leaderboards and prove you are the strongest player alive." },
  ];

  return (
    <div className="flex flex-col min-h-[100dvh]">

      {/* ── HERO ── */}
      <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: "calc(100vh - 64px)", paddingTop: "64px" }}>
        {/* Background layers */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(255,85,0,0.12),transparent)]" />
        </div>

        <div className="relative z-20 container mx-auto px-6 flex flex-col items-center text-center max-w-4xl">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary/90"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Season 2 is LIVE
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="text-7xl sm:text-8xl md:text-[108px] font-black tracking-tighter leading-none mb-6 text-white glow-text"
          >
            INFERNO SMP
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
          >
            The most ruthless Lifesteal Minecraft Server.<br className="hidden sm:block" /> Forge your legacy in blood and fire.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto"
          >
            <button
              onClick={handleCopyIp}
              className="group flex items-center justify-center gap-2.5 w-full sm:w-auto h-13 px-7 text-base font-bold rounded-xl bg-primary text-white glow-button"
            >
              {copied
                ? <><Check className="h-4.5 w-4.5 shrink-0" /> Copied!</>
                : <><Copy className="h-4.5 w-4.5 shrink-0" /> {SERVER_IP}</>}
            </button>
            <Link href="/store" className="w-full sm:w-auto">
              <button className="flex items-center justify-center gap-2 w-full h-13 px-7 text-base font-bold rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200">
                Go to Store <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />
      </section>

      {/* ── FEATURES ── */}
      <section className="py-28 relative">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Section header */}
          <div className="text-center mb-16">
            <motion.p
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="text-sm font-semibold uppercase tracking-widest text-primary/80 mb-3"
            >
              Why Inferno SMP
            </motion.p>
            <motion.h2
              variants={fadeUp} initial="hidden" whileInView="show" custom={1} viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black tracking-tight text-white"
            >
              Built for Killers
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                custom={idx * 0.5}
                viewport={{ once: true }}
                className="group relative rounded-2xl bg-card border border-border/60 p-6 card-glow hover:border-primary/30 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/4 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center mb-5">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-bold mb-2 text-white">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED RANKS ── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />

        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <div className="text-center mb-16">
            <motion.p
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="text-sm font-semibold uppercase tracking-widest text-primary/80 mb-3"
            >
              Top Ranks
            </motion.p>
            <motion.h2
              variants={fadeUp} initial="hidden" whileInView="show" custom={1} viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black tracking-tight text-white"
            >
              Unlock Your Power
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ranks?.slice(0, 3).map((rank, idx) => (
              <motion.div
                key={rank.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                custom={idx * 0.5}
                viewport={{ once: true }}
                className="group relative rounded-2xl bg-card border border-border/60 p-7 overflow-hidden card-glow"
                style={{ "--rank-color": rank.color } as React.CSSProperties}
              >
                {/* Color glow top corner */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${rank.color}, transparent)` }}
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                  style={{ boxShadow: `inset 0 0 0 1px ${rank.color}22` }}
                />

                <div className="relative z-10">
                  {rank.tag && (
                    <span
                      className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-4"
                      style={{ background: `${rank.color}20`, color: rank.color, border: `1px solid ${rank.color}40` }}
                    >
                      {rank.tag}
                    </span>
                  )}
                  <h3 className="text-2xl font-black mb-1" style={{ color: rank.color }}>{rank.name}</h3>
                  <div className="text-3xl font-bold text-white mb-6">₹{rank.price.toLocaleString()}</div>

                  <ul className="space-y-2.5 mb-7">
                    <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 shrink-0" style={{ color: rank.color }} />
                      {rank.homes} Sethomes
                    </li>
                    {rank.rtpCooldown && (
                      <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Zap className="h-4 w-4 shrink-0" style={{ color: rank.color }} />
                        {rank.rtpCooldown} min RTP Cooldown
                      </li>
                    )}
                    <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 shrink-0" style={{ color: rank.color }} />
                      Exclusive {rank.name} Kit
                    </li>
                  </ul>

                  <Link href="/store">
                    <button
                      className="w-full h-10 rounded-xl text-sm font-bold border transition-all duration-200"
                      style={{
                        borderColor: `${rank.color}40`,
                        color: rank.color,
                        background: `${rank.color}10`,
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = `${rank.color}22`;
                        (e.currentTarget as HTMLButtonElement).style.borderColor = `${rank.color}70`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = `${rank.color}10`;
                        (e.currentTarget as HTMLButtonElement).style.borderColor = `${rank.color}40`;
                      }}
                    >
                      View in Store
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" custom={3} viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link href="/store">
              <button className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-200">
                See all 6 ranks <ChevronRight className="h-4 w-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
