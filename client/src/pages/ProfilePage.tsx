import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Mail,
  CheckCircle,
  Clock,
  Activity,
  AlertTriangle,
  Edit2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useAuthStore from '../store/useAuthStore';
import useTaskStore from '../store/useTaskStore';
import useToast from '../store/useToast';
import authService from '../services/authService';
import { formatDisplayDate, isTaskOverdue } from '../utils/date';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const { tasks } = useTaskStore();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  const stats = useMemo(() => {
    if (!user) {
      return {
        userTasks: [],
        completedTasks: [],
        completionRate: 0,
        overdueTasks: [],
        highPriorityTasks: [],
        mediumPriorityTasks: [],
        lowPriorityTasks: [],
      };
    }

    const userTasks = tasks.filter((task) => task.userId === user.id);
    const completedTasks = userTasks.filter((task) => task.completed);
    const completionRate =
      userTasks.length > 0
        ? Math.round((completedTasks.length / userTasks.length) * 100)
        : 0;

    const overdueTasks = userTasks.filter((task) =>
      isTaskOverdue(task.deadline, task.completed)
    );
    const highPriorityTasks = userTasks.filter((task) => task.priority === 'high');
    const mediumPriorityTasks = userTasks.filter((task) => task.priority === 'medium');
    const lowPriorityTasks = userTasks.filter((task) => task.priority === 'low');

    return {
      userTasks,
      completedTasks,
      completionRate,
      overdueTasks,
      highPriorityTasks,
      mediumPriorityTasks,
      lowPriorityTasks,
    };
  }, [tasks, user]);

  if (!user) return null;

  const {
    userTasks,
    completedTasks,
    completionRate,
    overdueTasks,
    highPriorityTasks,
    mediumPriorityTasks,
    lowPriorityTasks,
  } = stats;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Name cannot be empty.');
      return;
    }

    setIsLoading(true);
    setNameError('');
    try {
      await authService.updateProfile(name.trim());
      updateProfile({ name: name.trim() });
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      showToast('Profile saved locally.', 'info');
      updateProfile({ name: name.trim() });
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const joinDate = formatDisplayDate(user.createdAt, 'Recent Member');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left: User Profile Card */}
        <div className="w-full lg:w-1/3">
          <Card variant="glass" className="p-8 text-center shadow-xl">
            <div className="relative inline-block mx-auto mb-4">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-sky-400 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl text-3xl font-black">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit Profile"
                  className="absolute bottom-0 right-0 p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-md border border-slate-200 dark:border-slate-700 hover:text-sky-600 dark:hover:text-sky-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} noValidate className="space-y-4 text-left mt-4">
                <Input
                  label="Full name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  error={nameError}
                  icon={<UserIcon size={16} />}
                  fullWidth
                  autoComplete="name"
                  required
                />

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.name);
                      setNameError('');
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    size="sm"
                    fullWidth
                    isLoading={isLoading}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-2 mt-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {user.name}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
                  <Mail size={15} />
                  <span>{user.email}</span>
                </p>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-4 text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                  <Calendar size={13} />
                  <span>Joined on {joinDate}</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Academic Productivity Overview */}
        <div className="w-full lg:w-2/3 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 tracking-tight">
              <Sparkles size={20} className="text-sky-500" />
              <span>Study Stats</span>
            </h2>

            {/* Metric Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card variant="default" className="p-5 flex items-center gap-4 bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40">
                <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-md">
                  <CheckCircle size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Completed Tasks</p>
                  <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-0.5">{completedTasks.length}</p>
                </div>
              </Card>

              <Card variant="default" className="p-5 flex items-center gap-4 bg-sky-50/60 dark:bg-sky-950/20 border-sky-200/80 dark:border-sky-900/40">
                <div className="p-3 rounded-2xl bg-sky-500 text-white shadow-md">
                  <Activity size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider">Completion Rate</p>
                  <p className="text-2xl font-black text-sky-900 dark:text-sky-100 mt-0.5">{completionRate}%</p>
                </div>
              </Card>

              <Card variant="default" className="p-5 flex items-center gap-4 bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40">
                <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-md">
                  <Clock size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Pending Tasks</p>
                  <p className="text-2xl font-black text-amber-900 dark:text-amber-100 mt-0.5">{userTasks.length - completedTasks.length}</p>
                </div>
              </Card>

              <Card variant="default" className="p-5 flex items-center gap-4 bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/40">
                <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-md">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">Overdue Tasks</p>
                  <p className="text-2xl font-black text-rose-900 dark:text-rose-100 mt-0.5">{overdueTasks.length}</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Priority Breakdown Progress */}
          <Card variant="default" className="p-6 sm:p-7">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              Tasks by Priority
            </h3>

            <div className="space-y-4">
              {[
                {
                  label: 'High Priority',
                  count: highPriorityTasks.length,
                  bar: 'bg-rose-500',
                  text: 'text-rose-700 dark:text-rose-400',
                },
                {
                  label: 'Medium Priority',
                  count: mediumPriorityTasks.length,
                  bar: 'bg-amber-500',
                  text: 'text-amber-700 dark:text-amber-400',
                },
                {
                  label: 'Low Priority',
                  count: lowPriorityTasks.length,
                  bar: 'bg-emerald-500',
                  text: 'text-emerald-700 dark:text-emerald-400',
                },
              ].map((p) => {
                const percentage =
                  userTasks.length > 0 ? (p.count / userTasks.length) * 100 : 0;
                return (
                  <div key={p.label}>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className={p.text}>{p.label}</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {p.count} task{p.count !== 1 ? 's' : ''} ({Math.round(percentage)}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className={`h-full ${p.bar} rounded-full`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
