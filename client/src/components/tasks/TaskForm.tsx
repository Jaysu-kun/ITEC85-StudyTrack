import React, { useId, useState } from 'react';
import { ListTodo, Calendar, AlertCircle } from 'lucide-react';
import { Task, Priority } from '../../types';
import Button from '../ui/Button';
import useTaskStore from '../../store/useTaskStore';
import useAuthStore from '../../store/useAuthStore';
import useToast from '../../store/useToast';
import { formatLocalInputDateTime } from '../../utils/date';

interface TaskFormProps {
  initialTask?: Task;
  onSubmit: () => void;
  onCancel: () => void;
}

const priorityColors: Record<Priority, { label: string; active: string }> = {
  low: {
    label: 'Low',
    active: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-500 shadow-sm',
  },
  medium: {
    label: 'Medium',
    active: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-500 shadow-sm',
  },
  high: {
    label: 'High',
    active: 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-500 shadow-sm',
  },
};

const getRandomColor = () => {
  const colors = [
    '#0284C7', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
    '#EC4899', '#06B6D4', '#6366F1'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const TaskForm: React.FC<TaskFormProps> = ({
  initialTask,
  onSubmit,
  onCancel,
}) => {
  const formId = useId();
  const titleId = `${formId}-title`;
  const descriptionId = `${formId}-description`;
  const priorityId = `${formId}-priority`;
  const deadlineId = `${formId}-deadline`;
  const subjectId = `${formId}-subject`;
  const newSubjectId = `${formId}-new-subject`;

  const { user } = useAuthStore();
  const { addTask, updateTask, categories, addCategory } = useTaskStore();
  const { showToast } = useToast();

  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [priority, setPriority] = useState<Priority>(initialTask?.priority || 'medium');
  const [deadline, setDeadline] = useState(
    formatLocalInputDateTime(initialTask?.deadline)
  );
  const [subject, setSubject] = useState(initialTask?.subject || (categories[0]?.id || ''));
  const [newSubject, setNewSubject] = useState('');
  const [showNewSubject, setShowNewSubject] = useState(categories.length === 0 && !initialTask?.subject);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Task title is required.';
    }

    if (!deadline) {
      newErrors.deadline = 'Please select a deadline.';
    }

    if (showNewSubject && !newSubject.trim()) {
      newErrors.newSubject = 'Please specify a subject name.';
    } else if (!showNewSubject && !subject) {
      newErrors.subject = 'Please select a subject.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    setIsSubmitting(true);

    try {
      let finalSubject = subject;

      // Create new subject/category if selected
      if (showNewSubject && newSubject.trim()) {
        const createdCat = addCategory({
          userId: user.id,
          name: newSubject.trim(),
          color: getRandomColor(),
        });
        finalSubject = createdCat.id;
      }

      const taskPayload = {
        userId: user.id,
        title: title.trim(),
        description: description.trim(),
        priority,
        deadline,
        subject: finalSubject,
        completed: initialTask?.completed || false,
      };

      if (initialTask) {
        await updateTask(initialTask.id, taskPayload);
        showToast('Task updated successfully.', 'edit');
      } else {
        await addTask(taskPayload);
        showToast('Task created successfully.', 'add');
      }

      onSubmit();
    } catch (err) {
      console.error('Task submission error:', err);
      showToast('Task saved locally (network sync pending).', 'info');
      onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Title */}
      <div>
        <label htmlFor={titleId} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Title <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            id={titleId}
            type="text"
            placeholder="Add a title for your task"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? `${titleId}-error` : undefined}
            className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 ${errors.title
                ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500/25'
                : 'border-slate-200 dark:border-slate-700/80'
              }`}
          />
          <ListTodo size={18} className="absolute right-3.5 top-3 text-slate-400 dark:text-slate-500 pointer-events-none" />
        </div>
        {errors.title && (
          <p id={`${titleId}-error`} role="alert" className="flex items-center gap-1 text-xs text-rose-500 mt-1.5 font-medium">
            <AlertCircle size={14} /> {errors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor={descriptionId} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Description <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
        </label>
        <textarea
          id={descriptionId}
          placeholder="Add notes or instructions"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      {/* Priority & Deadline Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Priority */}
        <div>
          <fieldset className="border-0 p-0 m-0 min-w-0">
            <legend id={priorityId} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Priority
            </legend>
            <div className="flex gap-2" role="group" aria-labelledby={priorityId}>
              {(['low', 'medium', 'high'] as const).map((p) => {
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    aria-pressed={isSelected}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${isSelected
                        ? priorityColors[p].active
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                  >
                    {priorityColors[p].label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* Deadline */}
        <div>
          <label htmlFor={deadlineId} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Due date & time <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id={deadlineId}
              type="datetime-local"
              required
              value={deadline}
              onChange={(e) => {
                setDeadline(e.target.value);
                if (errors.deadline) setErrors((prev) => ({ ...prev, deadline: '' }));
              }}
              aria-invalid={Boolean(errors.deadline)}
              aria-describedby={`${deadlineId}-help${errors.deadline ? ` ${deadlineId}-error` : ''}`}
              className={`w-full px-4 py-2 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${errors.deadline
                  ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500/25'
                  : 'border-slate-200 dark:border-slate-700/80'
                }`}
            />
            <Calendar size={18} className="absolute right-3.5 top-2.5 text-slate-400 dark:text-slate-500 pointer-events-none hidden sm:block" />
          </div>
          <p id={`${deadlineId}-help`} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Choose the date and time this task is due.
          </p>
          {errors.deadline && (
            <p id={`${deadlineId}-error`} role="alert" className="flex items-center gap-1 text-xs text-rose-500 mt-1.5 font-medium">
              <AlertCircle size={14} /> {errors.deadline}
            </p>
          )}
        </div>
      </div>

      {/* Subject / Category */}
      <div>
        <label htmlFor={showNewSubject ? newSubjectId : subjectId} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          {showNewSubject ? 'New subject' : 'Subject'} <span className="text-rose-500">*</span>
        </label>

        {!showNewSubject ? (
          <div className="flex gap-2">
            <select
              id={subjectId}
              required
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (errors.subject) setErrors((prev) => ({ ...prev, subject: '' }));
              }}
              aria-invalid={Boolean(errors.subject)}
              aria-describedby={errors.subject ? `${subjectId}-error` : undefined}
              className={`flex-1 px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 ${errors.subject
                  ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500/25'
                  : 'border-slate-200 dark:border-slate-700/80'
                }`}
            >
              {categories.length === 0 ? (
                <option value="" disabled>
                  No subjects yet — click Add subject
                </option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={() => setShowNewSubject(true)}
            >
              Add subject
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              id={newSubjectId}
              type="text"
              placeholder="e.g. Computer Science"
              required
              value={newSubject}
              onChange={(e) => {
                setNewSubject(e.target.value);
                if (errors.newSubject) setErrors((prev) => ({ ...prev, newSubject: '' }));
              }}
              aria-invalid={Boolean(errors.newSubject)}
              aria-describedby={errors.newSubject ? `${newSubjectId}-error` : undefined}
              className={`flex-1 px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 ${errors.newSubject
                  ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500/25'
                  : 'border-slate-200 dark:border-slate-700/80'
                }`}
            />
            {categories.length > 0 && (
              <Button
                variant="secondary"
                size="md"
                type="button"
                onClick={() => setShowNewSubject(false)}
              >
                Cancel
              </Button>
            )}
          </div>
        )}

        {(errors.subject || errors.newSubject) && (
          <p id={`${showNewSubject ? newSubjectId : subjectId}-error`} role="alert" className="flex items-center gap-1 text-xs text-rose-500 mt-1.5 font-medium">
            <AlertCircle size={14} /> {errors.subject || errors.newSubject}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <Button
          variant="outline"
          size="md"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="gradient"
          size="md"
          type="submit"
          isLoading={isSubmitting}
        >
          {initialTask ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
