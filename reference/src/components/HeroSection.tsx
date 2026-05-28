import { TextScramble } from './TextScramble';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 md:px-24 overflow-hidden border-b border-divider">
      <div className="noise-overlay" />
      
      <div className="relative z-10 max-w-4xl text-center flex flex-col gap-8">
         <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-semibold leading-[0.9] sm:leading-[0.85] tracking-tight">
          <span className="block">
            <TextScramble text="Payments" delay={100} duration={600} />
          </span>
          <span className="block">
            <TextScramble text="Without" delay={300} duration={600} />
          </span>
          <span className="block text-accent">
            <TextScramble text="Internet." delay={500} duration={600} />
          </span>
        </h1>
        
        <p className="font-mono text-text-secondary max-w-2xl mx-auto text-sm md:text-base lg:text-lg">
          AirPay enables UPI payments even when you have no internet connection. 
          Simple, secure, and works anywhere with mobile network coverage.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <a 
            href="https://forms.gle/ZKgYvDEbLDuiM6nv9" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-8 py-4 bg-accent text-white font-mono text-sm hover:bg-accent/90 transition-colors active:scale-95 touch-manipulation min-h-[48px] inline-flex items-center justify-center"
          >
            DOWNLOAD FOR ANDROID
          </a>
          
          <a 
            href="#how-to-use"
            className="px-8 py-4 border border-divider text-text-primary font-mono text-sm hover:bg-surface transition-colors active:scale-95 touch-manipulation min-h-[48px] inline-flex items-center justify-center"
          >
            HOW TO USE
          </a>
        </div>
      </div>

      {/* Animated background element - OPTIMAL */}
      <div className="absolute right-[-20vw] md:right-[-10vw] top-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] opacity-10 md:opacity-20 pointer-events-none">
        <div className="w-full h-full border-[1px] border-divider relative flex items-center justify-center animate-spin-optimal">
          {/* Inner rings */}
          <div className="w-[80%] h-[80%] border-[1px] border-divider absolute animate-spin-optimal-reverse" />
          <div className="w-[60%] h-[60%] border-[1px] border-divider absolute animate-spin-optimal" />
          
          {/* Signal strength indicator */}
          <div className="absolute flex flex-col items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i}
                className="w-2 bg-success"
                style={{ 
                  height: `${i * 8}px`, 
                  opacity: i <= 3 ? 1 : 0.3,
                  animation: `pulse-optimal ${i * 0.25}s infinite alternate`
                }}
              />
            ))}
          </div>
          
          {/* Center dot */}
          <div className="w-4 h-4 bg-accent absolute animate-pulse-optimal" />
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-30">
        <div className="flex items-center gap-2 font-mono text-xs text-text-secondary">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse-optimal"></div>
          <span>READY FOR OFFLINE PAYMENTS</span>
        </div>
      </div>
    </section>
  );
}