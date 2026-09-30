import { motion } from 'framer-motion';
import { SEO } from '../components/layout/SEO';
import { TextReveal } from '../components/layout/TextReveal';
import { ShieldCheck, Sparkles, Scissors, Globe } from 'lucide-react';
import Link from 'next/link';

export function About() {
  return (
    <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-[#030303] text-[#fafafa] min-h-screen">
      <SEO 
        title="Atelier Heritage & Story" 
        description="Discover Maison WEARITION — Pakistan's premier luxury fashion atelier bridging ancestral craft with modern couture and authenticated designer resale."
      />
      
      <div className="max-w-[1100px] mx-auto">
        {/* Eyebrow & Title */}
        <header className="mb-16 md:mb-24 text-center">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#adadad] block mb-4">
            [THE MAISON HERITAGE]
          </span>
          <TextReveal as="h1" className="font-serif text-4xl sm:text-6xl md:text-7xl text-white mb-6 text-center">
            Wear Your Identity
          </TextReveal>
          <p className="text-base sm:text-lg font-sans text-[#adadad] max-w-2xl mx-auto leading-relaxed">
            Maison WEARITION was born from a singular commitment: to honor Pakistan&apos;s timeless heritage of textile craftsmanship while redefining modern luxury for the global visionary.
          </p>
        </header>

        {/* Narrative Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8 text-white/80 font-sans leading-relaxed text-base sm:text-lg mb-20 max-w-3xl mx-auto"
        >
          <p>
            At WEARITION, we believe couture is never merely cloth—it is wearable sculpture, living history, and an intimate expression of personal sovereignty. Founded in Karachi, the historic epicenter of South Asian textiles, our atelier unites third-generation zardozi master artisans with contemporary silhouette engineering.
          </p>
          <p>
            In an era of disposable fashion, we champion permanence. Whether hand-embroidering a bespoke bridal heirloom requiring over 400 artisan hours or physically authenticating an iconic archival piece from Pakistan&apos;s most revered design houses, every creation that passes through our hands meets an unyielding standard of perfection.
          </p>
          <p>
            Today, WEARITION serves a private patron community spanning Karachi, Lahore, and Islamabad to London, Dubai, New York, and Toronto—bringing ancestral haute couture to the world&apos;s grandest stages.
          </p>
        </motion.div>

        {/* 4 Pillars of Excellence */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          <div className="p-8 rounded-xl border border-white/10 bg-[#0d0d0d] flex flex-col justify-between">
            <div>
              <Scissors className="w-6 h-6 text-[#339e9b] mb-4" />
              <h3 className="font-serif text-lg text-white mb-2 uppercase tracking-wide">Ancestral Needlecraft</h3>
              <p className="text-xs text-[#adadad] leading-relaxed">Preserving authentic hand-embroidered zardozi, tilla, mukesh, and dabka by hereditary masters.</p>
            </div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-6">01 &bull; Artisanal</span>
          </div>

          <div className="p-8 rounded-xl border border-white/10 bg-[#0d0d0d] flex flex-col justify-between">
            <div>
              <ShieldCheck className="w-6 h-6 text-[#339e9b] mb-4" />
              <h3 className="font-serif text-lg text-white mb-2 uppercase tracking-wide">Guaranteed Authenticity</h3>
              <p className="text-xs text-[#adadad] leading-relaxed">Multi-point physical verification of fabric weave, hallmarks, and provenance for all designer resale pieces.</p>
            </div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-6">02 &bull; Verified</span>
          </div>

          <div className="p-8 rounded-xl border border-white/10 bg-[#0d0d0d] flex flex-col justify-between">
            <div>
              <Sparkles className="w-6 h-6 text-[#339e9b] mb-4" />
              <h3 className="font-serif text-lg text-white mb-2 uppercase tracking-wide">Bespoke Precision</h3>
              <p className="text-xs text-[#adadad] leading-relaxed">Custom millimeter tailoring, one-on-one virtual fittings, and private atelier bridal consultations.</p>
            </div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-6">03 &bull; Bespoke</span>
          </div>

          <div className="p-8 rounded-xl border border-white/10 bg-[#0d0d0d] flex flex-col justify-between">
            <div>
              <Globe className="w-6 h-6 text-[#339e9b] mb-4" />
              <h3 className="font-serif text-lg text-white mb-2 uppercase tracking-wide">Global White-Glove</h3>
              <p className="text-xs text-[#adadad] leading-relaxed">Worldwide insured express shipping via DHL to the US, UK, UAE, Canada, and Europe in archival packaging.</p>
            </div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-6">04 &bull; Global</span>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="text-center pt-12 border-t border-white/10">
          <span className="text-xs uppercase tracking-[0.25em] font-mono text-[#adadad] block mb-4">
            BEGIN YOUR COUTURE JOURNEY
          </span>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/shop" className="buttonprimary">
              <span>EXPLORE THE ARCHIVE ↗</span>
            </Link>
            <Link href="/contact" className="buttonsecondary">
              <span>BOOK A CONSULTATION</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
