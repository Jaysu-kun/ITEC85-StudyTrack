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
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg ${isCompletedSection ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' : 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60'}`}>
            {isCompletedSection ? <CheckCircle2 size={18} /> : <ListChecks size={18} />}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
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
            className="space-y-3.5"
          >
            {/* Inline Edit Form */}
            {editingTask && (
              <Card variant="glass" className="p-6 sm:p-8 mb-4 border-2 border-sky-500/80 dark:border-sky-500/60">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Edit Task: {editingTask.title}
                  </h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-semibold">
                    Editing Task
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
              <div className="grid grid-cols-1 gap-3">
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
              <div className="py-10 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3 border border-slate-200/60 dark:border-slate-700/60">
                  {isCompletedSection ? (
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  ) : (
                    <Inbox size={24} className="text-sky-500" />
                  )}
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-sm">
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
