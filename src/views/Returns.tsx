"use client";
import { motion } from 'framer-motion';
import { SEO } from '../components/layout/SEO';
import { TextReveal } from '../components/layout/TextReveal';
import { RefreshCcw, ShieldCheck, AlertCircle, Clock } from 'lucide-react';

export function Returns() {
  return (
    <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-background min-h-screen">
      <SEO 
        title="Returns & Exchanges" 
        description="Learn about our returns and exchanges policy. Quality and customer satisfaction are our priorities."
      />
      <div className="max-w-[1000px] mx-auto">
        <header className="mb-20">
          <span className="text-accent text-[10px] uppercase tracking-[0.4em] mb-4 block font-bold">Policy & Care</span>
          <TextReveal as="h1" className="font-serif text-4xl sm:text-5xl md:text-7xl text-foreground mb-8">
            Returns & Exchanges
          </TextReveal>
          <div className="h-px w-full bg-border-color/30"></div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <RefreshCcw className="w-5 h-5 text-accent" />
                <h2 className="uppercase text-[11px] tracking-[0.2em] font-bold text-foreground">Exchange Policy</h2>
              </div>
              <p className="text-sm text-foreground/60 leading-loose font-sans">
                Exchanges are only applicable if the received item is found to be <span className="text-foreground font-medium">defective or damaged</span> upon arrival. We strive for perfection, but if a mistake occurs, we are here to rectify it.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-accent" />
                <h2 className="uppercase text-[11px] tracking-[0.2em] font-bold text-foreground">Timeframe</h2>
              </div>
              <p className="text-sm text-foreground/60 leading-loose font-sans">
                Any exchange or return request must be initiated within <span className="text-foreground font-medium">7 days</span> of delivery. After this period, requests cannot be processed.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-accent" />
                <h2 className="uppercase text-[11px] tracking-[0.2em] font-bold text-foreground">Return Conditions</h2>
              </div>
              <p className="text-sm text-foreground/60 leading-loose font-sans">
                Returns are only accepted in cases of <span className="text-foreground font-medium">valid technical issues or wrong item delivery</span>. Items must be in their original packaging, unworn, and with all tags intact.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-accent" />
                <h2 className="uppercase text-[11px] tracking-[0.2em] font-bold text-foreground">Final Sale</h2>
              </div>
              <p className="text-sm text-foreground/60 leading-loose font-sans italic">
                Items bought on sale or special promotion are generally not eligible for return or exchange unless a major manufacturing defect is proven.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="bg-background-secondary/20 border border-white/5 p-10 md:p-16 rounded-sm">
          <h3 className="font-serif text-2xl md:text-3xl mb-8 text-foreground text-center">Process for Exchange</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Documentation", desc: "Take clear photos or a video of the defect immediately upon unboxing." },
              { step: "02", title: "Contact Us", desc: "Email your request along with evidence to wearition.80@gmail.com." },
              { step: "03", title: "Verification", desc: "Our team will verify the claim and arrange for a pick-up or exchange." }
            ].map((item, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-accent text-3xl font-serif mb-4">{item.step}</span>
                <h4 className="uppercase text-[10px] tracking-widest mb-3 font-bold">{item.title}</h4>
                <p className="text-xs text-foreground/50 leading-relaxed font-sans">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
          <p className="text-sm text-foreground/40 mb-8 font-sans">Need further clarification?</p>
          <Link href="/contact" className="inline-block uppercase text-[10px] tracking-[0.3em] font-bold text-foreground border border-foreground px-12 py-5 hover:bg-foreground hover:text-background transition-all">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
