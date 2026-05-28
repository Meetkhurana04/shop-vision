import { useEffect, useState } from 'react';

export function Footer() {
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
     <footer className="bg-background py-8 sm:py-12 px-4 sm:px-8 md:px-24 border-t border-divider flex flex-col md:flex-row justify-between items-start md:items-end min-h-[20vh] sm:min-h-[30vh]">
       <div className="font-mono text-text-hint text-xs sm:text-sm md:text-base mb-6 md:mb-0">
        <span className="text-text-primary">&gt;</span> AirPay_UPI.terminate()
        <span className={`inline-block w-2 h-4 bg-text-primary ml-1 align-middle ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
      </div>

       <div className="flex flex-col items-start sm:items-end gap-1 sm:gap-2 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-text-hint mt-4 sm:mt-0">
        <a href="https://forms.gle/ZKgYvDEbLDuiM6nv9" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors duration-0">Documentation</a>
        <a href="https://forms.gle/ZKgYvDEbLDuiM6nv9" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors duration-0">GitHub</a>
        <a href="https://forms.gle/ZKgYvDEbLDuiM6nv9" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors duration-0">Security</a>
        <a href="https://forms.gle/ZKgYvDEbLDuiM6nv9" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors duration-0">Compliance</a>
        <div className="mt-4 text-text-secondary">Â© 2026 AIRPAY PROTOCOL</div>
      </div>
    </footer>
  );
}
