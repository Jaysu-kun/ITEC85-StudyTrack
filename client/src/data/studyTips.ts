export type TipCategory =
  | 'study-strategy'
  | 'time-management'
  | 'focus'
  | 'review'
  | 'academic-habit';

export interface StudyTipItem {
  id: string;
  category: TipCategory;
  categoryLabel: string;
  title: string;
  content: string;
}

export const CATEGORY_METADATA: Record<
  TipCategory,
  { label: string; badgeClass: string; cardClass: string; iconName: string }
> = {
  'study-strategy': {
    label: 'Study Strategy',
    badgeClass:
      'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
    cardClass:
      'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40',
    iconName: 'BookOpen',
  },
  'time-management': {
    label: 'Time Management',
    badgeClass:
      'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    cardClass:
      'bg-amber-50/40 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40',
    iconName: 'Clock',
  },
  focus: {
    label: 'Focus',
    badgeClass:
      'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60',
    cardClass:
      'bg-sky-50/40 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/40',
    iconName: 'Target',
  },
  review: {
    label: 'Review',
    badgeClass:
      'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    cardClass:
      'bg-rose-50/40 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40',
    iconName: 'RotateCcw',
  },
  'academic-habit': {
    label: 'Academic Habit',
    badgeClass:
      'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    cardClass:
      'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40',
    iconName: 'CheckCircle2',
  },
};

