
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
import { ChevronLeft, ChevronRight, Plus, PlusCircle, Bold, Italic, Underline, ListChecks, ListOrdered, TableIcon, Link2, Smile, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  
  // State for the full detailed dialog
  const [fullEventTitle, setFullEventTitle] = useState('');
  const [fullEventStartDate, setFullEventStartDate] = useState('');
  const [fullEventStartTime, setFullEventStartTime] = useState('');
  const [fullEventEndDate, setFullEventEndDate] = useState('');
  const [fullEventEndTime, setFullEventEndTime] = useState('');
  const [fullEventAllDay, setFullEventAllDay] = useState(false);


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
                    // Updated Border: dark:border-white/5 is extremely subtle
                    "min-h-[120px] p-3 border-[0.5px] border-gray-200 dark:border-white/5 relative transition-all hover:bg-muted/5 cursor-pointer group",
                    dayObj.isCurrentMonth ? "bg-background" : "bg-gray-50/50 dark:bg-white/5" 
                  )}
                  onClick={() => dayObj.fullDate && openQuickAddDialogForDate(dayObj.fullDate)}
                >
                  {/* Date Number */}
                  <div className="flex justify-between items-start">
                    <span className={cn(
                      "text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                      isCurrentDay 
                        ? "bg-orange-400 text-white shadow-sm" 
                        : dayObj.isCurrentMonth 
                          ? "text-gray-900 dark:text-foreground/70 group-hover:text-black dark:group-hover:text-foreground" 
                          : "text-gray-400 dark:text-muted-foreground/30" 
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
            <h3 className="font-semibold text-lg tracking-tight text-gray-900 dark:text-foreground">Upcoming</h3>
            <span className="text-xs text-gray-600 dark:text-muted-foreground font-medium uppercase tracking-wider">Next 30 Days</span>
          </div>

          <div className="space-y-6 flex-1">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-muted-foreground text-sm">No upcoming events.</p>
              </div>
            ) : (
              upcomingEvents.map(event => (
                <div key={event.id} className="flex gap-4 items-start group cursor-default">
                  <div className="flex flex-col items-center min-w-[3rem]">
                      <span className="text-xs font-bold text-gray-700 dark:text-muted-foreground uppercase">{format(event.start, 'MMM')}</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-foreground">{format(event.start, 'd')}</span>
                  </div>
                  <div className="w-[2px] h-10 bg-border/50 rounded-full" />
                  <div className="pb-2">
                      <p className="font-medium text-sm text-gray-900 dark:text-foreground group-hover:text-primary transition-colors line-clamp-1">{event.title}</p>
                      <p className="text-xs text-gray-600 dark:text-muted-foreground mt-0.5">
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
        <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-card/95 backdrop-blur-md border-gray-200 dark:border-white/10 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-foreground">New Event</DialogTitle>
          </DialogHeader>
          
          <div className="flex-grow overflow-y-auto pr-2 py-4 space-y-6"> 
            {/* Event Name */}
            <div>
              <Label htmlFor="eventName-dialog" className="text-gray-700 dark:text-foreground">Event Name</Label>
              <Input 
                id="eventName-dialog" 
                value={fullEventTitle} 
                onChange={(e) => setFullEventTitle(e.target.value)} 
                placeholder="Enter event name..." 
                className="bg-white dark:bg-input border-gray-300 dark:border-border/50 text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground focus:ring-primary" 
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="eventCategory-dialog" className="text-gray-700 dark:text-foreground">Category</Label>
              <div className="flex items-center gap-2">
                <Select>
                  <SelectTrigger id="eventCategory-dialog" className="bg-white dark:bg-input border-gray-300 dark:border-border/50 text-gray-900 dark:text-foreground focus:ring-primary flex-grow">
                    <SelectValue placeholder="Uncategorized" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uncategorized">Uncategorized</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="client_review">Client Review</SelectItem>
                    <SelectItem value="prospect_introduction">Prospect Introduction</SelectItem>
                    <SelectItem value="social_event">Social Event</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 whitespace-nowrap">Edit Categories</Button>
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-foreground">Date &amp; Time</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-x-3 gap-y-2 items-center">
                <div className="md:col-span-2">
                  <Input type="text" placeholder="Start Date" value={fullEventStartDate} onChange={(e) => setFullEventStartDate(e.target.value)} className="bg-white dark:bg-input border-gray-300 dark:border-border/50 text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground" />
                </div>
                <div className="sm:col-span-1">
                  <Input type="text" placeholder="Start Time" value={fullEventStartTime} onChange={(e) => setFullEventStartTime(e.target.value)} className="bg-white dark:bg-input border-gray-300 dark:border-border/50 text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground" />
                </div>
                <div className="text-center text-gray-500 dark:text-muted-foreground hidden md:block">to</div>
                <div className="md:col-span-2">
                  <Input type="text" placeholder="End Date" value={fullEventEndDate} onChange={(e) => setFullEventEndDate(e.target.value)} className="bg-white dark:bg-input border-gray-300 dark:border-border/50 text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground" />
                </div>
                <div className="sm:col-span-1">
                  <Input type="text" placeholder="End Time" value={fullEventEndTime} onChange={(e) => setFullEventEndTime(e.target.value)} className="bg-white dark:bg-input border-gray-300 dark:border-border/50 text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between sm:justify-start space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox id="allDayEvent-dialog" checked={fullEventAllDay} onCheckedChange={(checked) => setFullEventAllDay(!!checked)} className="border-gray-400 dark:border-primary" />
                <Label htmlFor="allDayEvent-dialog" className="font-normal text-gray-600 dark:text-muted-foreground">All day?</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="repeatsEvent-dialog" className="border-gray-400 dark:border-primary" />
                <Label htmlFor="repeatsEvent-dialog" className="font-normal text-gray-600 dark:text-muted-foreground">Repeats?</Label>
              </div>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="eventStatus-dialog" className="text-gray-700 dark:text-foreground">Status</Label>
              <Select>
                <SelectTrigger id="eventStatus-dialog" className="bg-white dark:bg-input border-gray-300 dark:border-border/50 text-gray-900 dark:text-foreground">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="tentative">Tentative</SelectItem>
                  <SelectItem value="out_of_office">Out of Office</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="eventLocation-dialog" className="text-gray-700 dark:text-foreground">Location</Label>
              <Input id="eventLocation-dialog" placeholder="Enter location..." className="bg-white dark:bg-input border-gray-300 dark:border-border/50 text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground" />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="eventDescription-dialog" className="text-gray-700 dark:text-foreground">Description</Label>
              <Textarea id="eventDescription-dialog" rows={5} placeholder="Add event details..." className="bg-white dark:bg-input border-gray-300 dark:border-border/50 text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground resize-none" />
              <div className="flex items-center space-x-1 text-gray-500 dark:text-muted-foreground mt-2">
                <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-muted/50 h-8 w-8"><Bold className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-muted/50 h-8 w-8"><Italic className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-muted/50 h-8 w-8"><Underline className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-muted/50 h-8 w-8"><ListChecks className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-muted/50 h-8 w-8"><ListOrdered className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-muted/50 h-8 w-8"><TableIcon className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-muted/50 h-8 w-8"><Link2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-muted/50 h-8 w-8"><Smile className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-muted/50 h-8 w-8"><Mic className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Attendees */}
            <div>
              <Label htmlFor="eventAttending-dialog" className="text-gray-700 dark:text-foreground">Attending</Label>
              <Input id="eventAttending-dialog" placeholder="Search users..." className="bg-white dark:bg-input border-gray-300 dark:border-border/50 text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground" />
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="sendEventInvitations-dialog" className="border-gray-400 dark:border-primary" />
                <Label htmlFor="sendEventInvitations-dialog" className="text-sm font-normal text-gray-600 dark:text-muted-foreground">Send email invitations</Label>
              </div>
              <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 text-sm whitespace-nowrap">Preview Invite</Button>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-200 dark:border-border/30">
            <DialogClose asChild><Button variant="outline" className="text-gray-700 dark:text-foreground border-gray-300 dark:border-border">Cancel</Button></DialogClose>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    