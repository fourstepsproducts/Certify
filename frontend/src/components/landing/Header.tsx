import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Award, Menu, LayoutDashboard, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

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
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      key={key}
      className="absolute z-0 pointer-events-none animate-[meteor_linear_infinite]"
      style={{
        top: `${pos.top}%`,
        left: `${pos.left}%`,
        animationDuration: '5s',
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
      const duration = 2 + Math.random() * 4;
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
      setKey(prev => prev + 1);
      randomize();
    }, 6000 + Math.random() * 4000);

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
        transform: `scale(${Math.random() * 0.4 + 0.3})`,
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
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#0B0F1A]/80 backdrop-blur-md">
      <RealisticMeteoroid id={1} />
      <RealisticMeteoroid id={2} />
      {[...Array(15)].map((_, i) => (
        <DynamicStar key={i} id={i} />
      ))}
      {[...Array(3)].map((_, i) => (
        <FlareStar key={`flare-${i}`} id={i} />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
    </div>
  );
};

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user, loading } = useAuth();

  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const sectionId = location.hash.replace('#', '');
      setTimeout(() => scrollToSection(sectionId), 100);
    }
  }, [location.pathname, location.hash]);

  const handleScrollLink = (sectionId: string) => {
    setMobileMenuOpen(false);

    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
    } else {
      setTimeout(() => scrollToSection(sectionId), 100);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-cosmic sticky top-0 z-50 w-full border-b border-white/10 overflow-hidden">
      <StarsBackground />
      <div className="container relative z-10 flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl btn-cosmic shadow-lg transition-transform group-hover:scale-110">
            <Award className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white/90">Certify<span className="text-cosmic-cyan">Pro</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => handleScrollLink('templates')}
            className="text-sm font-semibold text-muted-cosmic hover:text-cosmic-purple transition-all duration-300"
          >
            Templates
          </button>
          <button
            onClick={() => handleScrollLink('features')}
            className="text-sm font-semibold text-muted-cosmic hover:text-cosmic-purple transition-all duration-300"
          >
            Features
          </button>
          <button
            onClick={() => handleScrollLink('pricing')}
            className="text-sm font-semibold text-muted-cosmic hover:text-cosmic-purple transition-all duration-300"
          >
            Pricing
          </button>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse mr-2" />
          ) : isAuthenticated && user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-white/10 rounded-xl transition-all text-white/90">
                    <div className="h-8 w-8 rounded-full btn-cosmic flex items-center justify-center font-bold text-xs shadow-md">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-semibold">{user.name}</span>
                      <ChevronDown className="h-3 w-3 text-muted-cosmic ml-1 inline" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#0B0F1A] border border-white/10 p-2 mt-2 rounded-xl shadow-2xl">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={() => navigate('/editor')} className="gap-3 cursor-pointer rounded-lg py-2.5 hover:bg-white/10 focus:bg-white/10 text-slate-200 transition-colors focus:text-white hover:text-white">
                    <LayoutDashboard className="h-4 w-4 text-cosmic-purple" />
                    <span className="font-medium">Go to Editor</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} className="gap-3 cursor-pointer rounded-lg py-2.5 hover:bg-white/10 focus:bg-white/10 text-slate-200 transition-colors focus:text-white hover:text-white">
                    <Award className="h-4 w-4 text-cosmic-cyan" />
                    <span className="font-medium">My Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-3 cursor-pointer rounded-lg py-2.5 hover:bg-white/10 focus:bg-white/10 text-slate-200 transition-colors focus:text-white hover:text-white">
                    <User className="h-4 w-4 text-cosmic-purple" />
                    <span className="font-medium">My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="gap-3 cursor-pointer rounded-lg py-2.5 text-red-400 focus:text-red-500 hover:text-red-500 focus:bg-red-400/10 hover:bg-red-400/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 font-medium">
                  Sign In
                </Button>
              </Link>
              <Button size="sm" className="btn-cosmic px-6 h-10 rounded-xl" onClick={() => handleScrollLink('pricing')}>
                Get Started Free
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white hover:bg-white/10"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background animate-fade-in">
          <nav className="container py-4 flex flex-col gap-2">
            <button
              onClick={() => handleScrollLink('templates')}
              className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent transition-colors text-left"
            >
              Templates
            </button>
            <button
              onClick={() => handleScrollLink('features')}
              className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent transition-colors text-left"
            >
              Features
            </button>
            <button
              onClick={() => handleScrollLink('pricing')}
              className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent transition-colors text-left"
            >
              Pricing
            </button>
            <div className="border-t mt-2 pt-4 flex flex-col gap-2">
              {loading ? (
                <div className="px-4 py-2 h-8 w-32 bg-muted animate-pulse rounded-lg" />
              ) : isAuthenticated && user ? (
                <>
                  <div className="px-4 py-2 text-sm text-muted-foreground">Signed in as {user?.name}</div>
                  <Button variant="ghost" className="justify-start w-full" onClick={handleLogout}>
                    Logout
                  </Button>
                  <Link to="/editor" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="hero" className="w-full">
                      Go to Editor
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="justify-start w-full">
                      Sign In
                    </Button>
                  </Link>
                  <button onClick={() => handleScrollLink('pricing')}>
                    <Button variant="hero" className="w-full">
                      Get Started Free
                    </Button>
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
