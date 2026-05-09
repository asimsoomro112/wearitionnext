"use client";
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  productTitle?: string;
}

export function WhatsAppButton({ 
  phoneNumber = '923000000000',
  message,
  productTitle
}: WhatsAppButtonProps) {
  const defaultMessage = productTitle 
    ? `Hi! I'm interested in "${productTitle}" from WEARITION. Can you help me with details?`
    : "Hi! I'm browsing WEARITION and would like to know more about your collection.";

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message || defaultMessage)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => triggerHaptic('light')}
      className="fixed bottom-24 left-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border border-[#25D366]/40 text-white"
      style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title="Chat on WhatsApp"
      data-cursor="CHAT"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#25D366] rounded-full animate-pulse border-2 border-background" />
    </motion.a>
  );
}
