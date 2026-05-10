"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SEO } from '../components/layout/SEO';
import { TextReveal } from '../components/layout/TextReveal';
import { MagneticButton } from '../components/layout/MagneticButton';
import { Mail, MapPin, Globe } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function Contact() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    try {
      // Save to Firestore for admin to see
      await addDoc(collection(db, 'messages'), {
        firstName,
        lastName,
        email,
        message,
        createdAt: serverTimestamp(),
        read: false,
      });

      // Also try sending email notification to store owner
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'wearition.80@gmail.com',
            subject: `New Contact Message from ${firstName} ${lastName}`,
            html: `<h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Message:</strong></p>
              <p>${message}</p>`,
          }),
        });
      } catch {
        // Email send failure is non-critical
      }

      toast.success('Your message has been sent. We will get back to you shortly.');
      form.reset();
    } catch (err) {
      console.error('Contact form error:', err);
      toast.error('Failed to send message. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
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
            Have a question about an order, our products, or just want to say hello? Our team is available 24/7 online.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="flex flex-col items-center text-center p-8 bg-background-secondary/5 border border-white/5 rounded-sm">
            <Mail className="w-6 h-6 mb-4 text-accent" />
            <h3 className="uppercase text-[10px] tracking-widest mb-2 font-bold">Email Us</h3>
            <p className="text-sm text-foreground/60">wearition.80@gmail.com</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 bg-background-secondary/5 border border-white/5 rounded-sm">
            <Globe className="w-6 h-6 mb-4 text-accent" />
            <h3 className="uppercase text-[10px] tracking-widest mb-2 font-bold">Online Store</h3>
            <p className="text-sm text-foreground/60">Always Open</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 bg-background-secondary/5 border border-white/5 rounded-sm">
            <MapPin className="w-6 h-6 mb-4 text-accent" />
            <h3 className="uppercase text-[10px] tracking-widest mb-2 font-bold">Origin</h3>
            <p className="text-sm text-foreground/60">Karachi, Pakistan</p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-background-secondary/20 p-8 md:p-12 border border-white/5"
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl mb-8 text-center">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-2 font-bold">First Name</label>
                  <input required type="text" name="firstName" className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-accent/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-2 font-bold">Last Name</label>
                  <input required type="text" name="lastName" className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-accent/50 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-2 font-bold">Email Address</label>
                <input required type="email" name="email" className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-accent/50 transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-2 font-bold">Message</label>
                <textarea required rows={5} name="message" className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-accent/50 resize-none transition-colors"></textarea>
              </div>
              <MagneticButton 
                strength={0.2}
                className="mt-6 bg-foreground text-background py-4 uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-accent transition-colors self-center px-16"
              >
                Send Message
              </MagneticButton>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
