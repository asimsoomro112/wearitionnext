"use client";
import { SEO } from '../components/layout/SEO';
import { TextReveal } from '../components/layout/TextReveal';

export function Privacy() {
  return (
    <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-background min-h-screen">
      <SEO title="Privacy Policy" description="Wearition's commitment to protecting your personal data." />
      <div className="max-w-[1000px] mx-auto">
        <header className="mb-20">
          <span className="text-accent text-[10px] uppercase tracking-[0.4em] mb-4 block font-bold">Legal</span>
          <TextReveal as="h1" className="font-serif text-4xl sm:text-5xl md:text-7xl text-foreground mb-8">Privacy Policy</TextReveal>
          <div className="h-px w-full bg-border-color/30"></div>
        </header>

        <div className="space-y-12 font-sans text-foreground/70 leading-loose">
          <section>
            <h2 className="uppercase text-[11px] tracking-[0.2em] font-bold text-foreground mb-6">Introduction</h2>
            <p className="text-sm">
              Wearition respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className="uppercase text-[11px] tracking-[0.2em] font-bold text-foreground mb-6">Data We Collect</h2>
            <p className="text-sm">
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-5 mt-4 text-sm space-y-2">
              <li>Identity Data: Name, username or similar identifier.</li>
              <li>Contact Data: Billing address, delivery address, email address and telephone numbers.</li>
              <li>Financial Data: Payment card details (processed securely via our partners).</li>
              <li>Transaction Data: Details about payments to and from you and other details of products you have purchased from us.</li>
            </ul>
          </section>

          <section>
            <h2 className="uppercase text-[11px] tracking-[0.2em] font-bold text-foreground mb-6">How We Use Your Data</h2>
            <p className="text-sm">
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-5 mt-4 text-sm space-y-2">
              <li>To register you as a new customer.</li>
              <li>To process and deliver your order.</li>
              <li>To manage our relationship with you.</li>
              <li>To enable you to partake in a prize draw, competition or complete a survey.</li>
            </ul>
          </section>

          <section className="bg-background-secondary/10 p-8 border border-white/5">
             <p className="text-xs italic">For any questions regarding your data, please contact us at <span className="text-accent font-bold">wearition.80@gmail.com</span>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
