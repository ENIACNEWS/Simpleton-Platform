import creatorPhoto from "@assets/image_1757284919816.jpeg";
import { Link } from "wouter";
import { Home, Award, Gem, Watch, TrendingUp, Sparkles, Mail, ChevronRight, Star, Shield, BookOpen, Zap, Coins, Brain, Camera, MessageSquare, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
  })
};

export default function About() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.02]" style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }} />
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex justify-between items-center mb-12"
        >
          <Link href="/">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200" style={{ backgroundColor: 'var(--muted)', border: '1px solid', borderColor: 'var(--border)' }}>
              <Home size={16} style={{ color: 'var(--primary)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>Home</span>
            </div>
          </Link>
          <div className="flex items-center space-x-1.5">
            <Star className="w-3 h-3" style={{ color: 'var(--primary)' }} />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: 'var(--muted-foreground)' }}>
              Est. 2024
            </span>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          custom={0}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="text-center mb-16"
        >
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 rounded-full opacity-20 blur-xl" style={{ backgroundColor: 'var(--primary)' }} />
            <div className="relative p-1 rounded-full" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary))', padding: '3px' }}>
              <div className="rounded-full p-1.5" style={{ backgroundColor: 'var(--background)' }}>
                <img
                  src={creatorPhoto}
                  alt="Demiris Brown - Creator of Simpleton"
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover"
                  style={{ border: '2px solid', borderColor: 'var(--border)' }}
                />
              </div>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] mb-3" style={{ color: 'var(--primary)' }}>
              Founder & Creator
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ color: 'var(--foreground)' }}>
              Demiris Brown
            </h1>
          </div>

          <p className="text-sm font-medium max-w-md mx-auto mb-6" style={{ color: 'var(--muted-foreground)' }}>
            Jeweler · Certified Diamond Grader · Appraiser · Pawnshop General Manager
          </p>
          <div className="flex items-center justify-center space-x-6 mb-6">
            <div className="flex items-center space-x-1.5">
              <Gem className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>15+ Years in the Industry</span>
            </div>
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--muted-foreground)', opacity: 0.3 }} />
            <div className="flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Detroit, Michigan</span>
            </div>
          </div>

          <div className="w-16 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, var(--primary), transparent)' }} />
        </motion.div>

        {/* Founder's Story */}
        <motion.div
          custom={1}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="mb-10 p-8 md:p-10 rounded-2xl"
          style={{ backgroundColor: 'var(--card)', border: '1px solid', borderColor: 'var(--border)' }}
        >
          <p className="text-lg md:text-xl leading-relaxed font-light mb-6" style={{ color: 'var(--foreground)' }}>
            For more than a decade I've worked across nearly every corner of the jewelry industry — as a jeweler, certified diamond grader, jewelry appraiser, and pawnshop general manager. Those roles put me on the front lines of buying, selling, grading, and evaluating precious metals, diamonds, and luxury watches every single day.
          </p>
          <p className="text-base leading-relaxed font-light mb-6" style={{ color: 'var(--foreground)' }}>
            Over time I began hearing the same questions again and again — from customers, collectors, and even people entering the trade:
          </p>
          <div className="space-y-3 mb-6">
            {[
              "What is this gold really worth?",
              "How do I know a diamond's true market value?",
              "Where can I compare prices without digging through confusing industry jargon?"
            ].map((q, i) => (
              <div key={i} className="flex items-start space-x-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--muted)' }}>
                <span className="text-lg" style={{ color: 'var(--primary)' }}>"</span>
                <p className="text-sm font-medium italic" style={{ color: 'var(--foreground)' }}>{q}</p>
              </div>
            ))}
          </div>
          <p className="text-base leading-relaxed font-light mb-5" style={{ color: 'var(--foreground)' }}>
            The truth is, the information exists — but it's scattered across professional tools, industry reports, and complicated pricing guides that most people never see.
          </p>
          <div className="flex items-center space-x-3 px-5 py-4 rounded-xl" style={{ backgroundColor: 'var(--muted)', border: '1px solid', borderColor: 'var(--primary)', borderLeftWidth: '3px' }}>
            <Sparkles className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
            <p className="text-base font-semibold" style={{ color: 'var(--primary)' }}>
              That's why I created <span className="simpleton-brand">Simpleton</span>.
            </p>
          </div>
        </motion.div>

        {/* Why I Built It */}
        <motion.div
          custom={2}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="mb-10 p-8 md:p-10 rounded-2xl"
          style={{ backgroundColor: 'var(--card)', border: '1px solid', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid', borderColor: 'var(--border)' }}>
              <BookOpen className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Why I Built Simpleton</h2>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>The story behind the platform</p>
            </div>
          </div>
          <div className="space-y-4 text-base leading-relaxed font-light" style={{ color: 'var(--foreground)' }}>
            <p>
              Throughout my career I've graded thousands of diamonds and evaluated precious metals daily. One thing became very clear: the market moves fast.
            </p>
            <p>
              Gold and silver spot prices change by the minute. Diamond pricing guides update often. Luxury watch values can shift overnight.
            </p>
            <p>
              Yet most online tools either assume you're already an expert or oversimplify the data to the point where it becomes unreliable. <span className="simpleton-brand">Simpleton</span> bridges that gap.
            </p>
            <p>
              The platform combines professional-grade data with tools designed to be clear, fast, and accessible:
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {[
              { icon: TrendingUp, label: "A live gold calculator connected to real spot pricing" },
              { icon: Gem, label: "A diamond pricing database built from actual market comparisons" },
              { icon: Watch, label: "A Rolex authentication system powered by Simplicity, our AI" },
              { icon: Coins, label: "A coin calculator for silver and gold melt value on US coins" },
              { icon: Brain, label: "Simplicity — an AI assistant that learns your preferences and answers market questions with live pricing" },
              { icon: Camera, label: "A jewelry appraisal tool that analyzes photos and estimates value ranges" },
              { icon: MessageSquare, label: "A mail organizer that uses Simplicity to prioritize and summarize your inbox" },
            ].map((item, i) => (
              <div key={i} className="flex items-start space-x-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--muted)' }}>
                <item.icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{item.label}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-base font-semibold" style={{ color: 'var(--primary)' }}>
            The goal is straightforward: professional-level accuracy without professional-level complexity.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          custom={3}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="mb-10 p-8 md:p-10 rounded-2xl"
          style={{ backgroundColor: 'var(--card)', border: '1px solid', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid', borderColor: 'var(--border)' }}>
              <Shield className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Our Mission</h2>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Democratizing market intelligence</p>
            </div>
          </div>
          <div className="space-y-4 text-base leading-relaxed font-light" style={{ color: 'var(--foreground)' }}>
            <p>
              My mission is to give both new professionals and curious collectors access to the kind of information traditionally kept behind the counter.
            </p>
            <p>
              If you're just entering the industry, <span className="simpleton-brand">Simpleton</span> provides pricing insights and tools that normally take years to learn. If you've been in the business for decades, you'll appreciate advanced features like customizable pricing models, detailed comparisons, and fast market calculations.
            </p>
            <p>
              Beyond the tools themselves, <span className="simpleton-brand">Simpleton</span> also offers educational resources covering:
            </p>
          </div>
          <div className="mt-5 space-y-2">
            {[
              "Diamond grading fundamentals",
              "Rolex model history and identification",
              "Best practices for buying, selling, and evaluating jewelry in today's market",
              "How to use Simplicity to get live market answers in plain language"
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-3 px-3 py-2.5 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--primary)' }} />
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{item}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Credentials Grid */}
        <motion.div
          custom={4}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-4 mb-10"
        >
          <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--card)', border: '1px solid', borderColor: 'var(--border)' }}>
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid', borderColor: 'var(--border)' }}>
                <Award className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Expertise</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Diamond Trading & Grading", desc: "Certified professional" },
                { label: "Jewelry Appraisals", desc: "Multi-stone specialist" },
                { label: "Precious Metals Evaluation", desc: "Gold, silver, platinum" },
                { label: "Rolex Authentication", desc: "Simplicity-enhanced verification" },
                { label: "Pawnshop Operations", desc: "General management" },
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-3 px-3 py-2.5 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--primary)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{item.label}</p>
                    <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--card)', border: '1px solid', borderColor: 'var(--border)' }}>
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid', borderColor: 'var(--border)' }}>
                <Zap className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Platform Features</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Simplicity AI Assistant", desc: "Remembers you, learns your market" },
                { label: "Live Precious Metals Pricing", desc: "Gold, silver, platinum, palladium" },
                { label: "Diamond Rap Grid Calculator", desc: "Rapaport-based market pricing" },
                { label: "Coin Melt Value Calculator", desc: "Pre-1965 silver & gold coins" },
                { label: "Jewelry Appraisal by Photo", desc: "Simplicity-powered estimate" },
                { label: "Simplicity Mail Organizer", desc: "Inbox prioritized by Simplicity" },
                { label: "Rolex Authentication", desc: "Model analysis & market value" },
                { label: "Quantum Data Software™", desc: "Next-gen data architecture" },
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-3 px-3 py-2.5 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--primary)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{item.label}</p>
                    <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Why This Matters */}
        <motion.div
          custom={5}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="mb-10 p-8 md:p-10 rounded-2xl"
          style={{ backgroundColor: 'var(--card)', border: '1px solid', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid', borderColor: 'var(--border)' }}>
              <BarChart3 className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Why This Matters to Me</h2>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>More than a platform</p>
            </div>
          </div>
          <div className="space-y-4 text-base leading-relaxed font-light" style={{ color: 'var(--foreground)' }}>
            <p>
              <span className="simpleton-brand">Simpleton</span> is more than just a platform — it's my passion project.
            </p>
            <p>
              It represents everything I've learned from years in the trade, every mistake I made along the way, and every tool I wish I had when I first stepped behind the counter.
            </p>
            <p>
              My goal is simple: make the jewelry market easier to understand for everyone.
            </p>
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          custom={6}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="rounded-2xl p-8 md:p-10 text-center mb-10"
          style={{ backgroundColor: 'var(--card)', border: '1px solid', borderColor: 'var(--primary)' }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: 'var(--muted)', border: '1px solid', borderColor: 'var(--border)' }}>
            <Mail className="w-6 h-6" style={{ color: 'var(--primary)' }} />
          </div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Thank You for Choosing Simpleton</h3>
          <p className="text-sm leading-relaxed max-w-lg mx-auto mb-6" style={{ color: 'var(--muted-foreground)' }}>
            I hope Simpleton makes your buying, selling, and learning experiences smoother, more transparent, and above all — simple. If you ever have questions, feedback, or just want to share a success story, I'd love to hear from you.
          </p>

          <a
            href="mailto:Intel@Simpletonapp.com"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200"
            style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 20%, var(--card))', color: 'var(--primary)', border: '1px solid color-mix(in srgb, var(--primary) 40%, transparent)' }}
          >
            <Mail className="w-4 h-4" />
            <span>Intel@<span className="simpleton-brand">Simpleton</span>app.com</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </a>

          <div className="mt-8 pt-6" style={{ borderTop: '1px solid', borderColor: 'var(--border)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              Thank you,
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: 'var(--primary)' }}>
              Demiris Brown
            </p>
            <p className="text-[11px] mt-1 uppercase tracking-[0.2em]" style={{ color: 'var(--muted-foreground)' }}>
              Founder, <span className="simpleton-brand">Simpleton</span>™
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center pb-8">
          <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}>
            <span className="simpleton-brand">Simpleton</span>™ {new Date().getFullYear()} — Precision Pricing, Simplified
          </p>
        </div>
      </div>
    </div>
  );
}
