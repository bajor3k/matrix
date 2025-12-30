
import type { NavItem, ToolbarSection, ToolbarSectionKey } from '@/contexts/navigation-context';
import {
  Home as HomeIcon,
  Mail,
  Contact as ContactIcon,
  ListChecks,
  CalendarDays,
  Briefcase,
  Workflow,
  KanbanSquare,
  FileText,
  BarChart3,
  Users,
  TrendingUp,
  Repeat,
  ShieldAlert,
  PieChart,
  Shapes,
  FlaskConical,
  LayoutGrid,
  LifeBuoy,
  Calculator,
  GraduationCap,
  Link as LinkIcon,
  Wallet,
  Banknote,
  Percent,
  BadgeDollarSign,
  FileStack,
  BookOpenText,
  Settings,
  Video,
  Terminal,
  TerminalSquare,
  Newspaper,
  Inbox,
  Send,
  Trash2,
  Archive,
  AlertOctagon,
  UploadCloud,
  Cloud,
  Globe,
  Brain,
  Bell,
} from "lucide-react";

export const toolbarSections: ToolbarSection[] = [
    { id: 'Reports', title: 'Reports' },
    { id: 'CRM', title: 'CRM' },
    { id: 'Analytics', title: 'Analytics' },
    { id: 'Resources', title: 'Resources' },
];

export const navigationData: Record<ToolbarSectionKey | 'Other' | 'Standalone' | 'Mail', NavItem[]> = {
  'Reports': [
    { name: 'Advisory Fees', icon: BadgeDollarSign, href: '/reports/advisory-fees'},
    { name: 'Cash', icon: Wallet, href: '/reports/cash'},
  ],
  'CRM': [],
  'Mail': [
    {
      name: 'Inbox',
      href: '/mail/inbox',
      icon: Inbox
    },
    {
      name: 'Drafts',
      href: '/mail/drafts',
      icon: FileText
    },
    {
      name: 'Sent Items',
      href: '/mail/sentitems',
      icon: Send
    },
    {
      name: 'Deleted Items',
      href: '/mail/deleteditems',
      icon: Trash2
    },
    {
      name: 'Archive',
      href: '/mail/archive',
      icon: Archive
    },
    {
      name: 'Junk Email',
      href: '/mail/junkemail',
      icon: AlertOctagon
    },
    {
      name: 'Outbox',
      href: '/mail/outbox',
      icon: UploadCloud
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: CalendarDays
    },
  ],
  'Analytics': [
    { name: 'Asset', icon: BarChart3, href: '/analytics/asset' },
    { name: 'Client', icon: Users, href: '/analytics/client' },
    { name: 'Financial', icon: TrendingUp, href: '/analytics/financial' },
    { name: 'Conversion', icon: Repeat, href: '/analytics/conversion' },
    { name: 'Compliance', icon: ShieldAlert, href: '/analytics/compliance'},
    { name: 'Contribution', icon: TrendingUp, href: '/analytics/contribution' },
  ],
  'Resources': [
    { name: 'OneDrive', icon: Cloud, href: '/resources' },
    { name: 'Procedures', icon: FileText, href: '/resources' },
    { name: 'External', icon: Globe, href: '/resources' },
  ],
  'Other': [
      { name: 'Settings', icon: Settings, href: '/settings' },
  ],
  'Standalone': [
    { name: 'Dashboard', icon: LayoutGrid, href: '/dashboard' },
    { name: 'CRM', icon: Users, href: '/CRM' },
    { name: 'AI Insights', icon: Brain, href: '/ai-insights' },
    { name: 'Alerts', icon: Bell, href: '/alerts' },
    { name: 'Ticket', icon: KanbanSquare, href: '/ticket' },
  ]
};
