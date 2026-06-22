"use client";

import { useState, useEffect } from "react";

export default function WhatsappButton() {
  const phone = "919980952438"; // country code + number, no spaces/symbols
  const message = encodeURIComponent(
    "Hi! I'm interested in Myequipo's construction machinery services."
  );
  const href = `https://wa.me/${phone}?text=${message}`;

  const [showPulse, setShowPulse] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95 sm:bottom-6 sm:right-6"
    >
      {showPulse && (
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping" />
      )}
      <svg
        className="relative h-7 w-7 text-white"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.21 0 4.29.86 5.85 2.42a8.23 8.23 0 0 1 2.43 5.83c0 4.55-3.71 8.25-8.27 8.25a8.27 8.27 0 0 1-4.21-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.27-4.4c0-4.55 3.71-8.24 8.26-8.24Zm-4.57 4.7c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.13.17 1.74 2.78 4.32 3.83 2.14.87 2.57.7 3.04.65.46-.04 1.49-.6 1.7-1.19.21-.58.21-1.08.15-1.19-.06-.1-.23-.17-.48-.29-.25-.13-1.49-.74-1.72-.82-.23-.08-.4-.13-.57.13-.17.25-.65.82-.8 1-.15.17-.3.19-.55.06-.25-.13-1.06-.39-2.02-1.25-.75-.66-1.25-1.49-1.4-1.74-.15-.25-.02-.39.11-.51.11-.11.25-.3.38-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.57-1.39-.79-1.9-.2-.49-.41-.43-.57-.44-.15-.01-.32-.01-.49-.01Z" />
      </svg>
    </a>
  );
}