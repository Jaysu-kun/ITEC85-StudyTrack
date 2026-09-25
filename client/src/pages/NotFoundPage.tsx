import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-center items-center p-4 sm:p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl sm:rounded-3xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 sm:mb-6 shadow-inner border border-sky-200/60 dark:border-sky-800/60 flex-shrink-0">
          <Compass className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        <h1 className="text-5xl sm:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600">
          404
        </h1>
        <h2 className="mt-2.5 sm:mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Page Not Found
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
          The page you're looking for doesn't exist or was moved.
        </p>

        <div className="mt-6 sm:mt-8 flex justify-center">
          <Link to="/">
            <Button variant="gradient" size="md" icon={<ArrowLeft size={18} />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;