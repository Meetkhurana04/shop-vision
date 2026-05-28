import { Download, Smartphone, Shield, ArrowDown } from 'lucide-react';
import { TextScramble } from './TextScramble';

export function DownloadSection() {
  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-8 md:px-24 border-b border-divider bg-background">
      <div className="max-w-4xl mx-auto text-center">
         <div className="inline-flex items-center gap-2 px-4 py-2 border border-divider rounded-full mb-8 animate-pulse-optimal">
          <ArrowDown className="w-4 h-4 text-accent animate-bounce-optimal" />
          <span className="font-mono text-xs uppercase tracking-widest">Download Now</span>
        </div>
        
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight mb-6">
          <TextScramble text="Get AirPay" delay={100} duration={500} />
        </h2>
        
        <p className="font-mono text-text-secondary text-sm md:text-base lg:text-lg max-w-2xl mx-auto mb-12">
          <TextScramble text="Download the APK file directly to your Android device." delay={300} duration={600} />
          <br />
          <TextScramble text="Works on Android 8.0+ with GSM  banking enabled." delay={500} duration={600} />
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
           <a 
            href="https://forms.gle/ZKgYvDEbLDuiM6nv9/raw/main/airpay-app-debug.apk"
            className="px-10 py-5 bg-accent text-white font-mono text-base hover:bg-accent/90 transition-colors active:scale-95 touch-manipulation min-h-[56px] inline-flex items-center justify-center gap-3 text-lg animate-float-optimal"
            download="airpay-app-debug.apk"
          >
            <Download className="w-6 h-6 animate-bounce-optimal" />
            DOWNLOAD APK (26 MB)
          </a>
          
          <a 
            href="https://forms.gle/ZKgYvDEbLDuiM6nv9"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 border border-divider text-text-primary font-mono text-sm hover:bg-surface transition-colors active:scale-95 touch-manipulation min-h-[48px] inline-flex items-center justify-center gap-2"
          >
            View on GitHub
          </a>
        </div>
        
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 border border-divider bg-surface hover:bg-primary/5 transition-colors group animate-fade-in-up-optimal"
            style={{ animationDelay: '100ms' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
              <h3 className="font-bold uppercase tracking-wider">Requirements</h3>
            </div>
            <ul className="font-mono text-sm text-text-secondary space-y-2">
              <li>• Android 8.0+ (Oreo)</li>
              <li>• SIM with GSM  banking</li>
              <li>• Mobile network signal</li>
              <li>• 50MB free storage</li>
            </ul>
          </div>
          
          <div className="p-6 border border-divider bg-surface hover:bg-primary/5 transition-colors group animate-fade-in-up-optimal"
            style={{ animationDelay: '200ms' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
              <h3 className="font-bold uppercase tracking-wider">Installation</h3>
            </div>
            <ul className="font-mono text-sm text-text-secondary space-y-2">
              <li>1. Enable "Unknown Sources"</li>
              <li>2. Download APK file</li>
              <li>3. Open and install</li>
              <li>4. Grant permissions</li>
            </ul>
          </div>
          
          <div className="p-6 border border-divider bg-surface hover:bg-primary/5 transition-colors group animate-fade-in-up-optimal"
            style={{ animationDelay: '300ms' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center group-hover:bg-success/30 transition-colors">
                <div className="w-3 h-3 rounded-full bg-success animate-pulse-optimal"></div>
              </div>
              <h3 className="font-bold uppercase tracking-wider">Safety</h3>
            </div>
            <ul className="font-mono text-sm text-text-secondary space-y-2">
              <li>• No automatic PIN entry</li>
              <li>• Manual PIN verification</li>
              <li>• No internet required</li>
              <li>• Open source code</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}