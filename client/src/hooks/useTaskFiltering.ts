import { useMemo, useState } from 'react';
import { Task, Priority } from '../types';
import { isTaskOverdue } from '../utils/date';

export type FilterStatus = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';

interface UseTaskFilteringProps {
  tasks: Task[];
  userId?: string;
}

export function useTaskFiltering({ tasks, userId }: UseTaskFilteringProps) {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const userTasks = useMemo(() => {
    if (!userId) return [];
    return tasks.filter((task) => task.userId === userId);
  }, [tasks, userId]);

  const metrics = useMemo(() => {
    const completed = userTasks.filter((t) => t.completed).length;
    const incomplete = userTasks.filter((t) => !t.completed).length;
    const overdue = userTasks.filter((t) => isTaskOverdue(t.deadline, t.completed)).length;

    return {
      total: userTasks.length,
      completed,
      incomplete,
      overdue,
    };
  }, [userTasks]);

  const filteredTasks = useMemo(() => {
    let result = [...userTasks];
    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    if (statusFilter === 'today') {
      result = result.filter((task) => {
        const d = new Date(task.deadline);
        return d >= todayStart && d <= todayEnd;
      });
    } else if (statusFilter === 'upcoming') {
      result = result.filter(
        (task) => !task.completed && new Date(task.deadline) > todayEnd
      );
    } else if (statusFilter === 'overdue') {
      result = result.filter(
        (task) => !task.completed && new Date(task.deadline) < todayStart
      );
    } else if (statusFilter === 'completed') {
      result = result.filter((task) => task.completed);
    }

    if (priorityFilter !== 'all') {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(q) ||
          (task.description && task.description.toLowerCase().includes(q))
      );
    }

    result.sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );

    return result;
  }, [userTasks, statusFilter, priorityFilter, searchQuery]);

  const incompleteTasks = useMemo(
    () => filteredTasks.filter((task) => !task.completed),
    [filteredTasks]
  );
  
  const completedTasks = useMemo(
    () => filteredTasks.filter((task) => task.completed),
    [filteredTasks]
  );

  return {
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    searchQuery,
    setSearchQuery,
    metrics,
    incompleteTasks,
    completedTasks,
    filteredTasks
  };
}
