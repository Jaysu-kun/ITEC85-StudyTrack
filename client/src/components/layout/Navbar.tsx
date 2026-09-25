import React from 'react';
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, User, LogOut, CheckSquare } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';
import useToast from '../../store/useToast';
import Logo from '../../assets/images/StudyTrack_Logo.png';
import Button from '../ui/Button';
import NotificationBell from '../notifications/NotificationBell';

export const StudyTrackLogo: React.FC = () => (
  <div className="group flex items-center gap-2 sm:gap-2.5 transition-all duration-200">
    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center bg-sky-500/10 dark:bg-sky-400/10 border border-sky-200/70 dark:border-sky-500/25 transition-transform duration-200 ease-out group-hover:scale-105 shadow-xs flex-shrink-0">
      <img
        src={Logo}
        alt="IskoTasks Logo"
        className="h-5.5 w-5.5 sm:h-6 sm:w-6 object-contain"
      />
    </div>
    <span className="text-base sm:text-lg md:text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 dark:from-sky-400 dark:via-sky-300 dark:to-cyan-400 transition-opacity duration-200 group-hover:opacity-90">
      IskoTasks
    </span>
  </div>
);

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    showToast('You have been logged out successfully.', 'info');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <HeroNavbar
      maxWidth="xl"
      isBordered
      className="fixed top-0 left-0 w-full z-40 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.3)] px-2 sm:px-4"
    >
      <NavbarBrand className="flex-grow-0 min-w-0 pr-2">
        <RouterLink to="/" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-xl p-1">
          <StudyTrackLogo />
        </RouterLink>
      </NavbarBrand>

      <NavbarContent justify="end" className="gap-1 sm:gap-2.5">
        {isAuthenticated && (
          <NavbarItem>
            <RouterLink
              to="/"
              aria-label="Tasks Dashboard"
              className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 sm:gap-2 ${
                isActive('/')
                  ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
              }`}
            >
              <CheckSquare size={17} className="flex-shrink-0" />
              <span className="hidden sm:inline">Tasks</span>
            </RouterLink>
          </NavbarItem>
        )}

        {/* Notification Bell */}
        {isAuthenticated && (
          <NavbarItem>
            <NotificationBell />
          </NavbarItem>
        )}

        {/* Theme Toggle Button */}
        <NavbarItem>
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun size={18} className="transition-transform rotate-0 hover:rotate-45 duration-300" />
            ) : (
              <Moon size={18} className="transition-transform rotate-0 hover:-rotate-12 duration-300" />
            )}
          </button>
        </NavbarItem>

        {isAuthenticated ? (
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <button
                  aria-label="User profile and menu"
                  className="flex items-center gap-1.5 sm:gap-2 py-1.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/90 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer"
                >
                  <div className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-tr from-sky-400 to-blue-600 text-white flex items-center justify-center text-[11px] sm:text-xs font-bold shadow-xs flex-shrink-0">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] md:max-w-[130px] truncate">{user?.name || 'Account'}</span>
                </button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User Actions" variant="flat" className="p-1 min-w-[160px]">
                <DropdownItem
                  key="profile"
                  onPress={() => navigate('/profile')}
                  startContent={<User size={16} />}
                >
                  Profile
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  className="text-danger"
                  onPress={handleLogout}
                  startContent={<LogOut size={16} />}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {location.pathname === '/signup' ? (
              <NavbarItem>
                <RouterLink to="/login">
                  <Button variant="outline" size="sm">
                    Log In
                  </Button>
                </RouterLink>
              </NavbarItem>
            ) : location.pathname === '/login' ? (
              <NavbarItem>
                <RouterLink to="/signup">
                  <Button variant="gradient" size="sm">
                    Sign Up
                  </Button>
                </RouterLink>
              </NavbarItem>
            ) : (
              <>
                <NavbarItem className="hidden xs:flex">
                  <RouterLink
                    to="/login"
                    className="px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  >
                    Log In
                  </RouterLink>
                </NavbarItem>
                <NavbarItem>
                  <RouterLink to="/signup">
                    <Button variant="gradient" size="sm">
                      Sign Up
                    </Button>
                  </RouterLink>
                </NavbarItem>
              </>
            )}
          </div>
        )}
      </NavbarContent>
    </HeroNavbar>
  );
};

export default Navbar;
