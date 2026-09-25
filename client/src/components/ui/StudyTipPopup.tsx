import React, { useEffect, useState, useCallback } from 'react';
import {
  X,
  RefreshCw,
  BookOpen,
  Clock,
  Target,
  RotateCcw,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import Button from './Button';
import {
  CATEGORY_METADATA,
  getRandomTip,
  StudyTipItem,
  TipCategory,
} from '../../data/studyTips';

const getCategoryIcon = (category: TipCategory, size = 14) => {
  switch (category) {
    case 'study-strategy':
      return <BookOpen size={size} />;
    case 'time-management':
      return <Clock size={size} />;
    case 'focus':
      return <Target size={size} />;
    case 'review':
      return <RotateCcw size={size} />;
    case 'academic-habit':
    default:
      return <CheckCircle2 size={size} />;
  }
};

export const StudyTipPopup: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState<StudyTipItem | null>(null);
  const [animateOut, setAnimateOut] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const handleClose = useCallback(() => {
    setAnimateOut(true);
    sessionStorage.setItem('study_tip_dismissed', 'true');
    setTimeout(() => setVisible(false), 300);
  }, []);

  useEffect(() => {
    const tipDismissed = sessionStorage.getItem('study_tip_dismissed');
    if (!tipDismissed) {
      const initialTip = getRandomTip();
      setCurrentTip(initialTip);
      setVisible(true);
    }
  }, []);

  // Keyboard accessibility: close on Escape key
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, handleClose]);

  const handleNextTip = () => {
    setIsShuffling(true);
    setTimeout(() => {
      const nextTip = getRandomTip(currentTip?.id);
      setCurrentTip(nextTip);
      setIsShuffling(false);
    }, 180);
  };

  if (!visible || !currentTip) return null;

  const categoryMeta =
    CATEGORY_METADATA[currentTip.category] || CATEGORY_METADATA['study-strategy'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tip-dialog-title"
      aria-describedby="tip-content"
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
        animateOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[min(650px,90vh)] flex flex-col shadow-2xl overflow-hidden transform transition-all duration-300 ${
          animateOut
            ? 'scale-95 opacity-0 translate-y-4'
            : 'scale-100 opacity-100 translate-y-0'
        } bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-xs flex-shrink-0">
              <Lightbulb size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <h2
                id="tip-dialog-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate"
              >
                Daily Study Tip
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                Simple study habits for better productivity
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close study tip popup"
            className="rounded-full p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tip Body */}
        <div className="px-4 sm:px-8 py-3.5 sm:py-5 flex flex-col items-center overflow-y-auto flex-1">
          {/* Tip Card Container */}
          <div
            className={`w-full rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6 border transition-all duration-200 ${
              categoryMeta.cardClass
            } ${
              isShuffling ? 'opacity-40 scale-[0.98]' : 'opacity-100 scale-100'
            }`}
          >
            {/* Category Tag */}
            <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${categoryMeta.badgeClass}`}
              >
                {getCategoryIcon(currentTip.category, 13)}
                <span>{categoryMeta.label}</span>
              </span>
            </div>

            {/* Tip Title */}
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-2 tracking-tight break-words">
              {currentTip.title}
            </h3>

            {/* Tip Actionable Content */}
            <p
              id="tip-content"
              className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words"
            >
              {currentTip.content}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 w-full mt-auto pt-1">
            {/* Secondary: Next Tip */}
            <Button
              variant="outline"
              size="md"
              onClick={handleNextTip}
              disabled={isShuffling}
              icon={
                <RefreshCw
                  size={15}
                  className={`text-slate-600 dark:text-slate-300 transition-transform ${
                    isShuffling ? 'animate-spin' : ''
                  }`}
                />
              }
              className="w-full sm:w-auto"
            >
              <span>Next Tip</span>
            </Button>

            {/* Primary: Got It, Let's Study! */}
            <Button
              variant="gradient"
              size="md"
              className="w-full sm:w-auto px-6"
              onClick={handleClose}
            >
              Got It, Let's Study!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyTipPopup;
