import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle2, Inbox, ListChecks } from 'lucide-react';
import { Task } from '../../types';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import Card from '../ui/Card';

interface TaskListProps {
  title: string;
  tasks: Task[];
  emptyMessage?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  title,
  tasks,
  emptyMessage = 'No tasks here.',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const isCompletedSection = title.toLowerCase().includes('completed');

  return (
    <div className="mb-6 sm:mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5 sm:mb-4 pb-2 sm:pb-2.5 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className={`p-1.5 rounded-lg flex-shrink-0 ${isCompletedSection ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' : 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60'}`}>
            {isCompletedSection ? <CheckCircle2 size={17} /> : <ListChecks size={17} />}
          </div>
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
            {title}
          </h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 flex-shrink-0">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer flex-shrink-0"
        >
          {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-3 sm:space-y-3.5"
          >
            {/* Inline Edit Form */}
            {editingTask && (
              <Card variant="glass" className="p-4 sm:p-8 mb-4 border-2 border-sky-500/80 dark:border-sky-500/60">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white truncate">
                    Edit Task: {editingTask.title}
                  </h3>
                  <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-semibold flex-shrink-0">
                    Editing
                  </span>
                </div>
                <TaskForm
                  initialTask={editingTask}
                  onSubmit={() => setEditingTask(null)}
                  onCancel={() => setEditingTask(null)}
                />
              </Card>
            )}

            {tasks.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TaskCard task={task} onEdit={(t) => setEditingTask(t)} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-8 sm:py-10 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 flex flex-col items-center justify-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2.5 sm:mb-3 border border-slate-200/60 dark:border-slate-700/60">
                  {isCompletedSection ? (
                    <CheckCircle2 size={22} className="text-emerald-500" />
                  ) : (
                    <Inbox size={22} className="text-sky-500" />
                  )}
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 max-w-sm">
                  {emptyMessage}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskList;
