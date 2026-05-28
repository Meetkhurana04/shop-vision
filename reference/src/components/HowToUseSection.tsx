import { QrCode, Smartphone, Lock, CheckCircle, ChevronRight } from 'lucide-react';
import { TextScramble } from './TextScramble';

export function HowToUseSection() {
  const steps = [
    {
      number: '01',
      icon: QrCode,
      title: 'Scan or Enter',
      description: 'Scan a UPI QR code or manually enter payment details.',
    },
    {
      number: '02',
      icon: Smartphone,
      title: 'Confirm Details',
      description: 'Review recipient, amount, and payment note.',
    },
    {
      number: '03',
      icon: Smartphone,
      title: 'GSM  Process',
      description: 'App automatically accesses banking GSM  menu (GSM ).',
    },
    {
      number: '04',
      icon: Lock,
      title: 'Enter PIN',
      description: 'Manually enter your UPI PIN when prompted (most secure step).',
    },
    {
      number: '05',
      icon: CheckCircle,
      title: 'Complete',
      description: 'Transaction completes through GSM . You receive confirmation.',
    },
  ];

  return (
    <section id="how-to-use" className="py-16 sm:py-24 md:py-32 px-4 sm:px-8 md:px-24 border-b border-divider bg-surface">
      <div className="max-w-6xl mx-auto">
         <div className="text-center mb-12 md:mb-20">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight mb-4">
            <TextScramble text="How It Works" delay={200} duration={500} />
          </h2>
          <p className="font-mono text-text-secondary max-w-2xl mx-auto text-sm md:text-base">
            <TextScramble text="Simple steps to make offline UPI payments." delay={400} duration={600} />
          </p>
        </div>
        
        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-divider -translate-x-1/2"></div>
          
          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div 
                  key={index}
                  className={`relative flex flex-col md:flex-row items-center ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                   {/* Step content */}
                  <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-12' : 'md:pl-12'} mb-8 md:mb-0`}>
                    <div className="p-6 md:p-8 border border-divider bg-background hover:bg-primary/5 transition-colors group animate-fade-in-up-optimal"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors animate-pulse-optimal">
                          <span className="font-mono font-bold text-accent">{step.number}</span>
                        </div>
                        <Icon className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
                        <ChevronRight className="w-5 h-5 text-text-hint ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      <h3 className="text-xl font-bold uppercase tracking-wider mb-4">
                        <TextScramble text={step.title} delay={index * 100 + 200} duration={300} />
                      </h3>
                      
                      <p className="font-mono text-sm text-text-secondary leading-relaxed group-hover:text-text-primary/80 transition-colors">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                   {/* Center dot for desktop */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-background border-4 border-accent z-10 items-center justify-center animate-pulse-optimal">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                  </div>
                  
                  {/* Empty spacer for alignment */}
                  <div className="w-full md:w-1/2"></div>
                </div>
              );
            })}
          </div>
        </div>
        
         <div className="mt-16 p-8 border border-divider bg-background animate-fade-in-up-optimal"
          style={{ animationDelay: '500ms' }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold uppercase tracking-wider mb-3">
                <TextScramble text="Security First" delay={100} duration={400} />
              </h3>
              <p className="font-mono text-sm text-text-secondary">
                AirPay never automatically enters your UPI PIN. You must manually enter it 
                when prompted during the GSM  process. This ensures maximum security and 
                follows banking regulations.
              </p>
            </div>
            
            <div className="px-6 py-3 border border-success/30 bg-success/10 animate-pulse-optimal">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-success" />
                <span className="font-mono text-sm text-success">PIN PROTECTED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}