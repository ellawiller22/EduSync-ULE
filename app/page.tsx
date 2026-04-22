'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar as CalendarIcon,
  X,
  Plus,
  CreditCard,
  BookOpen,
  User,
  LogOut,
  Clock,
  Edit2,
  GraduationCap,
  FileText,
  Receipt,
  FileSpreadsheet,
  ArrowLeft,
  Wallet,
  CheckCircle,
  Mail,
  Lock,
  Link as LinkIcon,
  Video,
  ListOrdered,
  Image as ImageIcon,
  RefreshCw,
  Link2,
  Layers,
  ShieldCheck,
  Award,
  ExternalLink,
  Bot,
  Trash2,
  Search,
  DollarSign,
  AlertTriangle,
  CalendarCheck,
  FileSearch,
  MessageSquare,
  Settings,
  Activity,
  Check,
  UploadCloud,
  ArrowUpRight,
  Bell,
  Megaphone,
  Eye,
  Paperclip,
  Upload,
  ClipboardList,
  Printer,
  FileDown,
  TrendingUp,
} from 'lucide-react';

// --- THEME & STYLE CONFIGURATION ---
const THEMES = {
  white: {
    label: 'Plain White',
    main: 'bg-white',
    sidebar: 'bg-white',
    border: 'border-gray-200',
    thumb: 'bg-gray-200',
  },
  blue: {
    label: 'Light Blue',
    main: 'bg-blue-50/50',
    sidebar: 'bg-blue-50',
    border: 'border-blue-200',
    thumb: 'bg-blue-400',
  },
  green: {
    label: 'Soft Green',
    main: 'bg-emerald-50/50',
    sidebar: 'bg-emerald-50',
    border: 'border-emerald-200',
    thumb: 'bg-emerald-400',
  },
  purple: {
    label: 'Soft Purple',
    main: 'bg-purple-50/50',
    sidebar: 'bg-purple-50',
    border: 'border-purple-200',
    thumb: 'bg-purple-400',
  },
  yellow: {
    label: 'Soft Yellow',
    main: 'bg-amber-50/50',
    sidebar: 'bg-amber-50',
    border: 'border-amber-200',
    thumb: 'bg-amber-400',
  },
  pink: {
    label: 'Soft Pink',
    main: 'bg-pink-50/50',
    sidebar: 'bg-pink-50',
    border: 'border-pink-200',
    thumb: 'bg-pink-400',
  },
  red: {
    label: 'Soft Red',
    main: 'bg-red-50/50',
    sidebar: 'bg-red-50',
    border: 'border-red-200',
    thumb: 'bg-red-400',
  },
};

// --- UTILS & HELPERS ---
const DEFAULT_HOURLY_RATE = 4.0;
const REVENUE_RATE = 15.0;

// Default teacher pay rates by duration (in minutes)
const DEFAULT_DURATION_RATES: Record<number, number> = {
  25: 2.0,
  30: 2.5,
  45: 3.5,
  55: 4.0,
  60: 4.5,
  90: 6.5,
  120: 8.5,
};

const calculatePayment = (
  durStr: string,
  status: string,
  customRates?: Record<number, number>
) => {
  const mins = parseInt(durStr) || 60;
  const rates = customRates || DEFAULT_DURATION_RATES;
  const rate = rates[mins] || (mins / 60) * DEFAULT_HOURLY_RATE;
  return status === 'Class Done' ||
    status === 'Student Absent' ||
    status === 'Student Late'
    ? rate
    : 0;
};

const calculateRevenue = (durStr: string, status: string) => {
  const mins = parseInt(durStr) || 60;
  return status === 'Class Done' ||
    status === 'Student Absent' ||
    status === 'Student Late'
    ? (mins / 60) * REVENUE_RATE
    : 0;
};

// Helper to check if a class is completed or past
const isClassCompleted = (cls: any) => {
  if (
    cls.status === 'Class Done' ||
    cls.status === 'Student Absent' ||
    cls.status === 'Student Late'
  )
    return true;
  // Check if the class date/time has passed
  const classDateTime = new Date(`${cls.date}T${cls.time}`);
  const now = new Date();
  return classDateTime < now && cls.status !== 'Pending';
};

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${m}/${d}/${y}`;
};

const getGoogleCalendarUrl = (cls: any) => {
  try {
    const startDate = new Date(`${cls.date}T${cls.time}`);
    if (isNaN(startDate.getTime())) return '#';
    const endDate = new Date(
      startDate.getTime() + (parseInt(cls.duration) || 60) * 60000
    );
    const formatICSDate = (date: Date) =>
      date.toISOString().replace(/-|:|\.\d+/g, '');

    const eventDetails = `Join your class here: ${cls.meetingLink}\n\nAccess Google Drive materials via your portal.`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      cls.material + ' - EduSync'
    )}&dates=${formatICSDate(startDate)}/${formatICSDate(
      endDate
    )}&details=${encodeURIComponent(
      eventDetails
    )}&location=${encodeURIComponent(cls.meetingLink)}`;
  } catch (e) {
    return '#';
  }
};

// Days array for enrollment form
const daysArr = [
  { val: 0, label: 'S' },
  { val: 1, label: 'M' },
  { val: 2, label: 'T' },
  { val: 3, label: 'W' },
  { val: 4, label: 'T' },
  { val: 5, label: 'F' },
  { val: 6, label: 'S' },
];

// --- COMMON UI COMPONENTS ---

const Toast = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-bottom-10">
      <div className="bg-gray-900 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/10">
        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
          <Check size={14} className="text-white" />
        </div>
        <span className="text-sm font-black uppercase tracking-widest">
          {message}
        </span>
      </div>
    </div>
  );
};

const OrgLogo = ({
  src,
  alt,
  size = 'md',
  className = '',
}: {
  src?: string;
  alt?: string;
  size?: string;
  className?: string;
}) => {
  const sizeClasses: Record<string, string> = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    xxl: 'w-32 h-32',
    huge: 'w-40 h-40',
  };
  return (
    <div
      className={`${sizeClasses[size]} shrink-0 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 ${className}`}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <ImageIcon className="text-gray-400" size={size === 'huge' ? 48 : 20} />
      )}
    </div>
  );
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-xl',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-[48px] shadow-2xl w-full ${maxWidth} overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]`}
      >
        <div className="px-10 py-8 border-b flex justify-between items-center bg-gray-50/50 shrink-0">
          <h3 className="font-black text-gray-900 tracking-tight text-xl">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={32} />
          </button>
        </div>
        <div className="overflow-y-auto p-10">{children}</div>
      </div>
    </div>
  );
};

