
export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color?: string;
}

const today = new Date();

export const MOCK_EVENTS: Event[] = [
  { 
    id: '1', 
    title: 'Q4 Portfolio Review with J. Anderson', 
    start: new Date(today.getFullYear(), today.getMonth(), 2, 10, 0), 
    end: new Date(today.getFullYear(), today.getMonth(), 2, 11, 0), 
    color: 'hsl(var(--chart-1))', 
    allDay: false 
  },
  { 
    id: '2', 
    title: 'Finalize Smith Trust documents', 
    start: new Date(today.getFullYear(), today.getMonth(), 5), 
    end: new Date(today.getFullYear(), today.getMonth(), 5), 
    color: 'hsl(var(--chart-2))', 
    allDay: true 
  },
  { 
    id: '3', 
    title: 'Team Sync - Weekly', 
    start: new Date(today.getFullYear(), today.getMonth(), 5, 14, 0), 
    end: new Date(today.getFullYear(), today.getMonth(), 5, 15, 0), 
    color: 'hsl(var(--chart-4))', 
    allDay: false 
  },
  { 
    id: '4', 
    title: 'Compliance Training (Annual)', 
    start: new Date(today.getFullYear(), today.getMonth(), 15), 
    end: new Date(today.getFullYear(), today.getMonth(), 16), 
    color: 'hsl(var(--chart-5))', 
    allDay: true 
  },
  { 
    id: '5', 
    title: 'Follow up call with Johnson account', 
    start: new Date(today.getFullYear(), today.getMonth(), 18, 9, 0), 
    end: new Date(today.getFullYear(), today.getMonth(), 18, 9, 30), 
    color: 'hsl(var(--primary))', 
    allDay: false 
  },
  { 
    id: '6', 
    title: 'Lunch with lead prospect (T. Williams)', 
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0), 
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0), 
    color: 'hsl(var(--chart-2))', 
    allDay: false 
  },
  { 
    id: '7', 
    title: 'Dentist Appointment', 
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 16, 0), 
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 17, 0), 
    color: 'hsl(var(--muted-foreground))', 
    allDay: false 
  },
  { 
    id: '8', 
    title: 'Prepare for Market Outlook Webinar', 
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0), 
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30), 
    color: 'hsl(var(--chart-4))', 
    allDay: false 
  },
];
