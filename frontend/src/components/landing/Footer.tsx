import { Link } from 'react-router-dom';
import { Award, Github, Linkedin, Twitter } from 'lucide-react';
import { useState, useEffect } from 'react';

const RealisticMeteoroid = ({ id }: { id: number }) => {
  const [key, setKey] = useState(0);
  const [pos, setPos] = useState({
    top: Math.random() * 70,
    left: 40 + Math.random() * 60,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPos({
        top: Math.random() * 70,
        left: 40 + Math.random() * 60,
      });
      setKey((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      key={key}
      className="absolute z-0 pointer-events-none animate-[meteor_linear_infinite]"
      style={{
        top: `${pos.top}%`,
        left: `${pos.left}%`,
        animationDuration: '6s',
      }}
    >
      <div className="meteor-head" />
      <div className="meteor-tail" style={{ width: '150px' }} />
    </div>
  );
};

const DynamicStar = ({ id }: { id: number }) => {
  const [key, setKey] = useState(0);
  const [style, setStyle] = useState({});

  useEffect(() => {
    const randomize = () => {
      const size = (Math.random() * 2 + 0.5) * 1.1;
      const duration = 3 + Math.random() * 5;
      setStyle({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDuration: `${duration}s`,
        boxShadow: size > 1.5 ? '0 0 6px rgba(255, 255, 255, 1)' : '0 0 2px rgba(255, 255, 255, 0.5)',
      });
    };
    randomize();

    const interval = setInterval(() => {
      setKey(prev => prev + (1));
      randomize();
    }, 8000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, [id]);

  return (
    <div
      key={key}
      className="star absolute animate-[star-lifecycle_ease-in-out_infinite]"
      style={style}
    />
  );
};

const FlareStar = ({ id }: { id: number }) => {
  const [key, setKey] = useState(0);
  const [style, setStyle] = useState({});

  useEffect(() => {
    const randomize = () => {
      setStyle({
        top: `${Math.random() * 80 + 10}%`,
        left: `${Math.random() * 90 + 5}%`,
        transform: `scale(${Math.random() * 0.5 + 0.3})`,
        animationDelay: `${Math.random() * 3}s`,
      });
    };
    randomize();

    const interval = setInterval(() => {
      setKey(prev => prev + 1);
      randomize();
    }, 10000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, [id]);

  return (
    <div
      key={key}
      className="bright-star absolute pointer-events-none"
      style={style}
    />
  );
};

const StarsBackground = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#0B0F1A]/95">
      <RealisticMeteoroid id={1} />
      <RealisticMeteoroid id={2} />
      {[...Array(30)].map((_, i) => (
        <DynamicStar key={i} id={i} />
      ))}
      {[...Array(4)].map((_, i) => (
        <FlareStar key={`flare-${i}`} id={i} />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
    </div>
  );
};

export const Footer = () => {
  return (
    <footer className="footer-cosmic py-12 lg:py-16 relative overflow-hidden">
      <StarsBackground />
      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-110">
                <Award className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">CertifyPro</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Create beautiful, professional certificates in minutes with our easy-to-use online editor.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-6">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-white transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link to="/editor" className="text-muted-foreground hover:text-white transition-colors">
                  Editor
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-6">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-white transition-colors">
                  Tutorials
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-6">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-muted-foreground hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-muted-foreground hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2025 CertifyPro. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Crafted with <span className="text-red-500 animate-pulse">❤️</span> by FourstepSolutions
          </p>
        </div>
      </div>
    </footer>
  );
};
