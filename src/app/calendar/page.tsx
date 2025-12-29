
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isToday,
  isSameDay,
  isSameMonth,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Event, MOCK_EVENTS } from './mock-events';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    start: new Date(),
    end: new Date(),
    allDay: false,
    color: '#7C3AED',
  });

  const firstDayOfMonth = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const lastDayOfMonth = useMemo(() => endOfMonth(currentDate), [currentDate]);

  const monthDays = useMemo(() => {
    const start = startOfWeek(firstDayOfMonth);
    const end = endOfWeek(lastDayOfMonth);
    const days = eachDayOfInterval({ start, end });
    return days.map(day => ({
      day: format(day, 'd'),
      fullDate: day,
      isCurrentMonth: isSameMonth(day, firstDayOfMonth),
    }));
  }, [firstDayOfMonth, lastDayOfMonth]);

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) return;
    const newId = `event-${Date.now()}`;
    setEvents([...events, { id: newId, ...newEvent } as Event]);
    setIsAddEventDialogOpen(false);
    setNewEvent({ title: '', start: new Date(), end: new Date(), allDay: false, color: '#7C3AED' });
  };
  
  const getEventsForDay = (day: Date) => {
    return events
      .filter(event => isSameDay(event.start, day))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  };

  const openQuickAddDialogForDate = (date: Date) => {
    setNewEvent({ 
      title: '', 
      start: date, 
      end: date, 
      allDay: true, // Default to all-day for quick add
      color: '#7C3AED' 
    });
    setIsAddEventDialogOpen(true);
  };
  
  // New logic for upcoming events sidebar
  const upcomingEvents = events
    .filter(event => event.start >= new Date()) // Only future events
    .sort((a, b) => a.start.getTime() - b.start.getTime()) // Sort nearest first
    .slice(0, 5); // Limit to 5


  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] flex-col lg:flex-row p-4 lg:p-6 gap-6 bg-background text-foreground">
      
      {/* Main Calendar Section */}
      <main className="flex-1 bg-card rounded-xl border shadow-sm flex flex-col">
        {/* Calendar Header */}
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-bold w-40 text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
          </div>
          <Button onClick={() => setIsAddEventDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Event
          </Button>
        </header>
        
        {/* Month View */}
        <div className="flex flex-col flex-1 overflow-auto">
          {/* Day Headers */}
          <div className="grid grid-cols-7 sticky top-0 bg-card z-10 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground uppercase">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 flex-1">
            {monthDays.map((dayObj, index) => {
              const dayEvents = getEventsForDay(dayObj.fullDate);
              const isCurrentDay = dayObj.fullDate && isToday(dayObj.fullDate);
              
              return (
                <div 
                  key={index}
                  className={cn(
                    "min-h-[120px] p-3 border-[0.5px] border-border/40 relative transition-all hover:bg-muted/5 cursor-pointer group",
                    dayObj.isCurrentMonth ? "bg-background" : "bg-muted/5 text-muted-foreground/50"
                  )}
                  onClick={() => dayObj.fullDate && openQuickAddDialogForDate(dayObj.fullDate)}
                >
                  {/* Date Number */}
                  <div className="flex justify-between items-start">
                    <span className={cn(
                      "text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                      isCurrentDay 
                        ? "bg-orange-400 text-white shadow-sm" 
                        : "text-foreground/70 group-hover:text-foreground"
                    )}>
                      {dayObj.day}
                    </span>
                  </div>
                  
                  {/* Event Dots Container */}
                  <div className="mt-3 flex flex-wrap gap-1.5 content-start px-1">
                    {dayEvents.slice(0, 8).map((event) => (
                      <div 
                        key={event.id}
                        className="h-2 w-2 rounded-full transition-transform hover:scale-150 ring-0 ring-offset-0"
                        style={{ backgroundColor: event.color || 'hsl(var(--primary))' }}
                        title={`${event.title} (${format(event.start, 'h:mm a')})`}
                      />
                    ))}
                    {dayEvents.length > 8 && (
                      <span className="text-[10px] text-muted-foreground leading-none flex items-center">+</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      
      {/* Right Sidebar */}
      <aside className="lg:w-80 shrink-0 space-y-6">
        <div className="bg-card rounded-xl border shadow-sm p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg tracking-tight">Upcoming</h3>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Next 30 Days</span>
          </div>

          <div className="space-y-6 flex-1">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground text-sm">No upcoming events.</p>
              </div>
            ) : (
              upcomingEvents.map(event => (
                <div key={event.id} className="flex gap-4 items-start group cursor-default">
                   <div className="flex flex-col items-center min-w-[3rem]">
                      <span className="text-xs font-bold text-muted-foreground uppercase">{format(event.start, 'MMM')}</span>
                      <span className="text-xl font-bold text-foreground">{format(event.start, 'd')}</span>
                   </div>
                   <div className="w-[2px] h-10 bg-border/50 rounded-full" />
                   <div className="pb-2">
                      <p className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {event.allDay ? 'All Day' : format(event.start, 'h:mm a')}
                      </p>
                   </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-auto pt-6 border-t">
            <Button className="w-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" onClick={() => setIsAddEventDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Event
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Add Event Dialog */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="all-day"
                checked={newEvent.allDay}
                onCheckedChange={(checked) => setNewEvent({ ...newEvent, allDay: !!checked })}
              />
              <Label htmlFor="all-day">All-day event</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newEvent.start ? format(newEvent.start, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newEvent.start}
                      onSelect={(date) => setNewEvent({ ...newEvent, start: date, end: date })} // Also update end date for simplicity
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newEvent.end ? format(newEvent.end, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newEvent.end}
                      onSelect={(date) => setNewEvent({ ...newEvent, end: date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEvent}>Save Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Mock Data - moved to a separate file for cleanliness but included here for completeness
const today = new Date();
const MOCK_EVENTS_INITIAL: Event[] = [
  { id: '1', title: 'Q4 Portfolio Review', start: new Date(today.getFullYear(), today.getMonth(), 2, 10, 0), end: new Date(today.getFullYear(), today.getMonth(), 2, 11, 0), color: '#3b82f6', allDay: false },
  { id: '2', title: 'Client Onboarding - Smith', start: new Date(today.getFullYear(), today.getMonth(), 5), end: new Date(today.getFullYear(), today.getMonth(), 5), color: '#10b981', allDay: true },
  { id: '3', title: 'Team Sync', start: new Date(today.getFullYear(), today.getMonth(), 5, 14, 0), end: new Date(today.getFullYear(), today.getMonth(), 5, 15, 0), color: '#f97316', allDay: false },
  { id: '4', title: 'Compliance Training', start: new Date(today.getFullYear(), today.getMonth(), 15), end: new Date(today.getFullYear(), today.getMonth(), 16), color: '#ef4444', allDay: true },
  { id: '5', title: 'Follow up with Johnson account', start: new Date(today.getFullYear(), today.getMonth(), 18, 9, 0), end: new Date(today.getFullYear(), today.getMonth(), 18, 9, 30), color: '#8b5cf6', allDay: false },
  { id: '6', title: 'Lunch with lead prospect', start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0), color: '#10b981', allDay: false },
  { id: '7', title: 'Dentist Appointment', start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 16, 0), end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 17, 0), color: '#64748b', allDay: false },
];