const CalendarSyncModal = ({
  isOpen,
  onClose,
  classes,
  notify,
  userEmail,
}: {
  isOpen: boolean;
  onClose: () => void;
  classes: any[];
  notify: (msg: string) => void;
  userEmail?: string;
}) => {
  const [email, setEmail] = useState(userEmail || '');

  const handleEmailSync = (e: React.FormEvent) => {
    e.preventDefault();
    notify(`Schedule & Drive links pushed to ${email}`);
    onClose();
  };

  const handleICSDownload = () => {
    let icsContent =
      'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//EduSync//SaaS//EN\n';
    classes.forEach((cls) => {
      if (cls.status !== 'Pending') return;
      try {
        const startDate = new Date(`${cls.date}T${cls.time}`);
        if (isNaN(startDate.getTime())) return;
        const endDate = new Date(
          startDate.getTime() + (parseInt(cls.duration) || 60) * 60000
        );
        const formatICSDate = (date: Date) =>
          date.toISOString().replace(/-|:|\.\d+/g, '');
        icsContent += 'BEGIN:VEVENT\n';
        icsContent += `DTSTART:${formatICSDate(startDate)}\n`;
        icsContent += `DTEND:${formatICSDate(endDate)}\n`;
        icsContent += `SUMMARY:${cls.material} - EduSync\n`;
        icsContent += `DESCRIPTION:Meeting Link: ${cls.meetingLink}\\nAccess your Google Drive materials via your portal.\\nNotes: Please review materials before class.\n`;
        icsContent += `LOCATION:${cls.meetingLink}\n`;
        icsContent += 'END:VEVENT\n';
      } catch (err) {
        console.error(err);
      }
    });
    icsContent += 'END:VCALENDAR';
    const blob = new Blob([icsContent], {
      type: 'text/calendar;charset=utf-8',
    });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'EduSync_Schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Calendar File (.ics) Downloaded');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sync Schedule & Reminders">
      <div className="space-y-8">
        <div className="bg-blue-50 border-2 border-blue-100 p-8 rounded-[32px] text-center">
          <Mail className="text-blue-500 mx-auto mb-4" size={32} />
          <h4 className="font-black text-gray-900 mb-2">
            Send via Email (Gmail / Outlook)
          </h4>
          <p className="text-sm text-gray-500 font-medium mb-6">
            {
              "We'll email you a calendar invite containing all your upcoming sessions and Google Drive material links for automated reminders."
            }
          </p>
          <form onSubmit={handleEmailSync} className="flex gap-4">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@gmail.com"
              className="flex-1 p-5 rounded-2xl border-2 border-white outline-none focus:border-blue-300 font-bold bg-white"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >
              Send Invites
            </button>
          </form>
        </div>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink-0 mx-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            OR DIRECT EXPORT
          </span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={handleICSDownload}
            className="p-6 border-2 border-gray-200 rounded-[32px] flex flex-col items-center gap-3 hover:border-gray-300 transition-all hover:bg-gray-50 group"
          >
            <CalendarIcon
              size={28}
              className="text-gray-400 group-hover:text-gray-900 transition-colors"
            />
            <span className="font-black text-xs uppercase tracking-widest text-gray-600 group-hover:text-gray-900">
              Download .ICS
            </span>
            <span className="text-[10px] text-gray-500 font-medium text-center">
              For Apple Calendar & Desktop Outlook Clients
            </span>
          </button>
          <button
            onClick={() => {
              notify('Google Calendar Sync Initialized.');
              handleICSDownload();
            }}
            className="p-6 border-2 border-gray-200 rounded-[32px] flex flex-col items-center gap-3 hover:border-blue-100 transition-all hover:bg-blue-50 group"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">
              G
            </div>
            <span className="font-black text-xs uppercase tracking-widest text-blue-600 group-hover:text-blue-700">
              Google Workspace
            </span>
            <span className="text-[10px] text-blue-500 font-medium text-center">
              Export to your personal Google Calendar
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

const BillingModal = ({
  student,
  onClose,
  onUpdateCredits,
}: {
  student: any;
  onClose: () => void;
  onUpdateCredits: (id: string, amt: number) => void;
}) => {
  const [amt, setAmt] = useState(10);
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Credit Recharge: ${student.name}`}
    >
      <div className="space-y-8 text-center">
        <div className="p-10 bg-blue-50 rounded-[40px] border border-blue-100">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 block">
            Current Balance
          </span>
          <span className="text-7xl font-black text-blue-600">
            {student.credits}
          </span>
        </div>
        <div className="space-y-2 text-left">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
            Recharge Amount
          </label>
          <input
            type="number"
            value={amt}
            onChange={(e) => setAmt(parseInt(e.target.value))}
            className="w-full p-6 border-2 border-gray-100 rounded-3xl outline-none focus:border-[var(--primary)] text-center font-black text-2xl bg-gray-50/50"
          />
        </div>
        <button
          onClick={() => onUpdateCredits(student.id, amt)}
          className="w-full bg-[var(--primary)] text-white py-6 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
        >
          Save Changes & Top-up
        </button>
      </div>
    </Modal>
  );
};

const AnnouncementBanner = ({ announcements }: { announcements: any[] }) => {
  if (!announcements || announcements.length === 0) return null;
  return (
    <div className="mb-10 space-y-6 animate-in slide-in-from-top-4">
      {announcements.map((a) => (
        <div
          key={a.id}
          className="bg-white border-2 border-[var(--primary)]/20 p-8 rounded-[48px] flex flex-col gap-4 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-3 h-full bg-[var(--primary)]"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl flex items-center justify-center shrink-0">
              <Megaphone size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                {formatDisplayDate(a.datePosted)} • Official Announcement
              </p>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                {a.title}
              </h3>
            </div>
          </div>
          <p className="text-gray-600 font-medium leading-relaxed mt-2 pl-16 whitespace-pre-wrap">
            {a.content}
          </p>
          {a.type === 'image' && a.mediaUrl && (
            <div className="pl-16 mt-2">
              <img
                src={a.mediaUrl}
                alt="Announcement Media"
                className="rounded-[32px] max-w-xl w-full object-cover border-2 border-gray-100 shadow-sm"
              />
            </div>
          )}
          {a.type === 'video' && a.mediaUrl && (
            <div className="pl-16 mt-2">
              <video
                controls
                className="rounded-[32px] max-w-xl w-full border-2 border-gray-100 shadow-sm bg-black"
              >
                <source src={a.mediaUrl} />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// --- AUTH: LOGIN SCREEN ---

const LoginScreen = ({
  onLogin,
  onRegister,
  clients,
  globalBranding,
}: {
  onLogin: (
    user: string,
    pass: string,
    setError: (err: string) => void
  ) => void;
  onRegister: (user: any) => void;
  clients: any[];
  globalBranding: any;
}) => {
  const [selectedTenant, setSelectedTenant] = useState('global');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Register State
  const [regRole, setRegRole] = useState('Student');
  const [regData, setRegData] = useState<any>({});
  const [regFiles, setRegFiles] = useState<any>({});

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password, setError);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setRegFiles((prev: any) => ({ ...prev, [field]: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTenant === 'global') {
      setError(
        'Please select a specific school portal from the top right to register.'
      );
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      clientId: selectedTenant,
      name: regData.name,
      role: regRole,
      email: regData.email,
      phone: regData.phone,
      username: regData.username?.toLowerCase().trim(),
      password: regData.password,
      lastLogin: 'Never',
      credits: 0,
      profilePic: regFiles.profilePic || '',
      paymentProof: regRole === 'Student' ? regFiles.paymentProof || '' : '',
      cvUrl: regRole === 'Teacher' ? regFiles.cvUrl || '' : '',
      certificateUrl:
        regRole === 'Teacher' ? regFiles.certificateUrl || '' : '',
      skills: regRole === 'Teacher' ? regData.skills || '' : '',
    };

    onRegister(newUser);
    setMode('login');
    setRegData({});
    setRegFiles({});
  };

  const activeConfig =
    selectedTenant === 'global'
      ? {
          name: globalBranding?.platformName || 'EduSync SaaS',
          tagline: globalBranding?.tagline || 'Unified Learning Ecosystem',
          logoUrl: globalBranding?.logoUrl,
          color: '#0ea5e9',
        }
      : {
          name: clients.find((c) => c.id === selectedTenant)?.schoolName,
          tagline: 'Student & Faculty Portal',
          logoUrl: clients.find((c) => c.id === selectedTenant)?.logoUrl,
          color:
            clients.find((c) => c.id === selectedTenant)?.primaryColor ||
            '#0ea5e9',
        };

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 transition-colors duration-500 py-20"
      style={{ '--primary': activeConfig.color } as React.CSSProperties}
    >
      <div className="fixed top-8 right-8 z-50">
        <select
          value={selectedTenant}
          onChange={(e) => {
            setSelectedTenant(e.target.value);
            setError('');
          }}
          className="bg-white border-2 border-gray-200 text-gray-700 text-[10px] font-black uppercase tracking-widest rounded-2xl px-5 py-4 outline-none focus:border-[var(--primary)] shadow-sm cursor-pointer transition-colors hover:bg-gray-50"
        >
          <option value="global">Super Admin Hub</option>
          <optgroup label="School Portals">
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.schoolName}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      <div
        className={`bg-white p-12 rounded-[56px] shadow-2xl shadow-gray-200/50 w-full ${
          mode === 'register' ? 'max-w-2xl' : 'max-w-md'
        } border border-gray-100 relative overflow-hidden transition-all duration-500`}
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-[var(--primary)] transition-colors duration-500"></div>
        <div className="flex flex-col items-center justify-center gap-4 mb-10 text-center mt-4">
          {activeConfig.logoUrl ? (
            <img
              src={activeConfig.logoUrl}
              alt="Platform Logo"
              className="w-20 h-20 rounded-[28px] object-cover shadow-xl border border-gray-100 transition-all duration-500"
            />
          ) : (
            <div className="w-20 h-20 bg-[var(--primary)] rounded-[28px] flex items-center justify-center shadow-xl transition-colors duration-500">
              <span className="text-white font-black text-4xl">
                {activeConfig.name ? activeConfig.name.charAt(0) : 'E'}
              </span>
            </div>
          )}
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter mt-4 transition-all">
            {activeConfig.name}
          </h1>
          <p className="text-sm text-gray-400 font-medium transition-all">
            {mode === 'login'
              ? activeConfig.tagline
              : 'Account Registration Form'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-red-100 mb-6 animate-in fade-in">
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <form
            onSubmit={handleLoginSubmit}
            className="space-y-6 animate-in fade-in"
          >
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Account Username
              </label>
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-3xl p-5 outline-none focus:border-[var(--primary)] transition-colors bg-gray-50 text-gray-900 font-bold"
                placeholder="e.g. sarah"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Access Password
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-3xl p-5 outline-none focus:border-[var(--primary)] transition-colors bg-gray-50 text-gray-900 font-bold"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[var(--primary)] text-white font-black py-6 rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Authenticate & Enter
            </button>
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest hover:underline"
              >
                Create a New Account
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleRegisterSubmit}
            className="space-y-6 animate-in fade-in"
          >
            <div className="flex gap-4 mb-8 bg-gray-50 p-2 rounded-3xl border-2 border-gray-100">
              <button
                type="button"
                onClick={() => setRegRole('Student')}
                className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  regRole === 'Student'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                I am a Student
              </button>
              <button
                type="button"
                onClick={() => setRegRole('Teacher')}
                className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  regRole === 'Teacher'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                I am a Teacher
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                  Full Name
                </label>
                <input
                  required
                  onChange={(e) =>
                    setRegData({ ...regData, name: e.target.value })
                  }
                  className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-bold text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  onChange={(e) =>
                    setRegData({ ...regData, email: e.target.value })
                  }
                  className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-bold text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                  Phone Number
                </label>
                <input
                  required
                  type="tel"
                  onChange={(e) =>
                    setRegData({ ...regData, phone: e.target.value })
                  }
                  className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-bold text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                  Desired Username
                </label>
                <input
                  required
                  onChange={(e) =>
                    setRegData({ ...regData, username: e.target.value })
                  }
                  className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-bold text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                  Password
                </label>
                <input
                  required
                  type="password"
                  onChange={(e) =>
                    setRegData({ ...regData, password: e.target.value })
                  }
                  className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-bold text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                  Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'profilePic')}
                  className="w-full p-4 border-2 border-dashed border-gray-200 bg-gray-50 rounded-3xl text-xs font-bold text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-gray-200 file:text-gray-700"
                />
              </div>
            </div>

            {regRole === 'Student' && (
              <div className="space-y-2 mt-4 p-6 bg-blue-50 border-2 border-blue-100 rounded-3xl">
                <label className="text-[10px] font-black uppercase text-blue-800 ml-2 tracking-widest">
                  Upload Proof of Payment / Receipt
                </label>
                <p className="text-xs text-blue-600 font-medium ml-2 mb-3">
                  Please upload an image or screenshot of your transaction.
                </p>
                <input
                  required
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'paymentProof')}
                  className="w-full p-4 border-2 border-blue-200 bg-white rounded-2xl text-xs font-bold text-blue-800 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-600 file:text-white"
                />
              </div>
            )}

            {regRole === 'Teacher' && (
              <div className="space-y-6 mt-4 p-8 bg-indigo-50 border-2 border-indigo-100 rounded-[32px]">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-indigo-800 ml-2 tracking-widest">
                    Your Expertise & Skills
                  </label>
                  <input
                    required
                    placeholder="e.g. Advanced Calculus, SAT Prep, Spanish"
                    onChange={(e) =>
                      setRegData({ ...regData, skills: e.target.value })
                    }
                    className="w-full p-5 border-2 border-indigo-200 bg-white rounded-3xl outline-none focus:border-indigo-400 font-bold text-indigo-900"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-indigo-800 ml-2 tracking-widest">
                      Upload CV / Resume
                    </label>
                    <input
                      required
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, 'cvUrl')}
                      className="w-full p-4 border-2 border-indigo-200 bg-white rounded-2xl text-[10px] font-bold text-indigo-800 file:mr-2 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-indigo-600 file:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-indigo-800 ml-2 tracking-widest">
                      Teaching Certificate
                    </label>
                    <input
                      required
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'certificateUrl')}
                      className="w-full p-4 border-2 border-indigo-200 bg-white rounded-2xl text-[10px] font-bold text-indigo-800 file:mr-2 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-indigo-600 file:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-1/3 bg-gray-100 text-gray-500 font-black py-6 rounded-3xl hover:bg-gray-200 transition-all text-sm uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-2/3 bg-[var(--primary)] text-white font-black py-6 rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest"
              >
                Submit Registration
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// --- PORTAL: TEACHER HUB ---

const TeacherView = ({
  teacher,
  classes,
  setClasses,
  users,
  setUsers,
  notify,
  announcements,
}: any) => {
  const [managingClass, setManagingClass] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('schedule');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const teacherClasses = classes
    .filter((c: any) => c.teacherId === teacher.id)
    .sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  const handleEnterClass = (cls: any) => {
    if (!cls.teacherJoinedAt && cls.status === 'Pending') {
      setClasses((prev: any[]) =>
        prev.map((c) =>
          c.id === cls.id
            ? {
                ...c,
                teacherJoinedAt: new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              }
            : c
        )
      );
    }
    window.open(cls.meetingLink, '_blank');
  };

  const handleSaveDetail = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const newStatus = fd.get('status') as string;

    let updateData: any = {
      status: newStatus,
      feedback: fd.get('feedback'),
      homework: fd.get('homework'),
      internalNotes: fd.get('internalNotes'),
      meetingLink: fd.get('meetingLink') || managingClass.meetingLink,
    };

    if (newStatus === 'Class Done' && managingClass.status !== 'Class Done') {
      setUsers((prev: any[]) =>
        prev.map((u) =>
          u.id === managingClass.studentId
            ? { ...u, credits: Math.max(0, (u.credits || 0) - 1) }
            : u
        )
      );
      updateData.endedAt = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    setClasses((prev: any[]) =>
      prev.map((c) => (c.id === managingClass.id ? { ...c, ...updateData } : c))
    );
    setManagingClass(null);
    notify('Session Details & Timestamps Saved');
  };

  const PayrollTab = () => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const [selMonth, setSelMonth] = useState(new Date().getMonth());
    const monthlyClasses = teacherClasses.filter((c: any) => {
      if (
        c.status !== 'Class Done' &&
        c.status !== 'Student Absent' &&
        c.status !== 'Student Late'
      )
        return false;
      return new Date(c.date).getMonth() === selMonth;
    });
    const total = monthlyClasses.reduce(
      (acc: number, c: any) => acc + calculatePayment(c.duration, c.status),
      0
    );
    const hours = monthlyClasses.reduce(
      (acc: number, c: any) => acc + (parseInt(c.duration) || 60) / 60,
      0
    );

    return (
      <div className="space-y-8 animate-in fade-in">
        <div className="flex justify-between items-center bg-white p-8 rounded-[40px] border border-gray-200 shadow-sm">
          <div>
            <h3 className="text-2xl font-black text-gray-900">
              Payroll Statement
            </h3>
            <p className="text-gray-400 font-medium italic">
              Monthly earnings breakdown
            </p>
          </div>
          <select
            value={selMonth}
            onChange={(e) => setSelMonth(parseInt(e.target.value))}
            className="p-4 border-2 border-gray-200 rounded-2xl font-black uppercase text-xs outline-none focus:border-[var(--primary)]"
          >
            {months.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-[48px] overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">
              <tr>
                <th className="px-10 py-6">Session Date</th>
                <th className="px-10 py-6">Student</th>
                <th className="px-10 py-6 text-center">Hours</th>
                <th className="px-10 py-6 text-right">Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {monthlyClasses.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50/50 group">
                  <td className="px-10 py-6 font-black text-gray-900">
                    {formatDisplayDate(c.date)}{' '}
                    <span className="text-[10px] text-gray-400 ml-2">
                      {c.time}
                    </span>
                  </td>
                  <td className="px-10 py-6 font-bold text-gray-600">
                    {c.student}
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className="bg-gray-100 px-3 py-1 rounded-xl font-black text-[10px] text-gray-600">
                      {((parseInt(c.duration) || 60) / 60).toFixed(2)} Hrs
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right font-black text-emerald-600">
                    ${calculatePayment(c.duration, c.status).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="p-10 bg-gray-50 rounded-[48px] border-2 border-gray-200 text-center">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
              Total Monthly Hours
            </p>
            <p className="text-4xl font-black text-gray-900">
              {hours.toFixed(2)}
            </p>
          </div>
          <div className="p-10 bg-emerald-50 rounded-[48px] border-2 border-emerald-100 text-center">
            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-2">
              Total Net Salary
            </p>
            <p className="text-4xl font-black text-emerald-600">
              ${total.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-gray-900">
            Faculty Hub
          </h2>
          <p className="text-gray-500 font-medium">
            Teacher Portal: {teacher.name}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() =>
              setActiveTab(activeTab === 'schedule' ? 'payroll' : 'schedule')
            }
            className="bg-white border-2 border-gray-200 text-gray-900 px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-sm"
          >
            {activeTab === 'schedule' ? 'Review Payslip' : 'Class Schedule'}
          </button>
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="bg-white border-2 text-blue-600 border-blue-200 hover:bg-blue-50 px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
          >
            <CalendarIcon size={16} /> Sync
          </button>
        </div>
      </div>

      <AnnouncementBanner announcements={announcements} />

      {activeTab === 'payroll' ? (
        <PayrollTab />
      ) : (
        <div className="grid gap-6">
          {teacherClasses.map((cls: any) => {
            const isCompleted =
              cls.status === 'Class Done' ||
              cls.status === 'Student Absent' ||
              cls.status === 'Student Late';
            return (
              <div
                key={cls.id}
                className={`p-10 rounded-[48px] border-2 shadow-sm flex justify-between items-center group transition-all ${
                  isCompleted
                    ? 'bg-gray-100 border-gray-300 opacity-75'
                    : 'bg-white border-gray-200 hover:border-[var(--primary)]/50 hover:shadow-xl hover:shadow-gray-200/50'
                }`}
              >
                <div
                  className="flex items-center gap-8 cursor-pointer"
                  onClick={() => setManagingClass(cls)}
                >
                  <div
                    className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner transition-all ${
                      isCompleted
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-gray-50 text-gray-400 group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)]'
                    }`}
                  >
                    <Video size={36} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-widest ${
                          isCompleted
                            ? 'bg-gray-200 text-gray-500'
                            : 'bg-[var(--primary)]/10 text-[var(--primary)]'
                        }`}
                      >
                        {formatDisplayDate(cls.date)} @ {cls.time}
                      </span>
                      {isCompleted && (
                        <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-widest">
                          Completed
                        </span>
                      )}
                    </div>
                    <h4
                      className={`text-2xl font-black ${
                        isCompleted ? 'text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {cls.material}
                    </h4>
                    <p
                      className={`text-sm font-medium italic mt-1 ${
                        isCompleted ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Student Account:{' '}
                      <span
                        className={`font-black not-italic uppercase tracking-widest text-xs ${
                          isCompleted ? 'text-gray-500' : 'text-gray-700'
                        }`}
                      >
                        {cls.student}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  {cls.materialLink && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(cls.materialLink, '_blank');
                      }}
                      className="p-4 bg-gray-50 text-gray-500 rounded-2xl hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                      title="View Lesson Materials"
                    >
                      <BookOpen size={24} />
                    </button>
                  )}
                  <a
                    href={getGoogleCalendarUrl(cls)}
                    target="_blank"
                    rel="noreferrer"
                    title="Add to Google Calendar"
                    className="p-4 bg-gray-50 text-gray-500 rounded-2xl hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                  >
                    <CalendarIcon size={24} />
                  </a>
                  <button
                    onClick={() => setManagingClass(cls)}
                    className="p-4 bg-gray-50 text-gray-500 rounded-2xl hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all shadow-sm"
                    title="Manage Session"
                  >
                    <FileSearch size={24} />
                  </button>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleEnterClass(cls)}
                      className="bg-gray-900 text-white px-10 py-4 rounded-[22px] font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
                    >
                      Enter Classroom
                    </button>
                    {cls.teacherJoinedAt && cls.status === 'Pending' && (
                      <span className="text-[9px] font-black text-emerald-600 text-center uppercase">
                        You joined: {cls.teacherJoinedAt}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {teacherClasses.length === 0 && (
            <div className="py-40 text-center text-gray-400 font-black italic uppercase text-xl">
              No Assigned Classes from Admin
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={!!managingClass}
        onClose={() => setManagingClass(null)}
        title={`Session Triage: ${managingClass?.student}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveDetail} className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                Update Status
              </label>
              <select
                name="status"
                defaultValue={managingClass?.status}
                className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-black uppercase text-xs text-gray-900"
              >
                <option value="Pending">Live / Upcoming</option>
                <option value="Class Done">Completed (Stamp End Time)</option>
                <option value="Student Late">Late Arrival</option>
                <option value="Student Absent">No-Show</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                Locked Schedule
              </label>
              <div className="p-5 bg-gray-50 border-2 border-gray-100 rounded-3xl text-xs font-black uppercase tracking-widest text-gray-600">
                {managingClass?.date} @ {managingClass?.time}
              </div>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                One-Time Meeting Link (Override)
              </label>
              <input
                name="meetingLink"
                defaultValue={managingClass?.meetingLink}
                className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-medium text-gray-900"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
              Homework Assignment
            </label>
            <textarea
              name="homework"
              defaultValue={managingClass?.homework}
              className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-medium text-gray-900"
              rows={2}
              placeholder="Tasks for next session..."
            ></textarea>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
              Public Session Feedback
            </label>
            <textarea
              name="feedback"
              defaultValue={managingClass?.feedback}
              className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-medium text-gray-900"
              rows={3}
              placeholder="How did the student do?"
            ></textarea>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
              Internal Admin Notes (Private)
            </label>
            <textarea
              name="internalNotes"
              defaultValue={managingClass?.internalNotes}
              className="w-full p-5 border-2 border-gray-100 rounded-3xl outline-none focus:border-[var(--primary)] font-medium text-gray-900"
              rows={2}
              placeholder="Private internal observation..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-[var(--primary)] text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
          >
            Save Changes & Stamp Records
          </button>
        </form>
      </Modal>

      <CalendarSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        classes={teacherClasses}
        notify={notify}
        userEmail={teacher.email}
      />
    </div>
  );
};

