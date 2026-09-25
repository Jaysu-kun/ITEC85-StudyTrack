import React from 'react';
import Logo from '../../assets/images/StudyTrack_Logo.png';
import { Code, MessageCircle } from 'lucide-react';

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/',
    icon: <Code className="w-4 h-4" />,
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com/',
    icon: <MessageCircle className="w-4 h-4" />,
  },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
          {/* Logo and Brand */}
          <div className="flex flex-col items-center md:items-start gap-1.5 sm:gap-2">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="h-8 w-8 sm:h-8.5 sm:w-8.5 rounded-xl flex items-center justify-center bg-sky-500/10 dark:bg-sky-400/10 border border-sky-200/70 dark:border-sky-500/25 shadow-xs flex-shrink-0">
                <img
                  src={Logo}
                  alt="IskoTasks Logo"
                  className="h-5.5 w-5.5 sm:h-6 sm:w-6 object-contain"
                />
              </div>
              <span className="text-base sm:text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 dark:from-sky-400 dark:via-sky-300 dark:to-cyan-400">
                IskoTasks
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center md:text-left">
              Stay on top of your tasks and deadlines.
            </p>
          </div>

          {/* Social and links */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Built for students everywhere.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200/60 dark:border-slate-800/60 mt-6 sm:mt-8 pt-4 sm:pt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} IskoTasks. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
