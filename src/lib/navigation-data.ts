
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
} from "lucide-react";

export const toolbarSections: ToolbarSection[] = [
    { id: 'Reports', title: 'Reports' },
    { id: 'CRM', title: 'CRM' },
    { id: 'Analytics', title: 'Analytics' },
    { id: 'Resources', title: 'Resources' },
];

export const navigationData: Record<ToolbarSectionKey | 'Other' | 'Standalone', NavItem[]> = {
  'Reports': [
    { name: 'Advisory Fees', icon: BadgeDollarSign, href: '/reports/advisory-fees'},
    { name: 'Cash', icon: Wallet, href: '/reports/cash'},
  ],
  'CRM': [],
  'Analytics': [
    { name: 'Asset Analytics', icon: BarChart3, href: '/analytics/asset' },
    { name: 'Client Analytics', icon: Users, href: '/analytics/client' },
    { name: 'Financial Analytics', icon: TrendingUp, href: '/analytics/financial' },
    { name: 'Conversion Analytics', icon: Repeat, href: '/analytics/conversion' },
    { name: 'Compliance Matrix', icon: ShieldAlert, href: '/analytics/compliance'},
    { name: 'Contribution Matrix', icon: TrendingUp, href: '/analytics/contribution' },
  ],
  'Resources': [
    { name: 'Quick Links', icon: LinkIcon, href: '/resources?tab=quick_links' },
    { name: 'Documents', icon: FileText, href: '/resources?tab=documents' },
    { name: 'Support', icon: LifeBuoy, href: '/resources?tab=support' },
    { name: 'Tools', icon: Calculator, href: '/resources?tab=tools' },
    { name: 'Training', icon: GraduationCap, href: '/resources?tab=training' },
  ],
  'Other': [
      { name: 'Settings', icon: Settings, href: '/settings' },
  ],
  'Standalone': [
    { name: 'Terminal', icon: TerminalSquare, href: '/terminal-2-0' },
    { name: 'Margin', icon: BadgeDollarSign, href: '/margin' },
    { name: 'Project', icon: KanbanSquare, href: '/project'},
    { name: 'CRM', icon: Users, href: '/crm2.0' },
    { name: 'News', icon: Newspaper, href: '/news' },
  ]
};