// --- PORTAL: STUDENT HUB ---

const StudentView = ({
  student,
  classes,
  tenant,
  setClasses,
  notify,
  announcements,
}: any) => {
  const studentClasses = classes
    .filter((c: any) => c.studentId === student.id)
    .sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  const isLowCredits = (student.credits || 0) <= 3;
  const [activeTab, setActiveTab] = useState('lessons');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const handleEnterClass = (cls: any) => {
    if (!cls.studentJoinedAt && cls.status === 'Pending') {
      setClasses((prev: any[]) =>
        prev.map((c) =>
          c.id === cls.id
            ? {
                ...c,
                studentJoinedAt: new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              }
            : c
        )
      );
    }
    window.open(cls.meetingLink, '_blank');
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-gray-900">
            My Progress Path
          </h2>
          <p className="text-gray-500 font-medium tracking-wide">
            Student Hub @ {tenant.schoolName}
          </p>
        </div>
        <button
          onClick={() => setIsSyncModalOpen(true)}
          className="flex items-center gap-3 bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
        >
          <CalendarCheck size={18} /> Sync to My Calendar
        </button>
      </div>

      <AnnouncementBanner announcements={announcements} />

      <div
        className={`p-12 rounded-[56px] border-2 mb-10 flex items-center justify-between transition-all ${
          isLowCredits
            ? 'bg-red-50 border-red-200 shadow-2xl shadow-red-500/5'
            : 'bg-[var(--primary)] text-white shadow-2xl border-[var(--primary)]'
        }`}
      >
        <div className="flex items-center gap-8">
          <div
            className={`w-24 h-24 rounded-[32px] flex items-center justify-center ${
              isLowCredits
                ? 'bg-red-500 text-white shadow-2xl'
                : 'bg-white text-[var(--primary)]'
            }`}
          >
            <Wallet size={48} />
          </div>
          <div>
            <p
              className={`text-[10px] font-black uppercase tracking-widest opacity-80 mb-1`}
            >
              Active Balance Status
            </p>
            <h3 className="text-5xl font-black tracking-tighter">
              {student.credits} Sessions Remaining
            </h3>
            {isLowCredits && (
              <p className="text-sm font-black text-red-600 mt-2 uppercase tracking-tight">
                Parent Alert: Enrollment renewal due immediately.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-10 border-b border-gray-200 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
            activeTab === 'lessons'
              ? 'bg-gray-900 text-white shadow-lg'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          My Lessons
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
            activeTab === 'assignments'
              ? 'bg-gray-900 text-white shadow-lg'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Assignment Hub
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
            activeTab === 'catalog'
              ? 'bg-[var(--primary)] text-white shadow-lg'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Course Catalog (View Only)
        </button>
      </div>

      {activeTab === 'lessons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {studentClasses.map((cls: any) => {
            const isCompleted =
              cls.status === 'Class Done' ||
              cls.status === 'Student Absent' ||
              cls.status === 'Student Late';
            return (
              <div
                key={cls.id}
                className={`p-12 rounded-[56px] border-2 shadow-sm flex flex-col gap-8 group transition-all relative overflow-hidden ${
                  isCompleted
                    ? 'bg-gray-100 border-gray-300 opacity-80'
                    : 'bg-white border-gray-200 hover:border-[var(--primary)]/50 hover:shadow-xl'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          isCompleted
                            ? 'text-gray-400'
                            : 'text-[var(--primary)]'
                        }`}
                      >
                        Instruction Progress
                      </span>
                      {isCompleted && (
                        <span className="bg-emerald-100 text-emerald-600 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">
                          Done
                        </span>
                      )}
                    </div>
                    <h4
                      className={`text-3xl font-black tracking-tight ${
                        isCompleted ? 'text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {cls.material}
                    </h4>
                  </div>
                  <div className="text-right font-black">
                    <p
                      className={`text-xs uppercase tracking-widest mb-1 ${
                        isCompleted ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {formatDisplayDate(cls.date)}
                    </p>
                    <p
                      className={`text-2xl tracking-tighter ${
                        isCompleted ? 'text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {cls.time}
                    </p>
                  </div>
                </div>
                {cls.feedback && (
                  <div className="p-6 bg-amber-50 rounded-[28px] border border-amber-200 text-xs text-amber-900 italic font-medium leading-relaxed shadow-inner">
                    {'" '}
                    {cls.feedback}
                    {' "'}
                  </div>
                )}
                {cls.homework && (
                  <div className="p-6 bg-blue-50 rounded-[28px] border border-blue-200">
                    <p className="text-[9px] font-black uppercase text-blue-500 mb-2 tracking-widest">
                      {"Teacher's Note: Homework"}
                    </p>
                    <p className="text-sm font-bold text-blue-900 leading-relaxed">
                      {cls.homework}
                    </p>
                  </div>
                )}
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => handleEnterClass(cls)}
                    className="flex-1 bg-[var(--primary)] text-white py-6 rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all active:scale-95"
                  >
                    Enter Live Classroom
                  </button>

                  <a
                    href={getGoogleCalendarUrl(cls)}
                    target="_blank"
                    rel="noreferrer"
                    title="Add to Google Calendar"
                    className="w-16 h-16 bg-white border-2 border-gray-200 text-gray-500 rounded-3xl flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                  >
                    <CalendarIcon size={24} />
                  </a>

                  {cls.materialLink && (
                    <button
                      onClick={() => window.open(cls.materialLink, '_blank')}
                      className="w-16 h-16 bg-gray-50 text-gray-500 rounded-3xl flex items-center justify-center hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-all shadow-sm border border-gray-200"
                    >
                      <LinkIcon size={28} />
                    </button>
                  )}
                </div>
                {cls.studentJoinedAt && cls.status === 'Pending' && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-bl-2xl shadow-md">
                    You joined: {cls.studentJoinedAt}
                  </div>
                )}
              </div>
            );
          })}
          {studentClasses.length === 0 && (
            <div className="col-span-2 py-40 text-center text-gray-400 font-black italic text-xl uppercase tracking-widest">
              No Active Enrollments
            </div>
          )}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="bg-white p-16 rounded-[64px] border-2 border-gray-200 shadow-sm text-center animate-in zoom-in-95">
          <div className="w-24 h-24 bg-[var(--primary)]/5 rounded-full flex items-center justify-center mx-auto mb-8 text-[var(--primary)]">
            <UploadCloud size={48} />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">
            Assignment Submission Portal
          </h3>
          <p className="text-gray-500 font-medium max-w-md mx-auto mb-10">
            Upload your completed projects or paste your Google Drive/GitHub
            link below for instructor review.
          </p>
          <div className="max-w-xl mx-auto space-y-4">
            <input
              className="w-full p-6 border-2 border-gray-200 rounded-3xl outline-none focus:border-[var(--primary)] font-black text-sm uppercase tracking-widest bg-gray-50 text-gray-900"
              placeholder="Paste link here..."
            />
            <button
              onClick={() => notify('Assignment Uploaded')}
              className="w-full bg-[var(--primary)] text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              Submit Final Work
            </button>
          </div>
        </div>
      )}

      {activeTab === 'catalog' && (
        <div className="bg-white p-16 rounded-[64px] border-2 border-gray-200 shadow-sm text-center animate-in zoom-in-95">
          <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <BookOpen size={48} />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">
            School Course Catalog
          </h3>
          <p className="text-gray-500 font-medium max-w-md mx-auto mb-10">
            To request enrollment or purchase credits for a new course, please
            contact your school administrator.
          </p>
        </div>
      )}

      <CalendarSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        classes={studentClasses}
        notify={notify}
        userEmail={student.email}
      />
    </div>
  );
};

// --- PORTAL: ADMIN NERVE CENTER ---

const AdminView = ({
  tenant,
  users,
  setUsers,
  courses,
  setCourses,
  classes,
  setClasses,
  announcements,
  setAnnouncements,
  onLoginAsTeacher,
  notify,
}: any) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userProfilePicPreview, setUserProfilePicPreview] = useState<
    string | null
  >(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [selectedStudentForBill, setSelectedStudentForBill] =
    useState<any>(null);

  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  const [courseImagePreview, setCourseImagePreview] = useState<string | null>(
    null
  );

  // Teacher Detail View State
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  // Pagination State
  const [teacherPage, setTeacherPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredUsers = users.filter(
    (u: any) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.skills && u.skills.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const lowCreditStudents = users.filter(
    (u: any) => u.role === 'Student' && (u.credits || 0) <= 3
  );
  const tenantClasses = classes
    .filter((c: any) => c.clientId === tenant.id)
    .sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  const tenantCourses = courses.filter((c: any) => c.clientId === tenant.id);
  const tenantAnnouncements = announcements
    .filter((a: any) => a.clientId === tenant.id)
    .sort(
      (a: any, b: any) =>
        new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
    );
  const teachers = users.filter((u: any) => u.role === 'Teacher');
  const students = users.filter((u: any) => u.role === 'Student');

  // Financial Overview
  const currentMonth = new Date().getMonth();
  const currentMonthClasses = tenantClasses.filter(
    (c: any) =>
      new Date(c.date).getMonth() === currentMonth &&
      (c.status === 'Class Done' ||
        c.status === 'Student Absent' ||
        c.status === 'Student Late')
  );
  const totalPayroll = currentMonthClasses.reduce(
    (acc: number, c: any) => acc + calculatePayment(c.duration, c.status),
    0
  );
  const totalRevenue = currentMonthClasses.reduce(
    (acc: number, c: any) => acc + calculateRevenue(c.duration, c.status),
    0
  );
  const totalProfit = totalRevenue - totalPayroll;

  const handleUserPicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setUserProfilePicPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const uData = {
      id: editingUser ? editingUser.id : Date.now().toString(),
      name: fd.get('name'),
      role: fd.get('role'),
      email: fd.get('email') || '',
      phone: fd.get('phone') || '',
      username: ((fd.get('username') as string) || '').toLowerCase().trim(),
      password: fd.get('password'),
      lastLogin: editingUser ? editingUser.lastLogin : 'Never',
      clientId: tenant.id,
      credits: parseInt(fd.get('credits') as string) || 0,
      meetingLink: fd.get('meetingLink') || '',
      skills: fd.get('skills') || '',
      profilePic: userProfilePicPreview || editingUser?.profilePic || '',
      paymentProof: editingUser?.paymentProof || '',
      cvUrl: editingUser?.cvUrl || '',
      certificateUrl: editingUser?.certificateUrl || '',
    };
    setUsers((prev: any[]) =>
      editingUser
        ? prev.map((u) => (u.id === editingUser.id ? uData : u))
        : [...prev, uData]
    );
    setIsUserModalOpen(false);
    setUserProfilePicPreview(null);
    notify(
      editingUser ? 'User Account Updated' : 'New User Account Provisioned'
    );
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      setUsers((prev: any[]) => prev.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);
      notify('User Account Deleted Successfully');
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const startDate = new Date(fd.get('startDate') as string);
    const endDate = new Date(fd.get('endDate') as string);
    const recurring = fd.get('recurring') === 'on';

    const tid = fd.get('teacherId') as string;
    const sid = fd.get('studentId') as string;
    const crsId = fd.get('courseId') as string;

    const tData = teachers.find((t: any) => t.id === tid);
    const sData = students.find((s: any) => s.id === sid);
    const crs = tenantCourses.find((c: any) => c.id === crsId);
    const customLink =
      (fd.get('customLink') as string) || tData?.meetingLink || '';

    const newSessions: any[] = [];
    let current = new Date(startDate);

    while (current <= endDate) {
      if (!recurring || selectedDays.includes(current.getDay())) {
        newSessions.push({
          id: Date.now() + Math.random(),
          clientId: tenant.id,
          teacherId: tid,
          studentId: sid,
          student: sData?.name || 'Unknown',
          date: current.toISOString().split('T')[0],
          time: fd.get('time'),
          material: crs?.title || 'Assigned Course',
          materialLink: crs?.defaultLink || '',
          status: 'Pending',
          meetingLink: customLink,
          duration: '60',
          homework: '',
          feedback: '',
          internalNotes: '',
          teacherJoinedAt: null,
          studentJoinedAt: null,
          endedAt: null,
        });
      }
      current.setDate(current.getDate() + 1);
      if (!recurring) break;
    }
    setClasses((prev: any[]) => [...prev, ...newSessions]);
    setShowEnrollForm(false);
    setSelectedDays([]);
    notify('Admin Batch Enrollment & Schedule Assigned');
  };

  const handleCourseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCourseImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const cData = {
      id: editingCourse ? editingCourse.id : Date.now().toString(),
      clientId: tenant.id,
      title: fd.get('title'),
      defaultLink: fd.get('defaultLink'),
      pricePerCredit: parseInt(fd.get('pricePerCredit') as string) || 15,
      imageUrl: courseImagePreview || editingCourse?.imageUrl || '',
    };
    setCourses((prev: any[]) =>
      editingCourse
        ? prev.map((c) => (c.id === editingCourse.id ? cData : c))
        : [...prev, cData]
    );
    setIsCourseModalOpen(false);
    setCourseImagePreview(null);
    notify(
      editingCourse ? 'Course Settings Updated' : 'New Course Program Added'
    );
  };

  const confirmDeleteCourse = () => {
    if (courseToDelete) {
      setCourses((prev: any[]) =>
        prev.filter((c) => c.id !== courseToDelete.id)
      );
      setCourseToDelete(null);
      notify('Course Program Deleted');
    }
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const newAnn = {
      id: Date.now().toString(),
      clientId: tenant.id,
      targetRole: fd.get('targetRole'),
      type: fd.get('type'),
      title: fd.get('title'),
      content: fd.get('content'),
      mediaUrl: fd.get('mediaUrl') || '',
      datePosted: new Date().toISOString().split('T')[0],
    };
    setAnnouncements((prev: any[]) => [newAnn, ...prev]);
    notify('Announcement Broadcasted Successfully');
    (e.target as HTMLFormElement).reset();
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev: any[]) => prev.filter((a) => a.id !== id));
    notify('Announcement Removed');
  };

  const handleUpdateCredits = (studentId: string, amount: number) => {
    setUsers((prev: any[]) =>
      prev.map((u) =>
        u.id === studentId ? { ...u, credits: (u.credits || 0) + amount } : u
      )
    );
    setSelectedStudentForBill(null);
    notify('Credits Updated Successfully');
  };

  const paginatedTeachers = filteredUsers
    .filter((u: any) => u.role === 'Teacher')
    .slice((teacherPage - 1) * ITEMS_PER_PAGE, teacherPage * ITEMS_PER_PAGE);
  const paginatedStudents = filteredUsers
    .filter((u: any) => u.role === 'Student')
    .slice((studentPage - 1) * ITEMS_PER_PAGE, studentPage * ITEMS_PER_PAGE);
  const totalTeacherPages = Math.ceil(
    filteredUsers.filter((u: any) => u.role === 'Teacher').length /
      ITEMS_PER_PAGE
  );
  const totalStudentPages = Math.ceil(
    filteredUsers.filter((u: any) => u.role === 'Student').length /
      ITEMS_PER_PAGE
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-gray-900">
            Admin Command
          </h2>
          <p className="text-gray-500 font-medium">
            Nerve Center for {tenant.schoolName}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="w-full lg:w-72 pl-14 pr-6 py-4 border-2 border-gray-200 rounded-3xl outline-none focus:border-[var(--primary)] font-bold bg-white"
            />
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              setUserProfilePicPreview(null);
              setIsUserModalOpen(true);
            }}
            className="bg-[var(--primary)] text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all whitespace-nowrap"
          >
            Add User
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-10 border-b border-gray-200 pb-4 overflow-x-auto">
        {['overview', 'users', 'schedule', 'courses', 'announcements'].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab === 'overview'
                ? 'Dashboard'
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-10 animate-in fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-white p-8 rounded-[40px] border-2 border-gray-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Users size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Total Students
                  </p>
                  <p className="text-3xl font-black text-gray-900">
                    {students.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[40px] border-2 border-gray-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <GraduationCap size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Total Teachers
                  </p>
                  <p className="text-3xl font-black text-gray-900">
                    {teachers.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[40px] border-2 border-gray-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <DollarSign size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Monthly Revenue
                  </p>
                  <p className="text-3xl font-black text-emerald-600">
                    ${totalRevenue.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[40px] border-2 border-gray-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                  <Receipt size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Net Profit
                  </p>
                  <p className="text-3xl font-black text-amber-600">
                    ${totalProfit.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {lowCreditStudents.length > 0 && (
            <div className="bg-red-50 p-8 rounded-[48px] border-2 border-red-200">
              <div className="flex items-center gap-4 mb-6">
                <AlertTriangle className="text-red-500" size={32} />
                <h3 className="text-xl font-black text-red-900">
                  Low Credit Alerts ({lowCreditStudents.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lowCreditStudents.slice(0, 6).map((s: any) => (
                  <div
                    key={s.id}
                    className="bg-white p-6 rounded-3xl border border-red-100 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-black text-gray-900">{s.name}</p>
                      <p className="text-[10px] font-black text-red-500 uppercase">
                        {s.credits} credits left
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedStudentForBill(s)}
                      className="bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase"
                    >
                      Recharge
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-10 animate-in fade-in">
          {/* Teachers Table */}
          <div className="bg-white border-2 border-gray-200 rounded-[48px] overflow-hidden shadow-sm">
            <div className="p-8 bg-indigo-50 border-b border-indigo-100 flex items-center gap-3">
              <GraduationCap className="text-indigo-600" size={24} />
              <h4 className="font-black text-sm uppercase tracking-widest text-indigo-900">
                Faculty Directory
              </h4>
            </div>
            <table className="w-full text-left">
              <thead className="bg-white text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">
                <tr>
                  <th className="px-4 md:px-6 lg:px-10 py-6">Name</th>
                  <th className="px-4 md:px-6 lg:px-10 py-6 hidden md:table-cell">
                    Skills
                  </th>
                  <th className="px-4 md:px-6 lg:px-10 py-6 hidden lg:table-cell">
                    Contact
                  </th>
                  <th className="px-4 md:px-6 lg:px-10 py-6 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedTeachers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 group">
                    <td className="px-4 md:px-6 lg:px-10 py-6 font-black text-gray-900">
                      <button
                        onClick={() => setSelectedTeacher(u)}
                        className="text-left hover:text-[var(--primary)] hover:underline underline-offset-4 transition-colors cursor-pointer"
                      >
                        {u.name}
                      </button>
                    </td>
                    <td className="px-4 md:px-6 lg:px-10 py-6 text-sm text-gray-600 hidden md:table-cell">
                      {u.skills || 'Not specified'}
                    </td>
                    <td className="px-4 md:px-6 lg:px-10 py-6 text-sm text-gray-500 hidden lg:table-cell">
                      {u.email}
                    </td>
                    <td className="px-4 md:px-6 lg:px-10 py-6 text-right">
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setUserProfilePicPreview(u.profilePic);
                          setIsUserModalOpen(true);
                        }}
                        className="text-blue-500 hover:bg-blue-50 p-3 rounded-xl transition-all"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => setUserToDelete(u)}
                        className="text-red-500 hover:bg-red-50 p-3 rounded-xl transition-all ml-2"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedTeachers.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-10 py-10 text-center font-bold text-gray-400 uppercase text-xs"
                    >
                      No teachers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalTeacherPages > 1 && (
              <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <button
                  onClick={() => setTeacherPage((p) => Math.max(1, p - 1))}
                  disabled={teacherPage === 1}
                  className="px-6 py-3 rounded-2xl bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Page {teacherPage} of {totalTeacherPages}
                </span>
                <button
                  onClick={() =>
                    setTeacherPage((p) => Math.min(totalTeacherPages, p + 1))
                  }
                  disabled={teacherPage === totalTeacherPages}
                  className="px-6 py-3 rounded-2xl bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Students Table */}
          <div className="bg-white border-2 border-gray-200 rounded-[48px] overflow-hidden shadow-sm">
            <div className="p-8 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
              <Users className="text-blue-600" size={24} />
              <h4 className="font-black text-sm uppercase tracking-widest text-blue-900">
                Student Roster
              </h4>
            </div>
            <table className="w-full text-left">
              <thead className="bg-white text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">
                <tr>
                  <th className="px-4 md:px-6 lg:px-10 py-6">Name</th>
                  <th className="px-4 md:px-6 lg:px-10 py-6">Credits</th>
                  <th className="px-4 md:px-6 lg:px-10 py-6 hidden md:table-cell">
                    Contact
                  </th>
                  <th className="px-4 md:px-6 lg:px-10 py-6 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedStudents.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 group">
                    <td className="px-4 md:px-6 lg:px-10 py-6 font-black text-gray-900">
                      {u.name}
                    </td>
                    <td className="px-4 md:px-6 lg:px-10 py-6">
                      <span
                        className={`px-3 py-1 rounded-xl font-black text-[10px] uppercase ${
                          (u.credits || 0) <= 3
                            ? 'bg-red-100 text-red-600'
                            : 'bg-emerald-100 text-emerald-600'
                        }`}
                      >
                        {u.credits || 0} Credits
                      </span>
                    </td>
                    <td className="px-4 md:px-6 lg:px-10 py-6 text-sm text-gray-500 hidden md:table-cell">
                      {u.email}
                    </td>
                    <td className="px-4 md:px-6 lg:px-10 py-6 text-right">
                      <button
                        onClick={() => setSelectedStudentForBill(u)}
                        className="text-emerald-500 hover:bg-emerald-50 p-3 rounded-xl transition-all"
                      >
                        <CreditCard size={20} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setUserProfilePicPreview(u.profilePic);
                          setIsUserModalOpen(true);
                        }}
                        className="text-blue-500 hover:bg-blue-50 p-3 rounded-xl transition-all ml-2"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => setUserToDelete(u)}
                        className="text-red-500 hover:bg-red-50 p-3 rounded-xl transition-all ml-2"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedStudents.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-10 py-10 text-center font-bold text-gray-400 uppercase text-xs"
                    >
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalStudentPages > 1 && (
              <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <button
                  onClick={() => setStudentPage((p) => Math.max(1, p - 1))}
                  disabled={studentPage === 1}
                  className="px-6 py-3 rounded-2xl bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Page {studentPage} of {totalStudentPages}
                </span>
                <button
                  onClick={() =>
                    setStudentPage((p) => Math.min(totalStudentPages, p + 1))
                  }
                  disabled={studentPage === totalStudentPages}
                  className="px-6 py-3 rounded-2xl bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6 animate-in fade-in">
          {showEnrollForm && (
            <form
              onSubmit={handleAddBatch}
              className="bg-white p-10 rounded-[48px] border-2 border-[var(--primary)]/40 mb-10 space-y-8 shadow-2xl animate-in slide-in-from-top-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-[var(--primary)] tracking-tight">
                  Admin Enrollment Manager
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEnrollForm(false)}
                  className="text-gray-400 hover:text-gray-900"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                    Select Student
                  </label>
                  <select
                    name="studentId"
                    required
                    className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl mt-1 outline-none focus:border-[var(--primary)] font-black uppercase text-xs text-gray-900"
                  >
                    <option value="">Account...</option>
                    {students.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.credits} Credits)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                    Select Course / Topic
                  </label>
                  <select
                    name="courseId"
                    required
                    className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl mt-1 outline-none focus:border-[var(--primary)] font-black uppercase text-xs text-gray-900"
                  >
                    <option value="">Course Resource...</option>
                    {tenantCourses.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                    Assign Teacher
                  </label>
                  <select
                    name="teacherId"
                    required
                    className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl mt-1 outline-none focus:border-[var(--primary)] font-black uppercase text-xs text-gray-900"
                  >
                    <option value="">Faculty...</option>
                    {teachers.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                    Start Date
                  </label>
                  <input
                    required
                    type="date"
                    name="startDate"
                    className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl mt-1 outline-none focus:border-[var(--primary)] font-black text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                    Start Time
                  </label>
                  <input
                    required
                    type="time"
                    name="time"
                    className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl mt-1 outline-none focus:border-[var(--primary)] font-black text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                    Custom Meet Link (Optional)
                  </label>
                  <input
                    name="customLink"
                    placeholder="Leave blank to use teacher default"
                    className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl mt-1 outline-none focus:border-[var(--primary)] font-black text-gray-900"
                  />
                </div>
              </div>
              <div className="p-8 bg-gray-50 rounded-[32px] border-2 border-gray-200">
                <label className="flex items-center gap-4 cursor-pointer mb-6 group">
                  <input
                    type="checkbox"
                    name="recurring"
                    className="w-6 h-6 rounded-lg accent-[var(--primary)]"
                  />
                  <span className="text-sm font-black text-gray-700 uppercase tracking-widest group-hover:text-[var(--primary)] transition-colors">
                    Generate Recurring Weekly Schedule
                  </span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                      Batch End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      className="w-full p-5 border-2 border-gray-200 bg-white rounded-3xl mt-1 outline-none focus:border-[var(--primary)] font-black text-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 mb-3 block ml-2 tracking-widest">
                      Schedule Weekdays
                    </label>
                    <div className="flex gap-3">
                      {daysArr.map((d) => (
                        <button
                          key={d.val}
                          type="button"
                          onClick={() => toggleDay(d.val)}
                          className={`w-12 h-12 rounded-2xl font-black text-sm transition-all border-2 ${
                            selectedDays.includes(d.val)
                              ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xl scale-110'
                              : 'bg-white text-gray-400 border-gray-200 hover:border-[var(--primary)]/30'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[var(--primary)] text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
              >
                Execute Assignment & Schedule Course
              </button>
            </form>
          )}

          <div className="bg-white border-2 border-gray-200 rounded-[64px] overflow-hidden shadow-sm">
            <div className="p-8 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Activity className="text-[var(--primary)]" />
                <h4 className="font-black text-sm uppercase tracking-widest text-gray-900">
                  Live Monitor & Schedule
                </h4>
              </div>
              <button
                onClick={() => setShowEnrollForm(!showEnrollForm)}
                className="bg-[var(--primary)] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-md active:scale-95"
              >
                {showEnrollForm ? 'Cancel Enrollment' : 'Enroll Student'}
              </button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-white text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">
                <tr>
                  <th className="px-10 py-6">Date/Time</th>
                  <th className="px-10 py-6">Assignment</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tenantClasses.slice(0, 10).map((cls: any) => {
                  const teacherData = teachers.find(
                    (u: any) => u.id === cls.teacherId
                  );
                  return (
                    <tr
                      key={cls.id}
                      className="hover:bg-gray-50/50 group transition-all"
                    >
                      <td className="px-10 py-6 font-black text-gray-900">
                        {formatDisplayDate(cls.date)}{' '}
                        <span className="text-[10px] text-gray-500 ml-2">
                          {cls.time}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-sm">
                        <span className="font-bold text-gray-900 block truncate max-w-[150px]">
                          {cls.student}
                        </span>
                        <span className="text-[10px] font-black text-gray-500 uppercase">
                          Tch: {teacherData?.name}
                        </span>
                      </td>
                      <td className="px-10 py-6">
                        <span
                          className={`px-3 py-1 rounded-xl font-black text-[10px] uppercase ${
                            cls.status === 'Class Done'
                              ? 'bg-emerald-100 text-emerald-600'
                              : cls.status === 'Student Absent'
                              ? 'bg-red-100 text-red-600'
                              : cls.status === 'Student Late'
                              ? 'bg-orange-100 text-orange-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          {cls.status}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <a
                          href={cls.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 hover:bg-blue-50 p-3 rounded-xl transition-all inline-block"
                        >
                          <ExternalLink size={20} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
                {tenantClasses.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-10 py-10 text-center font-bold text-gray-400 uppercase text-xs"
                    >
                      No scheduled classes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="bg-white border-2 border-gray-200 rounded-[64px] overflow-hidden shadow-sm animate-in fade-in">
          <div className="p-8 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h4 className="font-black text-sm uppercase tracking-widest text-gray-900">
              Course Offerings Catalog
            </h4>
            <button
              onClick={() => {
                setEditingCourse(null);
                setCourseImagePreview(null);
                setIsCourseModalOpen(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md active:scale-95"
            >
              Add New Course
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-white text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">
              <tr>
                <th className="px-12 py-8">Course Title</th>
                <th className="px-12 py-8">Rate / Credit</th>
                <th className="px-12 py-8">Material Link</th>
                <th className="px-12 py-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tenantCourses.map((crs: any) => (
                <tr
                  key={crs.id}
                  className="hover:bg-gray-50/50 group transition-all"
                >
                  <td className="px-12 py-8 flex items-center gap-4">
                    {crs.imageUrl ? (
                      <img
                        src={crs.imageUrl}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-sm"
                        alt="Course"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                        <BookOpen size={20} />
                      </div>
                    )}
                    <span className="font-black text-gray-900 text-lg uppercase tracking-tight">
                      {crs.title}
                    </span>
                  </td>
                  <td className="px-12 py-8 font-black text-emerald-600">
                    ${crs.pricePerCredit || 15}
                  </td>
                  <td className="px-12 py-8 text-xs text-blue-600 font-bold truncate max-w-[200px]">
                    {crs.defaultLink || 'Not Set'}
                  </td>
                  <td className="px-12 py-8 text-right">
                    <button
                      onClick={() => {
                        setEditingCourse(crs);
                        setCourseImagePreview(null);
                        setIsCourseModalOpen(true);
                      }}
                      className="text-blue-500 hover:bg-blue-50 p-4 rounded-2xl transition-all hover:scale-110"
                      title="Edit Course"
                    >
                      <Edit2 size={24} />
                    </button>
                    <button
                      onClick={() => setCourseToDelete(crs)}
                      className="text-red-500 hover:bg-red-50 p-4 rounded-2xl transition-all hover:scale-110 ml-2"
                      title="Delete Course"
                    >
                      <Trash2 size={24} />
                    </button>
                  </td>
                </tr>
              ))}
              {tenantCourses.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-12 py-10 text-center font-bold text-gray-400 uppercase text-xs"
                  >
                    No courses configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="space-y-10 animate-in fade-in">
          <form
            onSubmit={handlePostAnnouncement}
            className="bg-white p-10 rounded-[48px] border-2 border-gray-200 shadow-sm space-y-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <Megaphone className="text-[var(--primary)]" size={32} />
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                Broadcast Announcement
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                  Announcement Title
                </label>
                <input
                  required
                  name="title"
                  placeholder="e.g. Campus Closed for Holiday"
                  className="w-full p-6 border-2 border-gray-200 bg-gray-50 rounded-[32px] outline-none focus:border-[var(--primary)] font-black text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                  Target Audience
                </label>
                <select
                  required
                  name="targetRole"
                  className="w-full p-6 border-2 border-gray-200 bg-gray-50 rounded-[32px] outline-none focus:border-[var(--primary)] font-black uppercase text-xs text-gray-900"
                >
                  <option value="All">All Users (Students & Faculty)</option>
                  <option value="Student">Students Only</option>
                  <option value="Teacher">Faculty / Teachers Only</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                Message Content
              </label>
              <textarea
                required
                name="content"
                rows={4}
                placeholder="Type your announcement message here..."
                className="w-full p-6 border-2 border-gray-200 bg-gray-50 rounded-[32px] outline-none focus:border-[var(--primary)] font-medium text-gray-900"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                  Media Attachment Type
                </label>
                <select
                  required
                  name="type"
                  className="w-full p-6 border-2 border-gray-200 bg-gray-50 rounded-[32px] outline-none focus:border-[var(--primary)] font-black uppercase text-xs text-gray-900"
                >
                  <option value="text">Text Only (No Media)</option>
                  <option value="image">Image Attachment</option>
                  <option value="video">Video Attachment (.mp4)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                  Media URL (If applicable)
                </label>
                <input
                  name="mediaUrl"
                  placeholder="https://example.com/image.png"
                  className="w-full p-6 border-2 border-gray-200 bg-gray-50 rounded-[32px] outline-none focus:border-[var(--primary)] font-medium text-gray-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--primary)] text-white py-6 rounded-[32px] font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
            >
              Publish & Broadcast Announcement
            </button>
          </form>

          <div className="bg-white border-2 border-gray-200 rounded-[64px] overflow-hidden shadow-sm">
            <div className="p-8 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
              <ListOrdered className="text-[var(--primary)]" size={24} />
              <h4 className="font-black text-sm uppercase tracking-widest text-gray-900">
                Announcement History
              </h4>
            </div>
            <div className="divide-y divide-gray-100">
              {tenantAnnouncements.map((a: any) => (
                <div
                  key={a.id}
                  className="p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {formatDisplayDate(a.datePosted)}
                      </span>
                      <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-xl text-[9px] font-black uppercase tracking-widest">
                        To: {a.targetRole}
                      </span>
                      {a.type !== 'text' && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest">
                          Has {a.type}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-black text-gray-900">
                      {a.title}
                    </h4>
                    <p className="text-sm text-gray-500 font-medium mt-1 truncate max-w-2xl">
                      {a.content}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteAnnouncement(a.id)}
                    className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm group-hover:scale-110"
                    title="Delete Announcement"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              {tenantAnnouncements.length === 0 && (
                <div className="py-12 text-center font-bold text-gray-400 uppercase text-xs">
                  No announcements broadcasted yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
          setUserProfilePicPreview(null);
        }}
        title={editingUser ? 'Edit User Account' : 'Add New User'}
      >
        <form onSubmit={handleSaveUser} className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                Full Name
              </label>
              <input
                required
                name="name"
                defaultValue={editingUser?.name}
                className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-black text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                Role
              </label>
              <select
                required
                name="role"
                defaultValue={editingUser?.role || 'Student'}
                className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-black uppercase text-xs text-gray-900"
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                Email
              </label>
              <input
                type="email"
                name="email"
                defaultValue={editingUser?.email}
                className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-bold text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                defaultValue={editingUser?.phone}
                className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-bold text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                Username
              </label>
              <input
                required
                name="username"
                defaultValue={editingUser?.username}
                className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-black text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                Password
              </label>
              <input
                required
                name="password"
                defaultValue={editingUser?.password}
                className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-black text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                Credits (Students)
              </label>
              <input
                type="number"
                name="credits"
                defaultValue={editingUser?.credits || 0}
                className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-black text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                Default Meeting Link
              </label>
              <input
                name="meetingLink"
                defaultValue={editingUser?.meetingLink}
                className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-bold text-gray-900"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                Skills / Expertise (Teachers)
              </label>
              <input
                name="skills"
                defaultValue={editingUser?.skills}
                className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-bold text-gray-900"
                placeholder="e.g. Math, Science, SAT Prep"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
                Profile Picture
              </label>
              <div className="flex items-center gap-6 p-4 border-2 border-dashed border-gray-200 bg-gray-50 rounded-3xl">
                {userProfilePicPreview ? (
                  <img
                    src={userProfilePicPreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <ImageIcon size={24} />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUserPicChange}
                  className="flex-1 text-sm font-medium text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 transition-all cursor-pointer outline-none"
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-[var(--primary)] text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
          >
            {editingUser ? 'Update User Account' : 'Create User Account'}
          </button>
        </form>
      </Modal>

      {/* Delete User Confirmation */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Confirm Deletion"
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Trash2 className="text-red-500" size={40} />
          </div>
          <p className="text-gray-600 font-medium">
            Are you sure you want to delete{' '}
            <strong className="text-gray-900">{userToDelete?.name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setUserToDelete(null)}
              className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteUser}
              className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Course Modal */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => {
          setIsCourseModalOpen(false);
          setEditingCourse(null);
          setCourseImagePreview(null);
        }}
        title={editingCourse ? 'Edit Course' : 'Add New Course'}
      >
        <form onSubmit={handleSaveCourse} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
              Course Title
            </label>
            <input
              required
              name="title"
              defaultValue={editingCourse?.title}
              className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-black text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
              Default Material Link
            </label>
            <input
              name="defaultLink"
              defaultValue={editingCourse?.defaultLink}
              className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-bold text-gray-900"
              placeholder="https://drive.google.com/..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
              Price Per Credit ($)
            </label>
            <input
              type="number"
              name="pricePerCredit"
              defaultValue={editingCourse?.pricePerCredit || 15}
              className="w-full p-5 border-2 border-gray-200 bg-gray-50 rounded-3xl outline-none focus:border-[var(--primary)] font-black text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">
              Course Image
            </label>
            <div className="flex items-center gap-6 p-4 border-2 border-dashed border-gray-200 bg-gray-50 rounded-3xl">
              {courseImagePreview || editingCourse?.imageUrl ? (
                <img
                  src={courseImagePreview || editingCourse?.imageUrl}
                  alt="Preview"
                  className="w-16 h-16 rounded-2xl object-cover border border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                  <ImageIcon size={24} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleCourseImageChange}
                className="flex-1 text-sm font-medium text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 transition-all cursor-pointer outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-[var(--primary)] text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
          >
            {editingCourse ? 'Update Course' : 'Create Course'}
          </button>
        </form>
      </Modal>

      {/* Delete Course Confirmation */}
      <Modal
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        title="Confirm Deletion"
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Trash2 className="text-red-500" size={40} />
          </div>
          <p className="text-gray-600 font-medium">
            Are you sure you want to delete the course{' '}
            <strong className="text-gray-900">{courseToDelete?.title}</strong>?
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setCourseToDelete(null)}
              className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteCourse}
              className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Billing Modal */}
      {selectedStudentForBill && (
        <BillingModal
          student={selectedStudentForBill}
          onClose={() => setSelectedStudentForBill(null)}
          onUpdateCredits={handleUpdateCredits}
        />
      )}

      {/* Teacher Detail Slide-Over Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex justify-end">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedTeacher(null)}
          />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-8 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-2xl border-2 border-indigo-200 shadow-inner">
                  {selectedTeacher.profilePic ? (
                    <img
                      src={selectedTeacher.profilePic}
                      alt={selectedTeacher.name}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    selectedTeacher.name?.charAt(0) || 'T'
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    {selectedTeacher.name}
                  </h3>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    Faculty Member
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeacher(null)}
                className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Teacher Info Card */}
              <div className="bg-indigo-50 p-8 rounded-[32px] border-2 border-indigo-100 space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="text-indigo-500" size={18} />
                  <span className="text-sm font-bold text-gray-700">
                    {selectedTeacher.email || 'No email provided'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="text-indigo-500" size={18} />
                  <span className="text-sm font-bold text-gray-700">
                    {selectedTeacher.phone || 'No phone provided'}
                  </span>
                </div>
                {selectedTeacher.skills && (
                  <div className="pt-2 border-t border-indigo-200 mt-4">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">
                      Skills & Expertise
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTeacher.skills
                        .split(',')
                        .map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-white px-3 py-1 rounded-xl text-xs font-black text-indigo-700 border border-indigo-200"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Assigned Students Section */}
              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Users size={16} /> Assigned Students & Enrollments
                </h4>
                <div className="space-y-4">
                  {(() => {
                    // Get all classes for this teacher
                    const teacherAssignments = tenantClasses.filter(
                      (c: any) => c.teacherId === selectedTeacher.id
                    );

                    // Group by student
                    const studentMap = new Map();
                    teacherAssignments.forEach((cls: any) => {
                      const studentData = students.find(
                        (s: any) => s.id === cls.studentId
                      );
                      if (studentData) {
                        if (!studentMap.has(cls.studentId)) {
                          studentMap.set(cls.studentId, {
                            student: studentData,
                            courses: new Set(),
                            totalCredits: 0,
                            completedClasses: 0,
                            pendingClasses: 0,
                          });
                        }
                        const entry = studentMap.get(cls.studentId);
                        entry.courses.add(cls.material);
                        if (
                          cls.status === 'Class Done' ||
                          cls.status === 'Student Absent' ||
                          cls.status === 'Student Late'
                        ) {
                          entry.completedClasses++;
                        } else {
                          entry.pendingClasses++;
                        }
                        entry.totalCredits = studentData.credits || 0;
                      }
                    });

                    const assignedStudents = Array.from(studentMap.values());

                    if (assignedStudents.length === 0) {
                      return (
                        <div className="bg-gray-50 p-10 rounded-[32px] border-2 border-gray-200 text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Users size={32} />
                          </div>
                          <p className="text-gray-500 font-bold">
                            No students currently assigned
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Use the enrollment form to assign students
                          </p>
                        </div>
                      );
                    }

                    return assignedStudents.map(
                      ({
                        student,
                        courses,
                        totalCredits,
                        completedClasses,
                        pendingClasses,
                      }) => (
                        <div
                          key={student.id}
                          className="bg-white p-6 rounded-[28px] border-2 border-gray-200 hover:border-[var(--primary)]/30 transition-all shadow-sm"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-lg border border-blue-200">
                                {student.profilePic ? (
                                  <img
                                    src={student.profilePic}
                                    alt={student.name}
                                    className="w-full h-full rounded-2xl object-cover"
                                  />
                                ) : (
                                  student.name?.charAt(0) || 'S'
                                )}
                              </div>
                              <div>
                                <p className="font-black text-gray-900">
                                  {student.name}
                                </p>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                  {student.email || 'No email'}
                                </p>
                              </div>
                            </div>
                            <div
                              className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${
                                totalCredits <= 3
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-emerald-100 text-emerald-600'
                              }`}
                            >
                              {totalCredits} Credits
                            </div>
                          </div>

                          {/* Courses */}
                          <div className="mb-4">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                              Enrolled Courses
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {Array.from(courses).map(
                                (course: any, idx: number) => (
                                  <span
                                    key={idx}
                                    className="bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-xl text-xs font-black"
                                  >
                                    {course}
                                  </span>
                                )
                              )}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                            <div className="bg-emerald-50 p-4 rounded-2xl text-center">
                              <p className="text-2xl font-black text-emerald-600">
                                {completedClasses}
                              </p>
                              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                Sessions Done
                              </p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-2xl text-center">
                              <p className="text-2xl font-black text-blue-600">
                                {pendingClasses}
                              </p>
                              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">
                                Upcoming
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    );
                  })()}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-50 p-6 rounded-[28px] border-2 border-gray-200">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                  Teaching Summary
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-black text-gray-900">
                      {
                        tenantClasses.filter(
                          (c: any) => c.teacherId === selectedTeacher.id
                        ).length
                      }
                    </p>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                      Total Classes
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-black text-emerald-600">
                      {
                        tenantClasses.filter(
                          (c: any) =>
                            c.teacherId === selectedTeacher.id &&
                            (c.status === 'Class Done' ||
                              c.status === 'Student Absent' ||
                              c.status === 'Student Late')
                        ).length
                      }
                    </p>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                      Completed
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-black text-blue-600">
                      {
                        tenantClasses.filter(
                          (c: any) =>
                            c.teacherId === selectedTeacher.id &&
                            c.status === 'Pending'
                        ).length
                      }
                    </p>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                      Pending
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUPER ADMIN VIEW ---

const SuperAdminView = ({
  clients,
  setClients,
  onLaunch,
  notify,
  theme,
  setTheme,
  branding,
  setBranding,
}: any) => {
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);
  const [brandingLogoPreview, setBrandingLogoPreview] = useState<string | null>(
    null
  );

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBrandingLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBrandingLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const clientData = {
      id: editingClient ? editingClient.id : `c${Date.now()}`,
      schoolName: fd.get('name'),
      primaryColor: fd.get('color'),
      dashboardTheme: fd.get('dashboardTheme'),
      logoUrl: logoPreview || editingClient?.logoUrl || '',
      username: fd.get('user'),
      password: fd.get('pass'),
      mrr: fd.get('mrr') || '$0',
    };
    setClients((prev: any[]) =>
      editingClient
        ? prev.map((c) => (c.id === editingClient.id ? clientData : c))
        : [...prev, clientData]
    );
    setIsNewOpen(false);
    setEditingClient(null);
    setLogoPreview(null);
    notify(editingClient ? 'Sub-Account Updated' : 'New Sub-Account Deployed');
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    setBranding({
      platformName: fd.get('platformName'),
      hubName: fd.get('hubName'),
      tagline: fd.get('tagline'),
      logoUrl: brandingLogoPreview || branding?.logoUrl || '',
    });
    setIsBrandingOpen(false);
    notify('Global Platform Branding Updated');
  };

  const activeTheme = THEMES[theme as keyof typeof THEMES] || THEMES.white;

  return (
    <div
      className={`min-h-screen ${activeTheme.main} text-gray-900 p-6 md:p-12 lg:p-16 xl:p-24 animate-in fade-in duration-500`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12 lg:mb-24">
          <div className="flex items-center gap-6 lg:gap-10">
            <div
              className={`w-16 h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 ${activeTheme.thumb} text-white rounded-[24px] lg:rounded-[40px] flex items-center justify-center shadow-2xl animate-pulse shrink-0`}
            >
              <ShieldCheck className="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl lg:text-6xl font-black tracking-tight mb-2 text-gray-900">
                {branding?.hubName || 'EduSync Command Hub'}
              </h1>
              <p className="text-gray-500 font-medium tracking-[0.2em] lg:tracking-[0.3em] uppercase text-[10px] lg:text-[12px]">
                Unified Sub-Account Deployment Layer
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-4 lg:gap-6 w-full lg:w-auto">
            <div className="flex gap-2 bg-white p-3 rounded-full shadow-sm border border-gray-200">
              {Object.entries(THEMES).map(([k, t]) => (
                <button
                  key={k}
                  onClick={() => setTheme(k)}
                  title={t.label}
                  className={`w-6 h-6 rounded-full transition-all border-2 ${
                    theme === k
                      ? 'border-gray-900 scale-125 shadow-md'
                      : 'border-transparent opacity-60 hover:opacity-100 hover:scale-110'
                  } ${t.thumb}`}
                />
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 w-full lg:w-auto">
              <button
                onClick={() => {
                  setBrandingLogoPreview(branding?.logoUrl || null);
                  setIsBrandingOpen(true);
                }}
                className="bg-white text-gray-700 border-2 border-gray-200 px-6 lg:px-8 py-4 lg:py-6 rounded-[24px] lg:rounded-[40px] font-black uppercase text-xs lg:text-sm tracking-widest shadow-sm active:scale-95 transition-all hover:bg-gray-50 hover:scale-105"
              >
                Edit Branding
              </button>
              <button
                onClick={() => {
                  setEditingClient(null);
                  setLogoPreview(null);
                  setIsNewOpen(true);
                }}
                className="bg-blue-600 text-white px-6 lg:px-16 py-4 lg:py-6 rounded-[24px] lg:rounded-[40px] font-black uppercase text-xs lg:text-sm tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all hover:bg-blue-700 hover:scale-105"
              >
                Deploy Sub-Account
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {clients.map((c: any) => (
            <div
              key={c.id}
              className={`bg-white p-12 rounded-[72px] border-2 ${activeTheme.border} flex flex-col justify-between group hover:border-blue-500 transition-all shadow-xl hover:shadow-2xl relative overflow-hidden h-[480px]`}
            >
              <div
                className="cursor-pointer h-full flex flex-col justify-between"
                onClick={() => onLaunch(c)}
              >
                <div className="flex flex-col gap-6 mb-8">
                  <OrgLogo
                    src={c.logoUrl}
                    alt={c.schoolName}
                    size="huge"
                    className="shadow-md rounded-[32px] border-gray-100"
                  />
                  <div>
                    <h3 className="text-2xl font-black tracking-tight group-hover:text-blue-600 transition-colors uppercase text-gray-900 leading-tight">
                      {c.schoolName}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2">
                      Active Node ID: {c.id}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-end border-t border-gray-100 pt-8 mt-auto">
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">
                      Monthly Subscription
                    </p>
                    <div className="text-blue-600 font-black text-4xl tracking-tighter">
                      {c.mrr}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingClient(c);
                        setLogoPreview(c.logoUrl);
                        setIsNewOpen(true);
                      }}
                      className="text-[10px] font-black uppercase text-gray-500 tracking-widest hover:text-gray-900 transition-all bg-gray-50 px-6 py-4 rounded-3xl border border-gray-200 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Settings size={14} /> Configure
                    </button>
                    <div className="w-14 h-14 shrink-0 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all">
                      <ArrowUpRight size={28} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isNewOpen}
        onClose={() => {
          setIsNewOpen(false);
          setEditingClient(null);
          setLogoPreview(null);
        }}
        title={
          editingClient
            ? 'Configure Global Hub Settings'
            : 'Deploy New Sub-Account Node'
        }
      >
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4 mb-2 block">
                Enterprise Entity Name
              </label>
              <input
                required
                name="name"
                defaultValue={editingClient?.schoolName}
                className="w-full p-7 border-2 border-gray-200 bg-gray-50 rounded-[40px] outline-none focus:border-blue-500 font-black text-xl uppercase text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4 mb-2 block">
                Brand Hex Color
              </label>
              <select
                required
                name="color"
                defaultValue={editingClient?.primaryColor || '#0ea5e9'}
                className="w-full p-7 border-2 border-gray-200 bg-gray-50 rounded-[40px] outline-none focus:border-blue-500 font-black uppercase text-gray-900"
              >
                <option value="#0ea5e9">Light Blue (Default)</option>
                <option value="#3b82f6">Solid Blue</option>
                <option value="#6366f1">Indigo</option>
                <option value="#10b981">Emerald</option>
                <option value="#f43f5e">Rose</option>
                <option value="#8b5cf6">Purple</option>
                <option value="#f97316">Orange</option>
                <option value="#14b8a6">Teal</option>
                <option value="#0f172a">Dark Slate</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4 mb-2 block">
                Dashboard Base Theme
              </label>
              <select
                required
                name="dashboardTheme"
                defaultValue={editingClient?.dashboardTheme || 'white'}
                className="w-full p-7 border-2 border-gray-200 bg-gray-50 rounded-[40px] outline-none focus:border-blue-500 font-black uppercase text-gray-900"
              >
                {Object.entries(THEMES).map(([k, t]) => (
                  <option key={k} value={k}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4 mb-2 block">
                Node MRR Billing
              </label>
              <input
                name="mrr"
                defaultValue={editingClient?.mrr}
                placeholder="$2,500"
                className="w-full p-7 border-2 border-gray-200 bg-gray-50 rounded-[40px] outline-none focus:border-blue-500 font-black text-gray-900"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4 mb-2 block">
                Organization Logo
              </label>
              <div className="flex items-center gap-6 p-4 border-2 border-dashed border-gray-200 bg-gray-50 rounded-[40px] focus-within:border-blue-500 transition-all">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover bg-white border border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-400 shadow-inner">
                    <ImageIcon size={24} />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="flex-1 text-sm font-medium text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4 mb-2 block">
                Admin Master User
              </label>
              <input
                required
                name="user"
                defaultValue={editingClient?.username}
                className="w-full p-7 border-2 border-gray-200 bg-gray-50 rounded-[40px] outline-none focus:border-blue-500 font-black text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4 mb-2 block">
                Admin Master Pass
              </label>
              <input
                required
                name="pass"
                defaultValue={editingClient?.password}
                className="w-full p-7 border-2 border-gray-200 bg-gray-50 rounded-[40px] outline-none focus:border-blue-500 font-black text-gray-900"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-8 rounded-[40px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all hover:bg-blue-700"
          >
            {editingClient
              ? 'Commit Hub Configuration Changes'
              : 'Activate Instance & Provision Node'}
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={isBrandingOpen}
        onClose={() => setIsBrandingOpen(false)}
        title="Global Platform Branding"
      >
        <form onSubmit={handleSaveBranding} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4 mb-2 block">
              Global Platform Logo
            </label>
            <div className="flex items-center gap-6 p-4 border-2 border-dashed border-gray-200 bg-gray-50 rounded-[40px] focus-within:border-blue-500 transition-all">
              {brandingLogoPreview ? (
                <img
                  src={brandingLogoPreview}
                  alt="Global Preview"
                  className="w-16 h-16 rounded-2xl object-cover bg-white border border-gray-200 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-400 shadow-inner">
                  <ImageIcon size={24} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleBrandingLogoChange}
                className="flex-1 text-sm font-medium text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4 mb-2 block">
              Command Hub Title (Super Admin)
            </label>
            <input
              required
              name="hubName"
              defaultValue={branding?.hubName}
              className="w-full p-7 border-2 border-gray-200 bg-gray-50 rounded-[40px] outline-none focus:border-blue-500 font-black text-xl uppercase text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4 mb-2 block">
              Public Login Title (SaaS Name)
            </label>
            <input
              required
              name="platformName"
              defaultValue={branding?.platformName}
              className="w-full p-7 border-2 border-gray-200 bg-gray-50 rounded-[40px] outline-none focus:border-blue-500 font-black text-xl text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4 mb-2 block">
              Public Login Tagline
            </label>
            <input
              required
              name="tagline"
              defaultValue={branding?.tagline}
              className="w-full p-7 border-2 border-gray-200 bg-gray-50 rounded-[40px] outline-none focus:border-blue-500 font-black text-xl text-gray-900"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-8 rounded-[40px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all hover:bg-blue-700"
          >
            Save White-Label Settings
          </button>
        </form>
      </Modal>
    </div>
  );
};

// --- MAIN APP ORCHESTRATOR ---

export default function App() {
  const [appMode, setAppMode] = useState<'login' | 'superadmin' | 'portal'>(
    'login'
  );
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeClient, setActiveClient] = useState<any>(null);
  const [isSuperAdminSession, setIsSuperAdminSession] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Real-time Theme State
  const [dashboardTheme, setDashboardTheme] = useState('white');

  // Global Branding State
  const [globalBranding, setGlobalBranding] = useState({
    platformName: 'EduSync SaaS',
    hubName: 'EduSync Command Hub',
    tagline: 'Unified Learning Ecosystem',
    logoUrl: '',
  });

  const [clients, setClients] = useState([
    {
      id: 'c1',
      schoolName: 'EduSync Pro',
      primaryColor: '#0ea5e9',
      dashboardTheme: 'white',
      logoUrl:
        'https://img.freepik.com/free-vector/bird-colorful-logo-gradient-designs_343694-2506.jpg',
      username: 'edusync',
      password: '123',
      mrr: '$4,200',
    },
    {
      id: 'c2',
      schoolName: 'Horizon Academy',
      primaryColor: '#8b5cf6',
      dashboardTheme: 'purple',
      logoUrl:
        'https://img.freepik.com/free-vector/gradient-abstract-logo-template_23-2148204631.jpg',
      username: 'horizon',
      password: '123',
      mrr: '$1,850',
    },
  ]);

  const [users, setUsers] = useState([
    {
      id: 'u1',
      clientId: 'c1',
      name: 'Dr. Sarah Jenkins',
      role: 'Teacher',
      username: 'sarah',
      password: '123',
      email: 'sarah.j@edusync.com',
      phone: '+1 (555) 019-8472',
      lastLogin: 'Today',
      meetingLink: 'https://zoom.us/sarah',
      skills: 'Advanced Mathematics, SAT Prep',
    },
    {
      id: 'u2',
      clientId: 'c1',
      name: 'John Doe',
      role: 'Student',
      username: 'john',
      password: '123',
      email: 'john.doe@gmail.com',
      phone: '+1 (555) 982-1044',
      lastLogin: 'Yesterday',
      credits: 2,
    },
  ]);

  const [courses, setCourses] = useState([
    {
      id: 'crs1',
      clientId: 'c1',
      title: 'Advanced Robotics 101',
      defaultLink: 'https://drive.google.com/...',
      pricePerCredit: 15,
      imageUrl:
        'https://img.freepik.com/free-vector/artificial-intelligence-robotics-background_52683-30815.jpg',
    },
    {
      id: 'crs2',
      clientId: 'c1',
      title: 'Fullstack React Dev',
      defaultLink: 'https://drive.google.com/...',
      pricePerCredit: 20,
      imageUrl:
        'https://img.freepik.com/free-vector/app-development-illustration_52683-47743.jpg',
    },
  ]);

  const [classes, setClasses] = useState<any[]>([]);

  const [announcements, setAnnouncements] = useState([
    {
      id: 'a1',
      clientId: 'c1',
      targetRole: 'All',
      type: 'text',
      title: 'Welcome to EduSync Hub!',
      content:
        'Please make sure to set up your profile and check your schedule for the upcoming week.',
      mediaUrl: '',
      datePosted: new Date().toISOString().split('T')[0],
    },
  ]);

  const handleLogin = (
    user: string,
    pass: string,
    setError: (err: string) => void
  ) => {
    const u = user.trim().toLowerCase();
    const p = pass.trim();
    if (u === 'admin' && p === '123') {
      setIsSuperAdminSession(true);
      return setAppMode('superadmin');
    }
    const client = clients.find(
      (c) => (c.username || '').toLowerCase() === u && c.password === p
    );
    if (client) {
      setIsSuperAdminSession(false);
      setActiveClient(client);
      setUserRole('Admin');
      setCurrentUser({ ...client, name: client.schoolName });
      setDashboardTheme(client.dashboardTheme || 'white');
      setAppMode('portal');
      return;
    }
    const internal = users.find(
      (x) => (x.username || '').toLowerCase() === u && x.password === p
    );
    if (internal) {
      const activeC = clients.find((c) => c.id === internal.clientId);
      setIsSuperAdminSession(false);
      setActiveClient(activeC);
      setUserRole(internal.role);
      setCurrentUser(internal);
      setDashboardTheme(activeC?.dashboardTheme || 'white');
      setAppMode('portal');
      return;
    }
    setError('Access Denied: Unrecognized Credentials.');
  };

  const handleRegister = (newUser: any) => {
    setUsers((prev) => [newUser, ...prev]);
    setToastMessage(
      'Registration successful! Your profile is pending review. You may log in.'
    );
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const newName = fd.get('name') as string;
    const newUsername = ((fd.get('username') as string) || '')
      .toLowerCase()
      .trim();
    const newPassword = fd.get('password') as string;
    const newEmail = (fd.get('email') as string) || '';
    const newPhone = (fd.get('phone') as string) || '';

    if (userRole === 'Admin') {
      setClients((prev) =>
        prev.map((c) =>
          c.id === activeClient.id
            ? {
                ...c,
                schoolName: newName,
                username: newUsername,
                password: newPassword,
              }
            : c
        )
      );
      setActiveClient((prev: any) => ({
        ...prev,
        schoolName: newName,
        username: newUsername,
        password: newPassword,
      }));
      setCurrentUser((prev: any) => ({
        ...prev,
        name: newName,
        username: newUsername,
        password: newPassword,
      }));
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id
            ? {
                ...u,
                name: newName,
                username: newUsername,
                password: newPassword,
                email: newEmail,
                phone: newPhone,
              }
            : u
        )
      );
      setCurrentUser((prev: any) => ({
        ...prev,
        name: newName,
        username: newUsername,
        password: newPassword,
        email: newEmail,
        phone: newPhone,
      }));
    }
    setToastMessage('Configuration Settings Updated');
    setIsSettingsOpen(false);
  };

  const currentPrimaryColor = activeClient?.primaryColor || '#0ea5e9';

  return (
    <div
      className={`antialiased font-sans text-gray-900 min-h-screen flex flex-col ${
        appMode === 'portal'
          ? THEMES[dashboardTheme as keyof typeof THEMES]?.main || 'bg-white'
          : 'bg-white'
      }`}
      style={{ '--primary': currentPrimaryColor } as React.CSSProperties}
    >
      <style>{`:root { --primary: ${currentPrimaryColor}; }`}</style>

      {appMode === 'login' ? (
        <LoginScreen
          onLogin={handleLogin}
          onRegister={handleRegister}
          clients={clients}
          globalBranding={globalBranding}
        />
      ) : appMode === 'superadmin' ? (
        <SuperAdminView
          clients={clients}
          setClients={setClients}
          onLaunch={(c: any) => {
            setActiveClient(c);
            setUserRole('Admin');
            setCurrentUser({ name: c.schoolName });
            setDashboardTheme(c.dashboardTheme || 'white');
            setAppMode('portal');
          }}
          notify={setToastMessage}
          theme={dashboardTheme}
          setTheme={setDashboardTheme}
          branding={globalBranding}
          setBranding={setGlobalBranding}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <aside
            className={`w-72 lg:w-80 xl:w-96 border-r flex flex-col p-6 lg:p-8 xl:p-10 shrink-0 z-50 shadow-sm animate-in slide-in-from-left-4 ${
              THEMES[dashboardTheme as keyof typeof THEMES]?.sidebar ||
              'bg-white'
            } ${
              THEMES[dashboardTheme as keyof typeof THEMES]?.border ||
              'border-gray-200'
            }`}
          >
            {isSuperAdminSession && (
              <button
                onClick={() => setAppMode('superadmin')}
                className="w-full flex items-center gap-4 px-8 py-5 mb-10 bg-emerald-50 text-emerald-700 rounded-[32px] font-black text-[12px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-xl active:scale-95 group"
              >
                <ArrowLeft
                  size={20}
                  className="group-hover:-translate-x-2 transition-transform"
                />{' '}
                Return to Master Hub
              </button>
            )}

            {activeClient && (
              <div className="flex items-center gap-6 mb-16">
                <OrgLogo
                  src={activeClient.logoUrl}
                  alt={activeClient.schoolName}
                  size="md"
                  className="scale-110"
                />
                <div className="overflow-hidden">
                  <h1 className="font-black text-gray-900 tracking-tighter truncate text-xl uppercase leading-tight">
                    {activeClient.schoolName}
                  </h1>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                    {userRole} Identity
                  </p>
                </div>
              </div>
            )}
            <nav className="flex-1 space-y-4">
              <button className="w-full text-left p-6 rounded-[32px] bg-[var(--primary)] text-white font-black text-xs uppercase tracking-widest flex items-center gap-5 shadow-2xl transition-all hover:scale-[1.02]">
                <LayoutDashboard size={24} /> Control Dashboard
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full text-left p-6 rounded-[32px] hover:bg-gray-50 text-gray-500 font-black text-xs uppercase tracking-widest flex items-center gap-5 transition-all"
              >
                <Settings size={24} /> Config Settings
              </button>
            </nav>
            {currentUser && (
              <div
                className={`pt-10 mt-auto border-t ${
                  THEMES[dashboardTheme as keyof typeof THEMES]?.border ||
                  'border-gray-200'
                } flex flex-col gap-8`}
              >
                {/* Interactive Real-Time Theme Selector */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                    Dashboard Theme Selector
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {Object.entries(THEMES).map(([k, t]) => (
                      <button
                        key={k}
                        onClick={() => setDashboardTheme(k)}
                        title={t.label}
                        className={`w-6 h-6 rounded-full transition-all border-2 ${
                          dashboardTheme === k
                            ? 'border-[var(--primary)] scale-125 shadow-md'
                            : 'border-transparent opacity-60 hover:opacity-100 hover:scale-110'
                        } ${t.thumb}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-black text-lg border-2 border-[var(--primary)]/20 shadow-inner">
                    {(currentUser.name || '?')[0]}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-sm font-black text-gray-900 truncate uppercase tracking-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      {userRole}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAppMode('login');
                      setIsSuperAdminSession(false);
                    }}
                    className="p-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                    title="Exit Portal"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            )}
          </aside>
          <main
            className={`flex-1 p-6 md:p-10 lg:p-16 xl:p-20 overflow-y-auto ${
              THEMES[dashboardTheme as keyof typeof THEMES]?.main || 'bg-white'
            }`}
          >
            <div className="max-w-7xl mx-auto">
              {userRole === 'Admin' && activeClient && (
                <AdminView
                  tenant={activeClient}
                  users={users}
                  setUsers={setUsers}
                  courses={courses}
                  setCourses={setCourses}
                  classes={classes}
                  setClasses={setClasses}
                  announcements={announcements}
                  setAnnouncements={setAnnouncements}
                  onLoginAsTeacher={(t: any) => {
                    setCurrentUser(t);
                    setUserRole('Teacher');
                  }}
                  notify={setToastMessage}
                />
              )}
              {userRole === 'Teacher' && activeClient && (
                <TeacherView
                  teacher={currentUser}
                  classes={classes}
                  setClasses={setClasses}
                  users={users}
                  setUsers={setUsers}
                  notify={setToastMessage}
                  announcements={announcements.filter(
                    (a) =>
                      a.clientId === activeClient.id &&
                      (a.targetRole === 'All' || a.targetRole === 'Teacher')
                  )}
                />
              )}
              {userRole === 'Student' && activeClient && (
                <StudentView
                  student={
                    users.find((u) => u.id === currentUser?.id) || currentUser
                  }
                  classes={classes}
                  tenant={activeClient}
                  setClasses={setClasses}
                  notify={setToastMessage}
                  announcements={announcements.filter(
                    (a) =>
                      a.clientId === activeClient.id &&
                      (a.targetRole === 'All' || a.targetRole === 'Student')
                  )}
                />
              )}
            </div>
          </main>
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {appMode !== 'login' && (
        <div className="fixed bottom-12 right-12 z-[150] group">
          <div className="flex items-center gap-6 bg-[#0F172A] text-white p-8 rounded-[48px] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.4)] opacity-0 group-hover:opacity-100 transition-all translate-y-6 group-hover:translate-y-0">
            <ShieldCheck size={28} className="text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
                Global SaaS Switching
              </span>
              <select
                value={activeClient?.id}
                onChange={(e) => {
                  const client = clients.find((c) => c.id === e.target.value);
                  setActiveClient(client);
                  setDashboardTheme(client?.dashboardTheme || 'white');
                }}
                className="bg-transparent text-sm font-black outline-none border-none cursor-pointer uppercase tracking-tighter"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="text-black">
                    {c.schoolName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <Modal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          title="Personal Config Settings"
        >
          <form onSubmit={handleUpdateSettings} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-4 tracking-widest">
                Full Name / Display Name
              </label>
              <input
                required
                name="name"
                defaultValue={currentUser?.name}
                className="w-full p-6 border-2 border-gray-200 bg-gray-50 rounded-[32px] outline-none focus:border-[var(--primary)] font-black text-gray-900"
              />
            </div>

            {userRole !== 'Admin' && (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 ml-4 tracking-widest">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={currentUser?.email}
                    className="w-full p-6 border-2 border-gray-200 bg-gray-50 rounded-[32px] outline-none focus:border-[var(--primary)] font-bold text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 ml-4 tracking-widest">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={currentUser?.phone}
                    className="w-full p-6 border-2 border-gray-200 bg-gray-50 rounded-[32px] outline-none focus:border-[var(--primary)] font-bold text-gray-900"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-4 tracking-widest">
                  Login Username
                </label>
                <input
                  required
                  name="username"
                  defaultValue={currentUser?.username}
                  className="w-full p-6 border-2 border-gray-200 bg-gray-50 rounded-[32px] outline-none focus:border-[var(--primary)] font-black text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-4 tracking-widest">
                  Login Password
                </label>
                <input
                  required
                  type="text"
                  name="password"
                  defaultValue={currentUser?.password}
                  className="w-full p-6 border-2 border-gray-200 bg-gray-50 rounded-[32px] outline-none focus:border-[var(--primary)] font-black text-gray-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--primary)] text-white py-6 rounded-[32px] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >
              Save Config Settings
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
