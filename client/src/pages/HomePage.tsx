import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StudyTipPopup from '../components/ui/StudyTipPopup';
import WeatherWidget from '../components/widgets/WeatherWidget';
import SpotifyWidget from '../components/widgets/SpotifyWidget';
import ClockWidget from '../components/widgets/ClockWidget';
import DeadlineAlertBanner from '../components/notifications/DeadlineAlertBanner';
import useAuthStore from '../store/useAuthStore';
import useTaskStore from '../store/useTaskStore';
import { Priority } from '../types';
import { useTaskFiltering } from '../hooks/useTaskFiltering';
import useDeadlineNotifier from '../hooks/useDeadlineNotifier';

export const HomePage: React.FC = () => {
  const { user } = useAuthStore();
  const { tasks, isLoading } = useTaskStore();

  const [isAddingTask, setIsAddingTask] = useState(false);
  
  const {
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    searchQuery,
    setSearchQuery,
    metrics,
    incompleteTasks,
    completedTasks,
  } = useTaskFiltering({ tasks, userId: user?.id });

  const {
    urgentTasks,
    isBannerDismissed,
    dismissBanner,
  } = useDeadlineNotifier({ tasks, userId: user?.id, enableToasts: true });

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16">
      <StudyTipPopup />

      {/* Hero Welcome Header */}
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-5 bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-transparent p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-sky-200/70 dark:border-sky-900/40 backdrop-blur-md shadow-xs">
        <div className="min-w-0 flex-1">
          {/* Subtle Section Label */}
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-sky-100/90 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 mb-2">
            <Sparkles size={13} className="text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <span>Student Dashboard</span>
          </div>
          
          {/* Primary Page Heading */}
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight break-words">
            Mabuhay, {user?.name || 'Iskolar'}!
          </h1>
          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 mt-1 sm:mt-1.5">
            You have <strong className="text-slate-900 dark:text-white font-semibold">{metrics.incomplete}</strong> pending task{metrics.incomplete !== 1 ? 's' : ''}.
          </p>
        </div>

        <Button
          variant="gradient"
          size="md"
          icon={<Plus size={18} />}
          onClick={() => setIsAddingTask(true)}
          className="shadow-xs w-full sm:w-auto flex-shrink-0"
        >
          Create New Task
        </Button>
      </div>

      {/* 24-Hour Urgent Deadline Alert Banner */}
      {!isBannerDismissed && urgentTasks.length > 0 && (
        <DeadlineAlertBanner
          urgentTasks={urgentTasks}
          onDismiss={dismissBanner}
          onViewTasks={() => setStatusFilter('upcoming')}
        />
      )}

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
        {[
          {
            label: 'Total Tasks',
            value: metrics.total,
            icon: <Layers size={17} />,
            badge: 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/70 border-sky-200/80 dark:border-sky-800/60',
          },
          {
            label: 'Pending',
            value: metrics.incomplete,
            icon: <Clock size={17} />,
            badge: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border-amber-200/80 dark:border-amber-800/60',
          },
          {
            label: 'Completed',
            value: metrics.completed,
            icon: <CheckCircle2 size={17} />,
            badge: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200/80 dark:border-emerald-800/60',
          },
          {
            label: 'Overdue',
            value: metrics.overdue,
            icon: <AlertTriangle size={17} />,
            badge: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 border-rose-200/80 dark:border-rose-800/60',
          },
        ].map((m) => (
          <Card key={m.label} variant="default" className="p-3 sm:p-4 md:p-5 flex items-center gap-2.5 sm:gap-3.5 hover:shadow-md transition-shadow min-w-0">
            <div className={`p-2 sm:p-2.5 rounded-xl border flex-shrink-0 ${m.badge}`}>{m.icon}</div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{m.label}</p>
              <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">{m.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Left / Center Tasks Area */}
        <div className="flex-1 w-full min-w-0">
          {/* Create Task Accordion/Card */}
          <AnimatePresence>
            {isAddingTask && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mb-6 sm:mb-8"
              >
                <Card variant="glass" className="p-4 sm:p-8 border-2 border-sky-500/80 dark:border-sky-500/60">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                      Create New Task
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 font-semibold border border-sky-200/80 dark:border-sky-800/60">
                      New Task
                    </span>
                  </div>
                  <TaskForm
                    onSubmit={() => setIsAddingTask(false)}
                    onCancel={() => setIsAddingTask(false)}
                  />
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter and Search Bar */}
          <Card variant="default" className="p-3.5 sm:p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-0">
                <label htmlFor="task-search" className="sr-only">
                  Search tasks or notes
                </label>
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  id="task-search"
                  type="text"
                  placeholder="Search tasks or notes"
                  autoComplete="off"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all"
                />
              </div>

              {/* Status and Priority Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
                <fieldset className="p-1 m-0 min-w-0 flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200/60 dark:border-slate-700/60 overflow-x-auto no-scrollbar max-w-full">
                  <legend className="sr-only">Filter tasks by status</legend>
                  {(['all', 'today', 'upcoming', 'overdue', 'completed'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      aria-pressed={statusFilter === status}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                        statusFilter === status
                          ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {{ all: 'All', today: 'Due today', upcoming: 'Upcoming', overdue: 'Overdue', completed: 'Completed' }[status]}
                    </button>
                  ))}
                </fieldset>

                {/* Priority Selector */}
                <div className="w-full sm:w-auto">
                  <label htmlFor="priority-filter" className="sr-only">
                    Filter tasks by priority
                  </label>
                  <select
                    id="priority-filter"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
                    className="w-full sm:w-auto py-1.5 px-3 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 cursor-pointer"
                  >
                    <option value="all">All priorities</option>
                    <option value="high">High priority</option>
                    <option value="medium">Medium priority</option>
                    <option value="low">Low priority</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Loading your tasks...</p>
            </div>
          )}

          {/* Task Lists */}
          {!isLoading && (
            <>
              {statusFilter !== 'completed' && (
                <TaskList
                  title="Pending Tasks"
                  tasks={incompleteTasks}
                  emptyMessage="All clear! No pending tasks found."
                />
              )}

              {statusFilter !== 'upcoming' && statusFilter !== 'overdue' && (
                <TaskList
                  title="Completed Tasks"
                  tasks={completedTasks}
                  emptyMessage="No completed tasks yet. Keep up the momentum!"
                />
              )}
            </>
          )}
        </div>

        {/* Right Widgets Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 sm:gap-5 flex-shrink-0">
          <Card variant="glass" className="overflow-hidden p-0">
            <ClockWidget />
          </Card>

          <Card variant="glass" className="overflow-hidden p-0">
            <WeatherWidget />
          </Card>

          <Card variant="glass" className="overflow-hidden p-0">
            <SpotifyWidget />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
