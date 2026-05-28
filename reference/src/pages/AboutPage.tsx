// src/pages/AboutPage.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';
import { ArrowLeft, Github, Linkedin, Twitter, ExternalLink, Mail, MapPin, Calendar, Zap, Code2, Wifi, WifiOff, Signal, Shield, Smartphone, Radio, Users, Globe, ChevronRight } from 'lucide-react';
import { Footer } from '../components/Footer';

// ─── 3D Floating Grid Background ─────────────────────────────────────────────
function FloatingGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gridSize = 40;
      const perspective = 800;
      const rotationX = Math.sin(time * 0.0003) * 0.3;
      const rotationY = Math.cos(time * 0.0002) * 0.2;

      for (let x = -20; x <= 20; x++) {
        for (let z = -20; z <= 20; z++) {
          const worldX = x * gridSize;
          const worldZ = z * gridSize - time * 0.02;
          const adjustedZ = ((worldZ % (gridSize * 40)) + gridSize * 40) % (gridSize * 40) - gridSize * 20;

          const rotatedX = worldX * Math.cos(rotationY) - adjustedZ * Math.sin(rotationY);
          const rotatedZ = worldX * Math.sin(rotationY) + adjustedZ * Math.cos(rotationY);
          const rotatedY = rotatedZ * Math.sin(rotationX) + 200;
          const finalZ = rotatedZ * Math.cos(rotationX) + perspective;

          if (finalZ <= 0) continue;

          const screenX = (rotatedX * perspective) / finalZ + canvas.width / 2;
          const screenY = (rotatedY * perspective) / finalZ + canvas.height / 2;
          const size = Math.max(1, (perspective / finalZ) * 1.5);

          const alpha = Math.max(0, Math.min(0.15, 1 - finalZ / 2000));
          ctx.fillStyle = `rgba(90, 69, 246, ${alpha})`;
          ctx.beginPath();
          ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      time += 16;
      animationId = requestAnimationFrame(drawGrid);
    };

    drawGrid();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
}

// ─── Magnetic Element ─────────────────────────────────────────────────────────
function MagneticWrap({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Glitch Text ──────────────────────────────────────────────────────────────
function GlitchText({ text, className = '' }: { text: string; className?: string }) {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';

  const triggerGlitch = () => {
    if (isGlitching) return;
    setIsGlitching(true);
    let iterations = 0;
    const maxIterations = text.length;

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, i) => {
            if (i < iterations) return text[i];
            if (char === ' ') return ' ';
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      iterations += 1 / 2;

      if (iterations >= maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
        setIsGlitching(false);
      }
    }, 30);
  };

  return (
    <span
      className={`cursor-default ${className}`}
      onMouseEnter={triggerGlitch}
    >
      {displayText}
    </span>
  );
}

