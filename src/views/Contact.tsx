import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SEO } from '../components/layout/SEO';
import { TextReveal } from '../components/layout/TextReveal';
import { MagneticButton } from '../components/layout/MagneticButton';
import { MessageSquare, Mail, MapPin } from 'lucide-react';

export function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Your message has been sent. We will get back to you shortly.');
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-background min-h-[80vh]">
      <SEO 
        title="Contact Us" 
        description="Get in touch with Wearition. We're here to help with your orders, products, and more."
      />
      <div className="max-w-[1000px] mx-auto">
        <header className="mb-20 text-center">
          <TextReveal as="h1" className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground mb-6 text-center">
            Get in Touch
          </TextReveal>
          <p className="text-foreground/60 text-sm font-sans max-w-lg mx-auto">
            Have a question about an order, our products, or just want to say hello? Our team is here to help.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          <div className="flex flex-col items-center text-center p-8 bg-background-secondary/10 border border-white/5 rounded-sm">
            <Mail className="w-6 h-6 mb-4 text-accent" />
            <h3 className="uppercase text-[10px] tracking-widest mb-2 font-bold">Email Us</h3>
            <p className="text-sm text-foreground/60">support@wearition.com</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 bg-background-secondary/10 border border-white/5 rounded-sm">
            <MessageSquare className="w-6 h-6 mb-4 text-[#25D366]" />
            <h3 className="uppercase text-[10px] tracking-widest mb-2 font-bold">WhatsApp</h3>
            <p className="text-sm text-foreground/60">+92 300 0000000</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 bg-background-secondary/10 border border-white/5 rounded-sm">
            <MapPin className="w-6 h-6 mb-4 text-accent" />
            <h3 className="uppercase text-[10px] tracking-widest mb-2 font-bold">Visit Us</h3>
            <p className="text-sm text-foreground/60">Karachi, Pakistan</p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-background-secondary/20 p-8 md:p-12 border border-white/5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-serif text-3xl mb-8">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-2 font-bold">First Name</label>
                    <input required type="text" className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-accent/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-2 font-bold">Last Name</label>
                    <input required type="text" className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-accent/50 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-2 font-bold">Email Address</label>
                  <input required type="email" className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-accent/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-2 font-bold">Message</label>
                  <textarea required rows={5} className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-accent/50 resize-none transition-colors"></textarea>
                </div>
                <MagneticButton 
                  strength={0.2}
                  className="mt-6 bg-foreground text-background py-4 uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-accent transition-colors self-start px-12"
                >
                  Send Message
                </MagneticButton>
              </form>
            </div>

            <div className="flex flex-col justify-center bg-accent/5 p-8 border border-accent/10 rounded-sm">
              <h3 className="font-serif text-2xl mb-6">Concierge Hours</h3>
              <div className="space-y-4 text-sm text-foreground/70">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Monday — Friday</span>
                  <span>9:00 — 18:00</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Saturday</span>
                  <span>10:00 — 16:00</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
              <p className="mt-8 text-xs text-foreground/40 leading-relaxed italic">
                *All times are in PKT. Our average response time is less than 2 hours during business hours.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
