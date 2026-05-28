import { Mail, Github, MessageSquare } from 'lucide-react';
import { TextScramble } from './TextScramble';

export function ContactSection() {
  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-8 md:px-24 border-b border-divider bg-background">
      <div className="max-w-4xl mx-auto">
         <div className="text-center mb-12 md:mb-20">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight mb-4">
            <TextScramble text="Support & Contact" delay={100} duration={500} />
          </h2>
          <p className="font-mono text-text-secondary max-w-2xl mx-auto text-sm md:text-base">
            <TextScramble text="Need help or have questions? Get in touch with us." delay={300} duration={600} />
          </p>
        </div>
        
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <a 
            href="mailto:airpay.perry@gmail.com"
            className="p-8 border border-divider bg-surface hover:bg-primary/10 transition-colors group text-center animate-fade-in-up-optimal"
            style={{ animationDelay: '100ms' }}
          >
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/30 transition-colors">
              <Mail className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-wider mb-3">Email Support</h3>
            <p className="font-mono text-sm text-text-secondary mb-4">
              Send us an email for support or inquiries
            </p>
            <div className="font-mono text-accent text-sm">
              airpay.perry@gmail.com
            </div>
          </a>
          
          <a 
            href="https://forms.gle/ZKgYvDEbLDuiM6nv9"
            target="_blank"
            rel="noopener noreferrer"
            className="p-8 border border-divider bg-surface hover:bg-primary/10 transition-colors group text-center animate-fade-in-up-optimal"
            style={{ animationDelay: '200ms' }}
          >
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/30 transition-colors">
              <Github className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-wider mb-3">GitHub</h3>
            <p className="font-mono text-sm text-text-secondary mb-4">
              Download APK and view documentation
            </p>
            <div className="font-mono text-accent text-sm">
              github.com/cgchiraggupta
            </div>
          </a>
          
          <a 
            href="https://airpaywebsite.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-8 border border-divider bg-surface hover:bg-primary/10 transition-colors group text-center animate-fade-in-up-optimal"
            style={{ animationDelay: '300ms' }}
          >
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/30 transition-colors">
              <MessageSquare className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-wider mb-3">Website</h3>
            <p className="font-mono text-sm text-text-secondary mb-4">
              Visit our official website for updates
            </p>
            <div className="font-mono text-accent text-sm">
              airpaywebsite.vercel.app
            </div>
          </a>
        </div>
        
         <div className="p-8 border border-divider bg-surface animate-fade-in-up-optimal"
          style={{ animationDelay: '400ms' }}
        >
          <h3 className="text-xl font-bold uppercase tracking-wider mb-6">
            <TextScramble text="Frequently Asked Questions" delay={100} duration={500} />
          </h3>
          
          <div className="space-y-6">
            <div className="border-b border-divider pb-6">
              <h4 className="font-bold text-lg mb-2">Is AirPay safe to use?</h4>
              <p className="font-mono text-sm text-text-secondary">
                Yes. AirPay never automatically enters your UPI PIN. You must manually enter it during the GSM  process. No sensitive information is stored or transmitted automatically.
              </p>
            </div>
            
            <div className="border-b border-divider pb-6">
              <h4 className="font-bold text-lg mb-2">Which banks are supported?</h4>
              <p className="font-mono text-sm text-text-secondary">
                AirPay works with any Indian bank that supports GSM  banking (GSM  service). This includes most major banks like SBI, HDFC, ICICI, Axis, and others.
              </p>
            </div>
            
            <div className="border-b border-divider pb-6">
              <h4 className="font-bold text-lg mb-2">Do I need internet at all?</h4>
              <p className="font-mono text-sm text-text-secondary">
                No internet is required for payments. The app uses GSM  (Unstructured Supplementary Service Data) which works over the mobile cellular network.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-2">Is there any fee?</h4>
              <p className="font-mono text-sm text-text-secondary">
                AirPay is completely free to download and use. Standard GSM  charges from your mobile operator may apply (usually free or minimal cost).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}