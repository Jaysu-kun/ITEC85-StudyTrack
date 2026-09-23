import React, { useState } from 'react';
import { CheckCircle, Clock, Edit2, Trash2, BookOpen, AlertTriangle, BellRing } from 'lucide-react';
import { Task, Priority } from '../../types';
import Card from '../ui/Card';
import useTaskStore from '../../store/useTaskStore';
import useToast from '../../store/useToast';
import { formatDeadline, isTaskOverdue, isDueWithin24Hours, getTimeRemainingText } from '../../utils/date';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const priorityStyles: Record<
  Priority,
  { badge: string; border: string; dot: string }
> = {
  low: {
    badge: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
    border: 'border-l-emerald-500',
    dot: 'bg-emerald-500',
  },
  medium: {
    badge: 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
    border: 'border-l-amber-500',
    dot: 'bg-amber-500',
  },
  high: {
    badge: 'bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
    border: 'border-l-rose-500',
    dot: 'bg-rose-500',
  },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { toggleTaskCompletion, deleteTask, categories } = useTaskStore();
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      showToast('Task deleted successfully.', 'delete');
    } catch (err) {
      console.error('Error deleting task:', err);
      showToast('Failed to delete task.', 'error');
      setIsDeleting(false);
    }
  };

  const handleToggle = async () => {
    try {
      await toggleTaskCompletion(task.id);
      if (!task.completed) {
        showToast('Task marked as completed.', 'success');
      }
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const isOverdue = isTaskOverdue(task.deadline, task.completed);
  const isDueSoon = isDueWithin24Hours(task.deadline, task.completed);
  const remainingTime = isDueSoon ? getTimeRemainingText(task.deadline) : '';

  const currentCategory = categories.find((c) => c.id === task.subject);
  const categoryName = currentCategory ? currentCategory.name : task.subject || 'General';
  const categoryColor = currentCategory?.color || '#0284C7';

  const priorityStyle = priorityStyles[task.priority] || priorityStyles.medium;

  return (
    <Card
      id={`task-${task.id}`}
      variant="default"
      className={`relative overflow-hidden p-5 sm:p-6 border-l-4 ${
        task.completed
          ? 'border-l-slate-300 dark:border-l-slate-700 opacity-75'
          : isDueSoon
          ? 'border-l-amber-500 ring-1 ring-amber-400/30'
          : priorityStyle.border
      } hover:shadow-lg transition-all duration-200 group`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Checkbox and Task Content */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <button
            onClick={handleToggle}
            aria-label={task.completed ? 'Mark task incomplete' : 'Mark task completed'}
            className="mt-0.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full active:scale-90 cursor-pointer"
          >
            <CheckCircle
              size={23}
              className={`transition-colors ${
                task.completed
                  ? 'text-emerald-500 fill-emerald-100 dark:fill-emerald-950'
                  : 'text-slate-300 dark:text-slate-600 hover:text-emerald-500'
              }`}
            />
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`text-base sm:text-lg font-bold tracking-tight break-words transition-colors ${
                task.completed
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {task.title}
            </h3>

            {task.description && (
              <p
                className={`mt-1.5 text-sm break-words leading-relaxed ${
                  task.completed
                    ? 'line-through text-slate-400 dark:text-slate-600'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Subject and tags */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold border"
                style={{
                  backgroundColor: `${categoryColor}15`,
                  borderColor: `${categoryColor}35`,
                  color: categoryColor,
                }}
              >
                <BookOpen size={12} />
                <span>{categoryName}</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${priorityStyle.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
                <span className="capitalize">{task.priority} Priority</span>
              </span>

              {/* 24-Hour Urgent Alert Badge */}
              {isDueSoon && !task.completed && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60 animate-pulse">
                  <BellRing size={12} className="text-amber-600 dark:text-amber-400" />
                  <span>Due &lt; 24h ({remainingTime})</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            aria-label={`Edit ${task.title}`}
            className="p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 dark:hover:text-sky-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
          >
            <Edit2 size={15} />
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label={`Delete ${task.title}`}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Footer Deadline */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/90 flex items-center justify-between text-xs">
        <div
          className={`flex items-center gap-1.5 font-semibold ${
            isOverdue
              ? 'text-rose-600 dark:text-rose-400'
              : isDueSoon
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {isOverdue ? (
            <AlertTriangle size={14} />
          ) : isDueSoon ? (
            <Clock size={14} className="animate-pulse" />
          ) : (
            <Clock size={14} />
          )}
          <span>
            Due: {formatDeadline(task.deadline)}
            {isDueSoon && ` (${remainingTime})`}
          </span>
        </div>

        {task.completed && (
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Completed</span>
        )}
      </div>
    </Card>
  );
};

export default TaskCard;
