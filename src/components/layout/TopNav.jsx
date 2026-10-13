import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Plus, Moon, Sun, LogOut, User as UserIcon, Menu } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function TopNav({ onMenuClick }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch(e) {}
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const fetchSearch = async () => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-surface flex-shrink-0 z-30 relative">
      
      {/* Mobile Hamburger & Breadcrumbs */}
      <div className="flex items-center space-x-3 text-sm text-text-muted">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-1 rounded-md text-text hover:bg-background lg:hidden transition-colors"
          title="Open Menu"
        >
          <Menu className="h-5 w-5 text-primary" />
        </button>

        <div className="hidden sm:flex items-center">
          <span className="font-semibold text-primary">Innomatrics</span>
          <span className="mx-2">/</span>
          <span className="text-text font-medium">CRM Platform</span>
        </div>
      </div>

      {/* Center - Global Search (Responsive) */}
      <div className="flex-1 max-w-xs sm:max-w-md mx-2 sm:mx-6 relative" ref={searchRef}>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search clients, leads, projects, tickets..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
            className="w-full bg-background border border-border rounded-md py-2 pl-10 pr-4 text-sm text-text focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Global Search Results Dropdown */}
        {showResults && searchQuery.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-12 bg-surface border border-border rounded-md shadow-xl py-2 z-50 max-h-96 overflow-y-auto">
            {isSearching && <div className="px-4 py-2 text-xs text-text-muted">Searching...</div>}
            {!isSearching && searchResults.length === 0 && (
              <div className="px-4 py-2 text-xs text-text-muted">No records found matching "{searchQuery}"</div>
            )}
            {!isSearching && searchResults.map((item, idx) => (
              <Link
                key={idx}
                to={item.link}
                onClick={() => setShowResults(false)}
                className="flex items-center justify-between px-4 py-2 hover:bg-primary/10 transition-colors border-b border-border/50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-text">{item.title}</p>
                  <p className="text-xs text-text-muted">{item.subtitle}</p>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-primary/20 text-primary rounded">
                  {item.type}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        <button onClick={toggleTheme} className="text-text-muted hover:text-text transition-colors p-1.5 rounded-md hover:bg-background">
          <Moon className="h-5 w-5 hidden dark:block" />
          <Sun className="h-5 w-5 block dark:hidden" />
        </button>

        <Link to="/action-center" className="relative text-text-muted hover:text-text transition-colors p-1.5 rounded-md hover:bg-background">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-danger"></span>
        </Link>

        <div className="h-6 w-px bg-border"></div>

        <button 
          onClick={handleLogout}
          title="Logout"
          className="flex items-center text-xs font-medium text-text-muted hover:text-danger transition-colors p-1.5 rounded-md hover:bg-danger/10"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Logout
        </button>
      </div>
      
    </header>
  );
}
