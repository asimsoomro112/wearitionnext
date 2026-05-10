"use client";
import { SEO } from '../components/layout/SEO';
import { TextReveal } from '../components/layout/TextReveal';
import { Briefcase, Users, Zap, Globe } from 'lucide-react';
import Link from 'next/link';

export function Careers() {
  return (
    <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-background min-h-screen">
      <SEO title="Careers" description="Join the Wearition team and shape the future of luxury fashion." />
      <div className="max-w-[1000px] mx-auto">
        <header className="mb-20">
          <span className="text-accent text-[10px] uppercase tracking-[0.4em] mb-4 block font-bold">Join The House</span>
          <TextReveal as="h1" className="font-serif text-4xl sm:text-5xl md:text-7xl text-foreground mb-8">Careers</TextReveal>
          <div className="h-px w-full bg-border-color/30"></div>
        </header>

        <div className="mb-24">
          <h2 className="font-serif text-3xl mb-8">Shape the Future of Luxury</h2>
          <p className="text-sm text-foreground/60 leading-loose max-w-2xl mb-12">
            At Wearition, we are a collective of visionaries, artisans, and innovators. We believe in pushing the boundaries of what's possible in fashion and technology. If you are passionate about excellence and innovation, we want to hear from you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: Users, title: "Our Culture", desc: "A collaborative environment where every voice matters and creativity is celebrated." },
              { icon: Zap, title: "Innovation", desc: "We embrace new technologies to redefine the luxury shopping experience." },
              { icon: Globe, title: "Global Vision", desc: "Bringing Pakistan's finest craftsmanship to the world stage." },
              { icon: Briefcase, title: "Growth", desc: "Unprecedented opportunities to grow and lead within the fashion industry." }
            ].map((item, i) => (
              <div key={i} className="p-8 border border-white/5 bg-background-secondary/10">
                <item.icon className="w-6 h-6 text-accent mb-6" />
                <h3 className="uppercase text-[11px] tracking-widest font-bold mb-4">{item.title}</h3>
                <p className="text-xs text-foreground/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-accent/5 p-12 text-center border border-accent/10">
          <h2 className="font-serif text-2xl mb-6">Current Opportunities</h2>
          <p className="text-sm text-foreground/60 mb-8">We are currently building our core team. Send your portfolio and CV to</p>
          <a href="mailto:careers@wearition.store" className="text-accent font-bold hover:underline">careers@wearition.store</a>
          <p className="mt-8 text-[10px] uppercase tracking-widest text-foreground/30 font-bold">Open Roles: Design, Marketing, Logistics, Tech</p>
        </div>
      </div>
    </div>
  );
}
