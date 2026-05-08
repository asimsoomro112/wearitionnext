import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Your message has been sent. We will get back to you shortly.');
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-background min-h-[80vh]">
      <div className="max-w-[800px] mx-auto">
        <header className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground mb-6"
          >
            Contact Us
          </motion.h1>
          <p className="text-foreground/60 text-sm font-sans max-w-lg mx-auto">
            Have a question about an order, our products, or just want to say hello? Our team is here to help.
          </p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-background-secondary/20 p-8 rounded-xl border border-white/5"
        >
          <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-foreground/60 mb-2">First Name</label>
                <input required type="text" className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/30" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-foreground/60 mb-2">Last Name</label>
                <input required type="text" className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/30" />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-foreground/60 mb-2">Email Address</label>
              <input required type="email" className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-foreground/60 mb-2">Message</label>
              <textarea required rows={5} className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/30 resize-none"></textarea>
            </div>
            <button 
              type="submit" 
              className="mt-6 bg-foreground text-background py-4 uppercase text-xs tracking-[0.2em] font-medium hover:bg-accent transition-colors self-start px-12"
            >
              Send Message
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
