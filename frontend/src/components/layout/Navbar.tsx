import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import {
  Boxes,
  Compass,
  FileSpreadsheet,
  BarChart3,
  Users,
  Network,
  History,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <Compass className="w-3.5 h-3.5" /> },
    { to: '/predict', label: 'Predict Shipment', icon: <Boxes className="w-3.5 h-3.5" /> },
    { to: '/batch', label: 'Batch CSV', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
    { to: '/analytics', label: 'Analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { to: '/customers', label: 'Customer Insights', icon: <Users className="w-3.5 h-3.5" /> },
    { to: '/associations', label: 'Associations', icon: <Network className="w-3.5 h-3.5" /> },
    { to: '/history', label: 'History', icon: <History className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08090a]/90 backdrop-blur-md border-b border-[#23252a]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-6 h-6 rounded-[6px] bg-[#0f1011] border border-[#383b3f] flex items-center justify-center text-[#ffffff] font-mono text-[11px] font-bold group-hover:border-[#e4f222] transition-colors">
            SF
          </div>
          <span className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
            Smart<span className="text-[#8a8f98] font-normal">Freight</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded-[4px] bg-[#161718] border border-[#23252a] text-[#8a8f98]">
            v2.1
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-[13px] px-2.5 py-1.5 rounded-[6px] transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#ffffff] bg-[#161718] border border-[#23252a]'
                    : 'text-[#8a8f98] hover:text-[#d0d6e0] hover:bg-[rgba(255,255,255,0.02)]'
                }`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/predict')}
            icon={<Sparkles className="w-3.5 h-3.5" />}
            className="hidden sm:inline-flex"
          >
            Predict Shipment
          </Button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-[6px] text-[#8a8f98] hover:text-[#ffffff] hover:bg-[#161718] border border-transparent hover:border-[#23252a] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#23252a] bg-[#0f1011] px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 text-[13px] px-3 py-2 rounded-[6px] transition-colors ${
                  isActive
                    ? 'text-[#ffffff] bg-[#161718] border border-[#23252a]'
                    : 'text-[#8a8f98] hover:text-[#ffffff]'
                }`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/predict');
              }}
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Predict Shipment
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