// ─── Signal Line Animation ────────────────────────────────────────────────────
function SignalLine() {
  return (
    <div className="relative w-full h-px my-8 md:my-12 overflow-hidden">
      <div className="absolute inset-0 bg-divider" />
      <motion.div
        className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-transparent via-flow-shell-start to-transparent"
        animate={{ x: ['-128px', 'calc(100vw + 128px)'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
      />
    </div>
  );
}

// ─── Terminal Block ───────────────────────────────────────────────────────────
function TerminalBlock({ children, title = 'terminal' }: { children: React.ReactNode; title?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative border border-divider rounded-lg overflow-hidden bg-surface/50 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-divider bg-surface-elevated/50">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-error/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-warning/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-success/70" />
        </div>
        <span className="text-text-hint text-xs font-mono ml-2">{title}</span>
      </div>
      <div className="p-6 md:p-8">
        {children}
      </div>
    </motion.div>
  );
}

// ─── Orbit Ring ───────────────────────────────────────────────────────────────
function OrbitRing({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="absolute inset-[-20px] rounded-full border border-flow-shell-start/20"
      animate={{ rotateZ: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear', delay }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-flow-shell-start/60" />
    </motion.div>
  );
}

// ─── Stat Counter ─────────────────────────────────────────────────────────────
function AnimatedStat({ value, label, suffix = '' }: { value: string; label: string; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="text-center"
    >
      <div className="text-3xl md:text-5xl font-heading font-bold text-text-primary">
        {value}{suffix}
      </div>
      <div className="text-text-hint text-xs md:text-sm mt-2 uppercase tracking-widest">
        {label}
      </div>
    </motion.div>
  );
}

// ─── GSM  Flow Visualization ──────────────────────────────────────────────────
function GSMFlowVisualization() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const steps = [
    { icon: Smartphone, label: 'Scan QR / Enter UPI ID', color: 'text-flow-shell-start' },
    { icon: Radio, label: 'Dial GSM Code', color: 'text-warning' },
    { icon: Signal, label: 'Navigate GSM  Menu', color: 'text-flow-lime' },
    { icon: Shield, label: 'User Enters MPIN', color: 'text-accent' },
    { icon: Zap, label: 'Transaction Complete', color: 'text-success' },
  ];

  return (
    <div ref={ref} className="relative">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.15, duration: 0.6 }}
            className="flex flex-col items-center text-center relative flex-1"
          >
            {/* Connector line */}
            {i < steps.length - 1 && (
              <motion.div
                className="hidden md:block absolute top-6 left-[60%] w-[80%] h-px"
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ delay: i * 0.15 + 0.3, duration: 0.5 }}
                style={{ originX: 0 }}
              >
                <div className="w-full h-px bg-gradient-to-r from-divider to-divider relative">
                  <motion.div
                    className="absolute top-0 left-0 h-full w-4 bg-gradient-to-r from-flow-shell-start/50 to-transparent"
                    animate={{ x: ['0%', '2000%'] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                </div>
                <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-text-hint" />
              </motion.div>
            )}

            <div className={`w-12 h-12 rounded-xl border border-divider bg-surface-elevated/50 flex items-center justify-center mb-3 ${step.color}`}>
              <step.icon className="w-5 h-5" />
            </div>
            <span className="text-text-secondary text-[11px] font-mono leading-tight max-w-[120px]">
              {step.label}
            </span>
            <span className="text-text-hint text-[10px] font-mono mt-1">0{i + 1}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Founder Card ─────────────────────────────────────────────────────────────
// ─── Founder Card (with image support) ─────────────────────────────────────────────
function FounderCard({
  name,
  role,
  bio,
  funFact,
  links,
  index,
  skills,
  location,
  tagline,
  imageUrl,            // <-- new prop
}: {
  name: string;
  role: string;
  bio: string;
  funFact: string;
  links: { github?: string; linkedin?: string; twitter?: string; email?: string };
  index: number;
  skills: string[];
  location: string;
  tagline: string;
  imageUrl: string;    // path to image, e.g. "/images/chirag.jpg"
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative border border-divider rounded-2xl overflow-hidden bg-surface/30 backdrop-blur-md transition-all duration-500 hover:border-flow-shell-start/30">
        <motion.div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(90, 69, 246, 0.5), transparent)',
          }}
          animate={{ opacity: isHovered ? 1 : 0.3 }}
        />

        <div className="p-8 md:p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <MagneticWrap className="mb-6">
              <div className="relative w-32 h-32 md:w-40 md:h-40">
                {/* Orbit rings */}
                <OrbitRing delay={0} />
                <OrbitRing delay={5} />

                {/* Avatar container with image */}
                <motion.div
                  className="w-full h-full rounded-full overflow-hidden border border-flow-shell-start/30"
                  animate={{ rotateY: isHovered ? 10 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Scanning line overlay */}
                <motion.div
                  className="absolute left-0 right-0 h-px bg-flow-shell-start/40 pointer-events-none"
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />

                {/* Status badge */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-background/90 border border-divider rounded-full px-2 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-optimal" />
                  <span className="text-[10px] text-success font-mono">BUILDING</span>
                </div>
              </div>
            </MagneticWrap>

            <h3 className="text-2xl md:text-3xl font-heading font-bold mb-1">
              <GlitchText text={name} />
            </h3>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-flow-shell-start/20 bg-flow-shell-start/5 mb-2">
              <Zap className="w-3 h-3 text-flow-shell-start" />
              <span className="text-xs text-flow-shell-start font-mono">{role}</span>
            </div>

            <p className="text-text-hint text-xs font-mono mb-4 italic">"{tagline}"</p>

            <p className="text-text-secondary text-sm leading-relaxed max-w-md">
              {bio}
            </p>
          </div>

          <div className="mb-6">
            <div className="text-text-hint text-[10px] uppercase tracking-widest mb-3">Tech Stack</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {skills.map((skill, i) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: index * 0.2 + i * 0.05 + 0.3 }}
                  className="px-2.5 py-1 text-[11px] font-mono rounded-md border border-divider bg-surface-elevated/50 text-text-secondary hover:border-flow-shell-start/30 hover:text-flow-shell-start transition-colors cursor-default"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="bg-background/50 rounded-lg p-4 border border-divider/50 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="w-3 h-3 text-text-hint" />
              <span className="text-[10px] text-text-hint uppercase tracking-widest">What Drives Them</span>
            </div>
            <p className="text-text-secondary text-xs font-mono leading-relaxed">
              <span className="text-flow-shell-start">{'> '}</span>
              {funFact}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            {links.github && (
              <MagneticWrap>
                <a
                  href={links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-divider bg-surface-elevated/50 flex items-center justify-center text-text-hint hover:text-text-primary hover:border-flow-shell-start/30 transition-all"
                >
                  <Github className="w-4 h-4" />
                </a>
              </MagneticWrap>
            )}
            {links.linkedin && (
              <MagneticWrap>
                <a
                  href={links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-divider bg-surface-elevated/50 flex items-center justify-center text-text-hint hover:text-text-primary hover:border-flow-shell-start/30 transition-all"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </MagneticWrap>
            )}
            {links.twitter && (
              <MagneticWrap>
                <a
                  href={links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-divider bg-surface-elevated/50 flex items-center justify-center text-text-hint hover:text-text-primary hover:border-flow-shell-start/30 transition-all"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              </MagneticWrap>
            )}
            {links.email && (
              <MagneticWrap>
                <a
                  href={`mailto:${links.email}`}
                  className="w-10 h-10 rounded-full border border-divider bg-surface-elevated/50 flex items-center justify-center text-text-hint hover:text-text-primary hover:border-flow-shell-start/30 transition-all"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </MagneticWrap>
            )}
          </div>
        </div>

        <div className="border-t border-divider px-6 py-3 flex items-center justify-between text-[10px] text-text-hint font-mono">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            <span>3rd Year Engineering</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
// ─── Timeline Node ────────────────────────────────────────────────────────────
function TimelineNode({
  year,
  title,
  description,
  index,
}: {
  year: string;
  title: string;
  description: string;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex items-start gap-6"
    >
      <div className="relative flex-shrink-0">
        <motion.div
          className="w-4 h-4 rounded-full border-2 border-flow-shell-start bg-background"
          animate={isInView ? { scale: [0, 1.2, 1] } : {}}
          transition={{ duration: 0.5, delay: index * 0.15 + 0.2 }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-flow-shell-start/20"
          animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
        />
      </div>

      <div className="pb-12">
        <div className="text-flow-shell-start text-xs font-mono mb-1">{year}</div>
        <h4 className="text-text-primary font-heading font-semibold text-lg mb-2">{title}</h4>
        <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// ─── Architecture Card ────────────────────────────────────────────────────────
function ArchCard({ icon: Icon, title, description, index }: { icon: any; title: string; description: string; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="border border-divider rounded-xl p-6 bg-surface/30 backdrop-blur-sm hover:border-flow-shell-start/20 transition-colors group"
    >
      <div className="w-10 h-10 rounded-lg border border-divider bg-surface-elevated/50 flex items-center justify-center mb-4 text-flow-shell-start group-hover:border-flow-shell-start/30 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="text-text-primary font-heading font-semibold text-base mb-2">{title}</h4>
      <p className="text-text-secondary text-xs font-mono leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ─── Team Member Badge ────────────────────────────────────────────────────────
function TeamBadge({ name, role, index }: { name: string; role: string; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-divider bg-surface/30 backdrop-blur-sm"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-flow-shell-start/20 to-flow-shell-end/20 border border-flow-shell-start/30 flex items-center justify-center">
        <span className="text-xs font-heading font-bold text-flow-shell-start/70">
          {name.split(' ').map(n => n[0]).join('')}
        </span>
      </div>
      <div>
        <div className="text-text-primary text-sm font-heading font-medium">{name}</div>
        <div className="text-text-hint text-[10px] font-mono">{role}</div>
      </div>
    </motion.div>
  );
}

// ─── Main About Page ──────────────────────────────────────────────────────────
export function AboutPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const founders = [
    {
      name: 'Chirag Gupta',
      role: 'Co-Founder & Developer',
      tagline: '18, engineer. I like to build.',
      bio: '',
      funFact: 'Believes the best way to learn a technology is to build something real with it.',
      skills: ['React', 'TypeScript', 'Android', 'System Design', 'Node.js', 'GSM  Protocols'],
      location: 'Delhi, India',
      imageUrl: "/images/image1.jpeg",
      links: {
        github: 'https://github.com/cgchiraggupta',
        twitter: '#',
        email: 'cg077593@gmail.com',
      },
    },
    {
      name: 'Meet Khurana',
      role: 'Co-Founder & Developer',
      tagline: 'person who genuinely loves tech',
      bio: '',
      funFact: 'Favorite feedback isn`t great code, its this actually made my day easier',
      skills: ['Python', 'Java', 'React', 'Flask', 'MongoDB', 'PostgreSQL', 'C++', 'Firebase'],
      location: 'Gurgaon, India',
      imageUrl: "/images/meet2.png",
      links: {
        github: 'https://github.com/meetkhurana04',
        linkedin: '#',
        email: 'airpay.perry@gmail.com',
      },
    },
  ];

  const timeline = [
   
  ];

  return (
    <div ref={containerRef} className="relative">
      <FloatingGrid />
      <div className="noise-overlay" />

      {/* Scroll progress */}
      <motion.div
        className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-flow-shell-start to-accent z-50"
        style={{ width: progressWidth }}
      />

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-6 left-6 z-40"
      >
        <MagneticWrap>
          <a
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-divider bg-surface/80 backdrop-blur-md text-text-secondary hover:text-text-primary hover:border-flow-shell-start/30 transition-all text-sm font-mono group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back</span>
          </a>
        </MagneticWrap>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-16">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-divider bg-surface/50 backdrop-blur-sm mb-8"
          >
            <WifiOff className="w-3.5 h-3.5 text-flow-shell-start" />
            <span className="text-xs font-mono text-text-secondary">Payments that don't need WiFi</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-bold leading-[0.95] tracking-tight mb-6"
          >
            <span className="block">We Built</span>
            <span className="block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-flow-shell-start via-accent to-flow-shell-start bg-[length:200%] animate-[gradient-shift_4s_ease_infinite]">
                <GlitchText text="AirPay" />
              </span>
            </span>
            <span className="block text-text-hint text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-2">Because Signals &gt; WiFi.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-6"
          >
            Two third-year engineering students from Gurgaon who got tired of payment 
            failures in low-signal zones. So we bridged UPI with legacy GSM signaling 
            and made digital payments work with just one bar of signal.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-text-hint text-sm font-mono mb-8"
          >
            No internet required. Just cellular network. That's it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-text-hint text-xs font-mono">Scroll to explore our story</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-5 h-8 rounded-full border border-text-hint/30 flex items-start justify-center p-1.5"
            >
              <div className="w-1 h-1.5 rounded-full bg-text-hint" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <SignalLine />

      {/* ═══════════════════════════════════════════════════════════════════
          THE PROBLEM WE SAW
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="h-px flex-1 bg-divider" />
            <span className="text-text-hint text-xs font-mono uppercase tracking-[0.3em]">Problem // Statement</span>
            <div className="h-px flex-1 bg-divider" />
          </motion.div>

<TerminalBlock title="problem.log">
  <div className="space-y-6">
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="text-text-secondary text-base md:text-lg leading-relaxed"
    >
      <span className="text-flow-shell-start font-heading text-xl md:text-2xl font-semibold">Every UPI transaction assumes one thing:</span>{' '}
      that you have internet. But across India, payments fail daily — in rural areas with weak signals, metros underground, highways, and during outages.
    </motion.p>

    <motion.p
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className="text-text-secondary text-base md:text-lg leading-relaxed"
    >
      Failed payments mean lost sales, reduced trust, and a fallback to cash. Meanwhile, cellular networks still work.
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 }}
      className="border-l-2 border-accent/50 pl-6 py-2"
    >
      <p className="text-text-primary text-lg md:text-xl font-heading italic">
        "Payments failed where calls worked. That gap didn’t make sense."
      </p>
      <p className="text-text-hint text-sm mt-2 font-mono">— Chirag & Meet, AirPay</p>
    </motion.div>
  </div>
</TerminalBlock>

          {/* Problem cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { icon: WifiOff, label: 'Rural Areas', desc: 'Weak or no connectivity' },
              { icon: Signal, label: 'Underground', desc: 'Metros & tunnels' },
              { icon: Globe, label: 'Remote Highways', desc: 'Connectivity drops' },
              { icon: Zap, label: 'Emergencies', desc: 'Disasters & outages' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.4 }}
                className="border border-divider rounded-xl p-4 bg-surface/30 text-center"
              >
                <item.icon className="w-5 h-5 text-accent mx-auto mb-2" />
                <div className="text-text-primary text-xs font-heading font-semibold">{item.label}</div>
                <div className="text-text-hint text-[10px] font-mono mt-1">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SignalLine />

      {/* ═══════════════════════════════════════════════════════════════════
          THE SOLUTION — HOW AIRPAY WORKS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="h-px flex-1 bg-divider" />
            <span className="text-text-hint text-xs font-mono uppercase tracking-[0.3em]">Solution // How It Works</span>
            <div className="h-px flex-1 bg-divider" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              UPI Over <span className="text-flow-shell-start"><GlitchText text="GSM Signaling" /></span>
            </h2>
            <p className="text-text-secondary text-base max-w-2xl mx-auto">
              AirPay is an asynchronous, offline-tolerant payment orchestration layer. It bridges modern UPI 
              with legacy GSM  channels, using an intelligent accessibility service to navigate 
              banking menus automatically.
            </p>
          </motion.div>

          {/* GSM  Flow */}
          <TerminalBlock title="transaction-flow.sh">
            <GSMFlowVisualization />
          </TerminalBlock>

          {/* Architecture cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
            <ArchCard
              icon={Radio}
              title="GSM  Interceptor"
              description="Background daemon that monitors and programmatically interacts with GSM  menus — no internet tunnel needed, just GSM."
              index={0}
            />
            <ArchCard
              icon={Zap}
              title="State Machine"
              description="Finite State Automaton managing payment flow states. Handles menu navigation, data injection, and error recovery automatically."
              index={1}
            />
            <ArchCard
              icon={Smartphone}
              title="QR Code Scanner"
              description="Extracts UPI ID, amount, and recipient details from any standard UPI QR code. Familiar scan-and-pay experience."
              index={2}
            />
            <ArchCard
              icon={Shield}
              title="Zero-Trust Security"
              description="MPIN entry always stays with the user. No credentials stored. Accessibility service is sandboxed. Manual security handoff at the critical moment."
              index={3}
            />
            <ArchCard
              icon={Signal}
              title="Offline-First Architecture"
              description="Designed for disconnected operations from the ground up. Queues transactions locally, processes when connectivity returns."
              index={4}
            />
            <ArchCard
              icon={Users}
              title="Multi-Carrier Support"
              description="Compatible with major Indian carriers — Airtel, Jio, Vi. Works with any GSM -enabled SIM on Android 8.0+."
              index={5}
            />
          </div>
        </div>
      </section>
      

      {/* ═══════════════════════════════════════════════════════════════════
          THE FOUNDERS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-12 md:py-16">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="h-px flex-1 bg-divider" />
            <span className="text-text-hint text-xs font-mono uppercase tracking-[0.3em]">The // Founders</span>
            <div className="h-px flex-1 bg-divider" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-text-secondary text-base md:text-lg max-w-2xl mx-auto mb-16"
          >
            Two third-year engineering students from Gurgaon who believe that if you can 
            make a phone call, you should be able to make a payment.
          </motion.p>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {founders.map((founder, i) => (
              <FounderCard key={founder.name} {...founder} index={i} />
            ))}
          </div>
        </div>
      </section>


     

      {/* ═══════════════════════════════════════════════════════════════════
          TECH STACK
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-12"
          >
            <div className="h-px flex-1 bg-divider" />
            <span className="text-text-hint text-xs font-mono uppercase tracking-[0.3em]">Tech // Stack</span>
            <div className="h-px flex-1 bg-divider" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Frontend */}
            <TerminalBlock title="frontend.config">
              <div className="space-y-3">
                <h4 className="text-text-primary font-heading font-semibold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-flow-shell-start" />
                  Frontend
                </h4>
                {['React Native', 'Cross-Platform (iOS & Android)', 'Responsive UI Design', 'Secure Input Handling'].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-2 text-text-secondary text-xs font-mono"
                  >
                    <ChevronRight className="w-3 h-3 text-flow-shell-start flex-shrink-0" />
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>
            </TerminalBlock>

            {/* Backend */}
            <TerminalBlock title="backend.config">
              <div className="space-y-3">
                <h4 className="text-text-primary font-heading font-semibold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-warning" />
                  Backend
                </h4>
                {['Node.js Runtime', 'Express.js APIs', 'Modular Architecture', 'Offline-First Model', 'Scalable Design'].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-2 text-text-secondary text-xs font-mono"
                  >
                    <ChevronRight className="w-3 h-3 text-warning flex-shrink-0" />
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>
            </TerminalBlock>

            {/* Security */}
            <TerminalBlock title="security.config">
              <div className="space-y-3">
                <h4 className="text-text-primary font-heading font-semibold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  Security
                </h4>
                {['End-to-End Encryption', 'Hardware-Backed Keys', 'Zero Credential Storage', 'Fraud Detection', 'Sandboxed Services'].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-2 text-text-secondary text-xs font-mono"
                  >
                    <ChevronRight className="w-3 h-3 text-accent flex-shrink-0" />
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>
            </TerminalBlock>
          </div>
        </div>
      </section>

      <SignalLine />

      {/* ═══════════════════════════════════════════════════════════════════
          MISSION + VISION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative border border-divider rounded-2xl p-8 md:p-10 bg-surface/30 backdrop-blur-sm overflow-hidden group hover:border-flow-shell-start/20 transition-colors"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-flow-shell-start/5 rounded-full blur-3xl group-hover:bg-flow-shell-start/10 transition-colors" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-flow-shell-start/20 bg-flow-shell-start/5 mb-6">
                  <Wifi className="w-3 h-3 text-flow-shell-start" />
                  <span className="text-[10px] font-mono text-flow-shell-start uppercase tracking-widest">Mission</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-heading font-bold mb-4">
                  <GlitchText text="Payments Without Barriers" />
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  To make digital payments accessible to every Indian — regardless of internet 
                  connectivity, network conditions, or geography. If you have a SIM card and one bar 
                  of signal, you should be able to pay. AirPay brings the convenience of UPI to the 
                  400M+ Indians who live in areas with unreliable internet.
                </p>
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative border border-divider rounded-2xl p-8 md:p-10 bg-surface/30 backdrop-blur-sm overflow-hidden group hover:border-accent/20 transition-colors"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 mb-6">
                  <ExternalLink className="w-3 h-3 text-accent" />
                  <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Vision</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-heading font-bold mb-4">
                  <GlitchText text="The Offline Payment Standard" />
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  To become the default payment layer for disconnected environments — not just 
                  in India, but globally. We envision a world where network outages, natural disasters, 
                  and infrastructure gaps never prevent someone from completing a transaction. 
                  Digital payments should be as reliable as a phone call.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <SignalLine />

      {/* ═══════════════════════════════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-24 md:py-32">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
              Payments should work{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-flow-shell-start to-accent">
                <GlitchText text="everywhere" />
              </span>
              .
            </h2>
            <p className="text-text-secondary text-base md:text-lg mb-10 max-w-lg mx-auto">
              We're building the future of offline-first payments. Want to know more, 
              test the app, or just chat about GSM  protocols?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticWrap>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-flow-shell-start to-flow-shell-end text-white font-mono text-sm font-medium hover:shadow-lg hover:shadow-flow-shell-start/25 transition-all"
                >
                  <span>Explore AirPay</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </MagneticWrap>
              <MagneticWrap>
                <a
                  href="mailto:airpay.perry@gmail.com"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-divider text-text-secondary hover:text-text-primary hover:border-text-hint transition-all font-mono text-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>airpay.perry@gmail.com</span>
                </a>
              </MagneticWrap>
            </div>

            {/* GitHub link */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <a
                href="https://github.com/cgchiraggupta"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-text-hint hover:text-text-secondary transition-colors text-xs font-mono"
              >
                <Github className="w-3.5 h-3.5" />
                <span>View on GitHub</span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}