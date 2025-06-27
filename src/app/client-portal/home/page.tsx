
"use client";

import * as React from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import { PlaceholderCard } from '@/components/dashboard/placeholder-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from '@/components/ui/textarea';

import {
  MessageSquare,
  UserPlus,
  ListChecks,
  CalendarPlus,
  Briefcase, // Using Briefcase for Opportunity icon
  FilePenLine,
  Trash2,
  UploadCloud,
  CalendarDays,
  Clock,
  PlayCircle,
  Star,
  CircleDollarSign,
  UserCircle2,
  Settings,
  MoreHorizontal,
  Filter as FilterIcon,
  Tag as TagIcon,
  KanbanSquare,
  FileText,
  BarChart2,
  ChevronDown,
} from "lucide-react";

// Dynamically import ReactQuill to avoid SSR issues and memoize it
const ReactQuill = React.useMemo(() => dynamic(() => import('react-quill'), { ssr: false }), []);


export default function ClientPortalHomePage() {
  const [isClient, setIsClient] = React.useState(false);
  const [updatePostText, setUpdatePostText] = React.useState("");

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
  ];

  return (
    <main className="min-h-screen p-6 space-y-8 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Home</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 w-full">
          <PlaceholderCard title="Create New">
            <Tabs defaultValue="update" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-muted/30">
                <TabsTrigger value="update" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <MessageSquare className="mr-2 h-4 w-4" /> Update
                </TabsTrigger>
                <TabsTrigger value="contact" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <UserPlus className="mr-2 h-4 w-4" /> Contact
                </TabsTrigger>
                <TabsTrigger value="task" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <ListChecks className="mr-2 h-4 w-4" /> Task
                </TabsTrigger>
                <TabsTrigger value="event" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <CalendarPlus className="mr-2 h-4 w-4" /> Event
                </TabsTrigger>
                <TabsTrigger value="opportunity" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                   <Briefcase className="mr-2 h-4 w-4" /> Opportunity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="update" className="mt-6">
                <div className="flex space-x-4">
                  <div>
                    <Avatar className="w-10 h-10 border-2 border-primary/50">
                      <AvatarFallback className="bg-transparent">
                        <UserCircle2 className="w-7 h-7 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 space-y-4">
                    {isClient && ( 
                        <ReactQuill
                        theme="snow"
                        value={updatePostText}
                        onChange={setUpdatePostText}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Share an update..."
                        className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary rounded-md [&_.ql-editor]:min-h-[120px]"
                        />
                    )}
                    <div className="flex items-center justify-end">
                      <Button onClick={() => console.log("Post content (HTML):", updatePostText)} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6">Post</Button>
                    </div>
                    <div>
                      <Input
                        type="text"
                        placeholder="Tag contacts... (e.g., @Client Name or type to search)"
                        className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary text-sm h-9"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="mt-6">
                 <div className="mb-6 text-center">
                    <p className="text-foreground">
                    Add a new Person – or – add a new
                    <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 mx-1 text-sm">Household</Button> |
                    <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 mx-1 text-sm">Company</Button> |
                    <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 ml-1 text-sm">Trust</Button>
                    </p>
                </div>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <Label htmlFor="prefix">Prefix</Label>
                        <Select>
                        <SelectTrigger id="prefix" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary">
                            <SelectValue placeholder="Prefix" />
                        </SelectTrigger>
                        <SelectContent><SelectItem value="mr">Mr.</SelectItem><SelectItem value="ms">Ms.</SelectItem><SelectItem value="mrs">Mrs.</SelectItem><SelectItem value="dr">Dr.</SelectItem></SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="First" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
                    </div>
                    <div>
                        <Label htmlFor="middleName">Middle</Label>
                        <Input id="middleName" placeholder="Middle" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
                    </div>
                    <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Last" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
                    </div>
                    <div>
                        <Label htmlFor="suffix">Suffix</Label>
                        <Input id="suffix" placeholder="Suffix" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
                    </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="nickname">Nickname</Label>
                        <Input id="nickname" placeholder="Nickname" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
                    </div>
                    <div>
                        <Label htmlFor="maritalStatus">Marital Status</Label>
                        <Select>
                        <SelectTrigger id="maritalStatus" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="married">Married</SelectItem><SelectItem value="divorced">Divorced</SelectItem><SelectItem value="widowed">Widowed</SelectItem></SelectContent>
                        </Select>
                    </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input id="jobTitle" placeholder="Job Title" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
                    </div>
                    <div>
                        <Label htmlFor="companyName">Company</Label>
                        <Input id="companyName" placeholder="Company Name" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
                    </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="householdSelect">Household</Label>
                        <Select>
                        <SelectTrigger id="householdSelect" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary">
                            <SelectValue placeholder="Select or Create Household" />
                        </SelectTrigger>
                        <SelectContent><SelectItem value="existing">Existing Household A</SelectItem><SelectItem value="new">Create New Household</SelectItem></SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="householdName">Household Name</Label>
                        <Input id="householdName" placeholder="Household Name (if new)" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
                    </div>
                    </div>
                    <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="flex items-center space-x-2">
                        <Input type="email" placeholder="Email" className="flex-grow bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
                        <Select>
                        <SelectTrigger className="w-[120px] bg-input border-border/50 text-foreground focus:ring-primary">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent><SelectItem value="home">Home</SelectItem><SelectItem value="work">Work</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                        </Select>
                        <div className="flex items-center space-x-2">
                        <Checkbox id="emailPrimary" />
                        <Label htmlFor="emailPrimary" className="text-sm text-muted-foreground font-normal">Primary?</Label>
                        </div>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    </div>
                    <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="flex items-center space-x-2">
                        <Input type="tel" placeholder="Phone Number" className="flex-grow bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
                        <Input placeholder="Ext." className="w-[70px] bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
                        <Select>
                        <SelectTrigger className="w-[120px] bg-input border-border/50 text-foreground focus:ring-primary">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent><SelectItem value="mobile">Mobile</SelectItem><SelectItem value="home">Home</SelectItem><SelectItem value="work">Work</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                        </Select>
                        <div className="flex items-center space-x-2">
                        <Checkbox id="phonePrimary" />
                        <Label htmlFor="phonePrimary" className="text-sm text-muted-foreground font-normal">Primary?</Label>
                        </div>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    </div>
                    <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input id="tags" placeholder="Add tags (e.g., Prospect, CPA Referral)" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
                    </div>
                    <div>
                    <Label htmlFor="backgroundInfo">Background Information</Label>
                    <Textarea id="backgroundInfo" rows={4} placeholder="Enter background details..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-border/20 mt-8">
                    <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80">Show Additional Fields</Button>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Add Person</Button>
                    </div>
                </div>
              </TabsContent>

              <TabsContent value="task" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="taskName">Task Name</Label>
                    <div className="relative">
                      <Input id="taskName" placeholder="Enter task name..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary pr-10" />
                      <FilePenLine className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2"> <Checkbox id="repeatsTask" /> <Label htmlFor="repeatsTask" className="font-normal text-muted-foreground">Repeats?</Label> </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                      <Label htmlFor="taskDue">Due</Label>
                      <div className="flex items-center gap-2">
                        <Select defaultValue="today">
                          <SelectTrigger id="taskDue" className="bg-input border-border/50 text-foreground focus:ring-primary flex-grow"><SelectValue /></SelectTrigger>
                          <SelectContent> <SelectItem value="today">Today</SelectItem> <SelectItem value="tomorrow">Tomorrow</SelectItem> <SelectItem value="next_week">Next Week</SelectItem> <SelectItem value="custom">Custom</SelectItem> </SelectContent>
                        </Select>
                        <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 whitespace-nowrap">Set Date/Time</Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="taskPriority">Priority</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger id="taskPriority" className="bg-input border-border/50 text-foreground focus:ring-primary"><SelectValue /></SelectTrigger>
                        <SelectContent> <SelectItem value="low">Low</SelectItem> <SelectItem value="medium">Medium</SelectItem> <SelectItem value="high">High</SelectItem> </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="taskCategory">Category</Label>
                     <div className="flex items-center gap-2">
                        <Select>
                          <SelectTrigger id="taskCategory" className="bg-input border-border/50 text-foreground focus:ring-primary flex-grow"> <SelectValue placeholder="Select category" /> </SelectTrigger>
                          <SelectContent> <SelectItem value="meeting_prep">Meeting Prep</SelectItem> <SelectItem value="follow_up">Follow Up</SelectItem> <SelectItem value="paperwork">Paperwork</SelectItem> <SelectItem value="documentation">Documentation</SelectItem> <SelectItem value="client_communication">Client Communication</SelectItem> <SelectItem value="internal_review">Internal Review</SelectItem> <SelectItem value="uncategorized">Uncategorized</SelectItem> </SelectContent>
                        </Select>
                        <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 whitespace-nowrap">Edit Categories</Button>
                      </div>
                  </div>
                  <div>
                    <Label htmlFor="taskDescription">Description</Label>
                    <Textarea id="taskDescription" rows={5} placeholder="Add more details..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary resize-none" />
                  </div>
                  <div>
                    <Label htmlFor="taskAttachments">Attachments</Label>
                    <div className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-border/50 border-dashed rounded-md bg-input/50 cursor-pointer hover:border-primary/70 transition-colors">
                      <div className="space-y-1 text-center">
                        <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground"> <span className="font-medium text-primary">Drag files here</span> or click to upload </p>
                        <p className="text-xs text-muted-foreground/70">PNG, JPG, PDF up to 10MB</p>
                      </div>
                    </div>
                  </div>
                  <div> <Label htmlFor="taskRelatedTo">Related To</Label> <Input id="taskRelatedTo" placeholder="Contact, project, or opportunity..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /> </div>
                  <div className="flex justify-end pt-4 border-t border-border/20 mt-8"> <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Add Task</Button> </div>
                </div>
              </TabsContent>

              <TabsContent value="event" className="mt-6">
                 <div className="space-y-6">
                  <div> <Label htmlFor="eventName">Event Name</Label> <Input id="eventName" placeholder="Enter event name..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /> </div>
                  <div>
                    <Label htmlFor="eventCategory">Category</Label>
                    <div className="flex items-center gap-2">
                      <Select>
                        <SelectTrigger id="eventCategory" className="bg-input border-border/50 text-foreground focus:ring-primary flex-grow"> <SelectValue placeholder="Uncategorized" /> </SelectTrigger>
                        <SelectContent> <SelectItem value="uncategorized">Uncategorized</SelectItem> <SelectItem value="meeting">Meeting</SelectItem> <SelectItem value="client_review">Client Review</SelectItem> <SelectItem value="prospect_introduction">Prospect Introduction</SelectItem> <SelectItem value="social_event">Social Event</SelectItem> <SelectItem value="conference">Conference</SelectItem> </SelectContent>
                      </Select>
                      <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 whitespace-nowrap">Edit Categories</Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Date &amp; Time</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-x-3 gap-y-2 items-center">
                      <div className="md:col-span-2"> <Input type="text" placeholder="Start Date" aria-label="Start Date" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /> </div>
                      <div className="sm:col-span-1"> <Input type="text" placeholder="Start Time" aria-label="Start Time" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /> </div>
                      <div className="text-center text-muted-foreground hidden md:block">to</div>
                      <div className="md:col-span-2"> <Input type="text" placeholder="End Date" aria-label="End Date" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /> </div>
                      <div className="sm:col-span-1"> <Input type="text" placeholder="End Time" aria-label="End Time" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /> </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-start space-x-6">
                    <div className="flex items-center space-x-2"> <Checkbox id="allDayEvent" /> <Label htmlFor="allDayEvent" className="font-normal text-muted-foreground">All day?</Label> </div>
                    <div className="flex items-center space-x-2"> <Checkbox id="repeatsEvent" /> <Label htmlFor="repeatsEvent" className="font-normal text-muted-foreground">Repeats?</Label> </div>
                  </div>
                  <div>
                    <Label htmlFor="eventStatus">Status</Label>
                    <Select>
                      <SelectTrigger id="eventStatus" className="bg-input border-border/50 text-foreground focus:ring-primary"> <SelectValue placeholder="Select status" /> </SelectTrigger>
                      <SelectContent> <SelectItem value="busy">Busy</SelectItem> <SelectItem value="free">Free</SelectItem> <SelectItem value="tentative">Tentative</SelectItem> <SelectItem value="out_of_office">Out of Office</SelectItem> </SelectContent>
                    </Select>
                  </div>
                  <div> <Label htmlFor="eventLocation">Location</Label> <Input id="eventLocation" placeholder="Enter location (e.g., Zoom, Office, Conference Room A)" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /> </div>
                  <div>
                    <Label htmlFor="eventDescription">Description</Label>
                    <Textarea id="eventDescription" rows={5} placeholder="Add event details, agenda, notes..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary resize-none" />
                  </div>
                  <div> <Label htmlFor="eventRelatedTo">Related To</Label> <Input id="eventRelatedTo" placeholder="Contact, project, or opportunity..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /> </div>
                  <div> <Label htmlFor="eventAttending">Attending</Label> <Input id="eventAttending" placeholder="Search users or resources..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /> </div>
                  <div> <Label htmlFor="eventInvite">Invite</Label> <Input id="eventInvite" placeholder="Search contacts to invite..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /> </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2"> <Checkbox id="sendEventInvitations" /> <Label htmlFor="sendEventInvitations" className="font-normal text-muted-foreground text-sm"> Send email invitations to new invitees and BCC the event creator </Label> </div>
                    <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 text-sm whitespace-nowrap">Preview Invite</Button>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-border/20 mt-8"> <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Add Event</Button> </div>
                </div>
              </TabsContent>

              <TabsContent value="opportunity" className="mt-6">
                <div className="space-y-6">
                  <div> <Label htmlFor="opportunityName">Opportunity Name</Label> <Input id="opportunityName" placeholder="Enter opportunity name..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /> </div>
                  <div> <Label htmlFor="opportunityContact">Contact</Label> <Input id="opportunityContact" placeholder="Search for a contact..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /> </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="opportunityPipeline">Pipeline</Label>
                      <Select>
                        <SelectTrigger id="opportunityPipeline" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary"> <SelectValue placeholder="Select pipeline" /> </SelectTrigger>
                        <SelectContent> <SelectItem value="pipelineA">Pipeline A</SelectItem> <SelectItem value="pipelineB">Pipeline B</SelectItem> </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="opportunityStage">Stage</Label>
                      <Select>
                        <SelectTrigger id="opportunityStage" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary"> <SelectValue placeholder="Select stage" /> </SelectTrigger>
                        <SelectContent> <SelectItem value="stage1">Qualification</SelectItem> <SelectItem value="stage2">Proposal</SelectItem> <SelectItem value="stage3">Negotiation</SelectItem> <SelectItem value="stage4">Closed Won</SelectItem> <SelectItem value="stage5">Closed Lost</SelectItem> </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div> <Label htmlFor="opportunityNextStep">Next Step</Label> <Input id="opportunityNextStep" placeholder="Describe next action..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /> </div>
                  <div>
                    <Label htmlFor="opportunityProbability">Probability</Label>
                    <Select>
                      <SelectTrigger id="opportunityProbability" className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary"> <SelectValue placeholder="Select probability" /> </SelectTrigger>
                      <SelectContent> <SelectItem value="10">10%</SelectItem> <SelectItem value="25">25%</SelectItem> <SelectItem value="50">50%</SelectItem> <SelectItem value="75">75%</SelectItem> <SelectItem value="90">90%</SelectItem> </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <div className="flex items-center space-x-2">
                      <Input type="number" placeholder="0.00" className="flex-grow bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" />
                      <Select>
                        <SelectTrigger className="w-[150px] bg-input border-border/50 text-foreground focus:ring-primary"> <SelectValue placeholder="Type/Fee" /> </SelectTrigger>
                        <SelectContent> <SelectItem value="recurring">Recurring Fee</SelectItem> <SelectItem value="one_time">One-Time Project</SelectItem> <SelectItem value="aum_based">AUM Based</SelectItem> </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div> <Label htmlFor="opportunityTargetClose">Target Close</Label> <Input id="opportunityTargetClose" type="text" placeholder="Select date..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary" /> </div>
                  <div> <Label htmlFor="opportunityDescription">Description</Label> <Textarea id="opportunityDescription" rows={4} placeholder="Add details about the opportunity..." className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary resize-none" /> </div>
                  <div className="flex justify-end pt-4 border-t border-border/20 mt-8"> <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Add Opportunity</Button> </div>
                </div>
              </TabsContent>
            </Tabs>
          </PlaceholderCard>
        </div>

        <div className="lg:col-span-1 space-y-6 lg:space-y-8">
          <PlaceholderCard title="Events" icon={CalendarDays} headerActions={<Button variant="link" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto">View All</Button>}>
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <CalendarDays className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">You have no events for today or tomorrow.</p>
            </div>
          </PlaceholderCard>
          <PlaceholderCard title="Workflows" icon={PlayCircle} headerActions={ <Button variant="link" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto"> View All </Button> } >
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <PlayCircle className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">You have no workflows in progress.</p>
            </div>
          </PlaceholderCard>
          <PlaceholderCard title="Tasks" icon={ListChecks} headerActions={<Button variant="link" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto">View All</Button>}>
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <ListChecks className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">You have no tasks for this week.</p>
            </div>
          </PlaceholderCard>
           <PlaceholderCard title="Special Dates (next 7 days)" icon={Star} headerActions={<Button variant="link" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto">View Calendar</Button>}>
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <Star className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">You have no contacts with special dates in the next week.</p>
            </div>
          </PlaceholderCard>
          <PlaceholderCard title="Opportunities (next 30 days)" icon={CircleDollarSign} headerActions={<Button variant="link" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto">View Pipeline</Button>}>
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <CircleDollarSign className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">You have no open opportunities in the next 30 days.</p>
            </div>
          </PlaceholderCard>
        </div>
      </div>
    </main>
  );
}