export const STUDY_TIPS: StudyTipItem[] = [
  // --- STUDY STRATEGY ---
  {
    id: 'strat-1',
    category: 'study-strategy',
    categoryLabel: 'Study Strategy',
    title: 'Use the 3-Bullet Review',
    content:
      'After studying a topic, write three key points from memory. This helps you check what you actually understand before moving on.',
  },
  {
    id: 'strat-2',
    category: 'study-strategy',
    categoryLabel: 'Study Strategy',
    title: 'Explain It in Plain Terms',
    content:
      'Try explaining a complex topic without using textbook jargon. If you struggle to simplify the explanation, review that section again.',
  },
  {
    id: 'strat-3',
    category: 'study-strategy',
    categoryLabel: 'Study Strategy',
    title: 'Practice Retrieval Over Re-reading',
    content:
      'Close your notes and test your memory with practice questions. Active recall builds stronger memory pathways than passive reading.',
  },
  {
    id: 'strat-4',
    category: 'study-strategy',
    categoryLabel: 'Study Strategy',
    title: 'Combine Text with Visual Diagrams',
    content:
      'Draw a rough flowchart, concept map, or table for complex topics. Visualizing information makes it easier to recall during exams.',
  },
  {
    id: 'strat-5',
    category: 'study-strategy',
    categoryLabel: 'Study Strategy',
    title: 'Alternate Between Problem Types',
    content:
      'Mix different types of practice questions in one session instead of repeating just one. This sharpens your ability to identify the right approach.',
  },
  {
    id: 'strat-6',
    category: 'study-strategy',
    categoryLabel: 'Study Strategy',
    title: 'Attempt Problems Before Checking Answers',
    content:
      'Spend at least two minutes trying to solve a tough question independently before consulting solutions. The initial effort reinforces learning.',
  },

  // --- TIME MANAGEMENT ---
  {
    id: 'time-1',
    category: 'time-management',
    categoryLabel: 'Time Management',
    title: 'Use Short Focus Sprints',
    content:
      'Work with complete focus for 25 to 30 minutes, then take a 5-minute break. This maintains steady energy throughout long study days.',
  },
  {
    id: 'time-2',
    category: 'time-management',
    categoryLabel: 'Time Management',
    title: 'Apply the 2-Minute Rule',
    content:
      'If opening a file, organizing your desk, or reviewing a syllabus item takes less than two minutes, do it immediately to build momentum.',
  },
  {
    id: 'time-3',
    category: 'time-management',
    categoryLabel: 'Time Management',
    title: 'Plan Tasks the Night Before',
    content:
      'Write down your top three academic tasks before going to sleep. You will start the next morning with clear direction and less hesitation.',
  },
  {
    id: 'time-4',
    category: 'time-management',
    categoryLabel: 'Time Management',
    title: 'Tackle the Hardest Task First',
    content:
      'Start your study session with the most demanding assignment while your mental energy and focus are at their peak.',
  },
  {
    id: 'time-5',
    category: 'time-management',
    categoryLabel: 'Time Management',
    title: 'Set Realistic Session Limits',
    content:
      'Assign dedicated time blocks to specific tasks rather than studying open-endedly. Clear boundaries keep you working efficiently.',
  },
  {
    id: 'time-6',
    category: 'time-management',
    categoryLabel: 'Time Management',
    title: 'Break Large Projects into Milestones',
    content:
      'Divide research papers and major projects into small subtasks. Focusing on one milestone at a time reduces overwhelm.',
  },

  // --- FOCUS ---
  {
    id: 'focus-1',
    category: 'focus',
    categoryLabel: 'Focus',
    title: 'Keep Your Phone Out of Reach',
    content:
      'Place your phone in another room or turn on Do Not Disturb mode during study blocks. Reducing visible distractions protects deep work.',
  },
  {
    id: 'focus-2',
    category: 'focus',
    categoryLabel: 'Focus',
    title: 'Close Unrelated Browser Tabs',
    content:
      'Keep only the tabs and resources needed for your current task open. Digital clutter constantly divides your attention.',
  },
  {
    id: 'focus-3',
    category: 'focus',
    categoryLabel: 'Focus',
    title: 'Maintain a Single Work Focus',
    content:
      'Multitasking slows your learning and increases errors. Concentrate on one assignment or lecture until your planned timer ends.',
  },
  {
    id: 'focus-4',
    category: 'focus',
    categoryLabel: 'Focus',
    title: 'Clear Your Immediate Workspace',
    content:
      'Keep only the notebook, pen, and reference materials you need on your desk. A tidy study area helps keep your thoughts organized.',
  },
  {
    id: 'focus-5',
    category: 'focus',
    categoryLabel: 'Focus',
    title: 'Use a Distraction Dump Sheet',
    content:
      'When an unrelated thought pops into your head while studying, jot it on a scrap paper and return to your work immediately.',
  },
  {
    id: 'focus-6',
    category: 'focus',
    categoryLabel: 'Focus',
    title: 'Study in Consistent Environments',
    content:
      'Designate a specific desk or quiet corner for studying. Your mind quickly associates that spot with focused productivity.',
  },

  // --- REVIEW ---
  {
    id: 'rev-1',
    category: 'review',
    categoryLabel: 'Review',
    title: 'Review Notes Within 24 Hours',
    content:
      'Spend ten minutes scanning notes from today’s lectures. A quick early review significantly reduces how much information you forget.',
  },
  {
    id: 'rev-2',
    category: 'review',
    categoryLabel: 'Review',
    title: 'Build a One-Page Summary Sheet',
    content:
      'Condense an entire chapter or module onto a single page. Deciding what is essential forces you to organize core ideas effectively.',
  },
  {
    id: 'rev-3',
    category: 'review',
    categoryLabel: 'Review',
    title: 'Focus on Your Weakest Areas First',
    content:
      'Spend your review time on topics you scored lowest on rather than repeatedly revising what you already know well.',
  },
  {
    id: 'rev-4',
    category: 'review',
    categoryLabel: 'Review',
    title: 'Use the Blurting Method',
    content:
      'Read a section, close the notes, and write down everything you remember on a blank page. Compare with your notes to spot gaps.',
  },
  {
    id: 'rev-5',
    category: 'review',
    categoryLabel: 'Review',
    title: 'Create Practice Quizzes',
    content:
      'Turn lecture headings and key terms into sample questions. Testing yourself before the exam trains your brain for test conditions.',
  },
  {
    id: 'rev-6',
    category: 'review',
    categoryLabel: 'Review',
    title: 'Highlight Only Core Terms and Rules',
    content:
      'Avoid highlighting whole paragraphs. Marking only critical definitions and formulas makes essential points easy to review later.',
  },

  // --- ACADEMIC HABIT ---
  {
    id: 'habit-1',
    category: 'academic-habit',
    categoryLabel: 'Academic Habit',
    title: 'Stay Hydrated While Studying',
    content:
      'Keep a water bottle beside your desk. Even mild dehydration can reduce your concentration, alertness, and processing speed.',
  },
  {
    id: 'habit-2',
    category: 'academic-habit',
    categoryLabel: 'Academic Habit',
    title: 'Take Active Screen Breaks',
    content:
      'During study breaks, stand up, stretch, and look away from all screens. This relaxes your eyes and resets your mental energy.',
  },
  {
    id: 'habit-3',
    category: 'academic-habit',
    categoryLabel: 'Academic Habit',
    title: 'Prioritize Sleep Before Exams',
    content:
      'Aim for consistent rest before major tests. Sleep helps your brain consolidate new memories and improves critical thinking.',
  },
  {
    id: 'habit-4',
    category: 'academic-habit',
    categoryLabel: 'Academic Habit',
    title: 'Track Your Weekly Deadlines',
    content:
      'Review your task deadlines at the start of every week in IskoTask to avoid last-minute cramming and missed requirements.',
  },
  {
    id: 'habit-5',
    category: 'academic-habit',
    categoryLabel: 'Academic Habit',
    title: 'Pair Study Time with Daily Routines',
    content:
      'Attach study sessions to an existing routine, such as reviewing flashcards right after morning coffee or before dinner.',
  },
  {
    id: 'habit-6',
    category: 'academic-habit',
    categoryLabel: 'Academic Habit',
    title: 'Organize Your Digital Files',
    content:
      'Name and store your class files, handouts, and assignments in structured folders so you can locate materials without delay.',
  },
];

/**
 * Returns a random tip guaranteed to be different from the previous one.
 */
export function getRandomTip(excludeId?: string): StudyTipItem {
  const available = STUDY_TIPS.filter((t) => t.id !== excludeId);
  if (available.length === 0) return STUDY_TIPS[0];

  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}
