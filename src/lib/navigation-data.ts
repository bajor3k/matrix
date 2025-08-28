
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
    { id: 'Reports', title: 'Reports' },
    { id: 'CRM', title: 'CRM' },
    { id: 'Analytics', title: 'Analytics' },
    { id: 'Resources', title: 'Resources' },
];

export const navigationData: Record<ToolbarSectionKey | 'Other', NavItem[]> = {
  'Reports': [
    { name: 'Advisory Fees Cash', icon: FileStack, href: '/reports/3m-cash' },
    { name: 'Cash Balance', icon: Wallet, href: '/reports/cash-alerts' },
    { name: 'Margin', icon: Percent, href: '/reports/margin-notify' },
    { name: 'Advisory Fees', icon: BadgeDollarSign, href: '/reports/advisor-summary' },
    { name: 'Test', icon: FlaskConical, href: '/reports/billing-coverage' },
  ],
  'CRM': [
    { name: 'Home', icon: HomeIcon, href: '/client-portal/home' },
    { name: 'Email', icon: Mail, href: '/client-portal/email' },
    { name: 'Contacts', icon: ContactIcon, href: '/client-portal/contacts' },
    { name: 'Tasks', icon: ListChecks, href: '/client-portal/tasks' },
    { name: 'Workflows', icon: Workflow, href: '/client-portal/workflows'},
    { name: 'Calendar', icon: CalendarDays, href: '/client-portal/calendar' },
    { name: 'Opportunities', icon: Briefcase, href: '/client-portal/opportunities' },
    { name: 'Projects', icon: KanbanSquare, href: '/client-portal/projects'},
    { name: 'Files', icon: FileText, href: '/client-portal/files'},
  ],
  'Analytics': [
    { name: 'Asset Analytics', icon: BarChart3, href: '/asset-analytics' },
    { name: 'Client Analytics', icon: Users, href: '/client-analytics' },
    { name: 'Financial Analytics', icon: TrendingUp, href: '/financial-analytics' },
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
