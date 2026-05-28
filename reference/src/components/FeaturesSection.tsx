import { useState } from 'react';
import { WifiOff, Shield, Smartphone, Zap } from 'lucide-react';
import { TextScramble } from './TextScramble';

export function FeaturesSection() {
  const [hovered, setHovered] = useState<number | null>(null);
  
  const features = [
    {
      icon: WifiOff,
      title: 'Works Offline',
      description: 'Make UPI payments even without internet connection using mobile network.',
      metric: '0 INTERNET REQ',
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'Your UPI PIN is always entered manually. No automatic PIN entry.',
      metric: 'PIN PROTECTED',
    },
    {
      icon: Smartphone,
      title: 'Easy to Use',
      description: 'Simple interface. Scan QR code or enter details manually.',
      metric: 'USER FRIENDLY',
    },
    {
      icon: Zap,
      title: 'Fast',
      description: 'Complete payments in seconds through GSM  banking.',
      metric: 'SECONDS ONLY',
    },
  ];

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-8 md:px-24 border-b border-divider bg-surface">
      <div className="max-w-7xl mx-auto">
         <div className="flex justify-between items-end mb-8 sm:mb-16 border-b border-divider pb-4">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase tracking-tight">
            <TextScramble text="Key Features" delay={200} duration={500} />
          </h2>
          <span className="font-mono text-xs sm:text-sm text-text-hint hidden sm:block">STATUS: <span className="text-success">ACTIVE</span></span>
        </div>
        
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-divider">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onTouchStart={() => setHovered(i)}
                onTouchEnd={() => setHovered(null)}
                className="p-6 sm:p-8 border-b md:border-b-0 md:border-r last:border-b-0 lg:last:border-r-0 border-divider bg-surface hover:bg-primary hover:text-text-primary active:bg-primary transition-colors duration-200 flex flex-col group touch-manipulation"
              >
                <div className="flex justify-between items-center mb-8 font-mono text-xs">
                  <span className="text-text-hint group-hover:text-text-primary/50 transition-colors">FEAT.{i + 1}</span>
                  <Icon className="w-5 h-5 text-accent group-hover:text-accent transition-colors" strokeWidth={1.5} />
                </div>
                
                <div className="flex-1">
                   <h3 className="text-lg sm:text-xl uppercase tracking-wider mb-4 font-bold min-h-[56px] sm:h-14">
                    {hovered === i ? <TextScramble text={feature.title} duration={250} /> : feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary group-hover:text-text-primary/70 transition-colors mb-6">
                    {feature.description}
                  </p>
                </div>
                
                <div className="font-mono text-xs tracking-widest text-success group-hover:text-success pt-4 border-t border-divider group-hover:border-text-primary/20 transition-colors">
                  [{feature.metric}]
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}