
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
  Settings
} from "lucide-react";

export const toolbarSections: ToolbarSection[] = [
    { id: 'CRM', title: 'CRM' },
    { id: 'Analytics', title: 'Analytics' },
    { id: 'Resources', title: 'Resources' },
];

export const navigationData: Record<ToolbarSectionKey | 'Other', NavItem[]> = {
  'Reports': [],
  'CRM': [
    { name: 'Home', icon: HomeIcon, href: '/crm/home' },
    { name: 'Email', icon: Mail, href: '/crm/email' },
    { name: 'Contacts', icon: ContactIcon, href: '/crm/contacts' },
    { name: 'Tasks', icon: ListChecks, href: '/crm/tasks' },
    { name: 'Workflows', icon: Workflow, href: '/crm/workflows'},
    { name: 'Calendar', icon: CalendarDays, href: '/crm/calendar' },
    { name: 'Opportunities', icon: Briefcase, href: '/crm/opportunities' },
    { name: 'Projects', icon: KanbanSquare, href: '/crm/projects'},
    { name: 'Files', icon: FileText, href: '/crm/files'},
  ],
  'Analytics': [
    { name: 'Asset Analytics', icon: BarChart3, href: '/asset-analytics' },
    { name: 'Client Analytics', icon: Users, href: '/client-analytics' },
    { name: 'Financial Analytics', icon: TrendingUp, href: '/financial- analytics' },
    { name: 'Conversion Analytics', icon: Repeat, href: '/conversion-analytics' },
    { name: 'Compliance Matrix', icon: ShieldAlert, href: '/compliance-matrix'},
    { name: 'Contribution Matrix', icon: TrendingUp, href: '/contribution-matrix' },
  ],
  'Resources': [
    { name: 'Quick Links', icon: LinkIcon, href: '/resource-matrix?tab=quick_links' },
    { name: 'Documents', icon: FileText, href: '/resource-matrix?tab=documents' },
    { name: 'Support', icon: LifeBuoy, href: '/resource-matrix?tab=support' },
    { name: 'Tools', icon: Calculator, href: '/resource-matrix?tab=tools' },
    { name: 'Training', icon: GraduationCap, href: '/resource-matrix?tab=training' },
  ],
  'Other': [
      { name: 'Settings', icon: Settings, href: '/settings' },
  ]
};
