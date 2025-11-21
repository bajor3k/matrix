// src/app/project/page.tsx
"use client";

import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from "@hello-pangea/dnd";
import React, { useState, useEffect } from "react";
import { GripVertical, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/firebase/config";
import { collection, query, onSnapshot, updateDoc, doc, addDoc, deleteDoc, orderBy, serverTimestamp, where } from "firebase/firestore";

interface Task {
  id: string;
  content: string;
  description?: string;
  status: 'todo' | 'inprogress' | 'done';
  order: number;
  createdAt: any; 
  updatedAt: any;
}

interface Columns {
  todo: { name: string; items: Task[] };
  inprogress: { name: string; items: Task[] };
  done: { name: string; items: Task[] };
}

export default function ProjectPage() {
  const [columns, setColumns] = useState<Columns>({
    todo: { name: "To Do", items: [] },
    inprogress: { name: "In Progress", items: [] },
    done: { name: "Completed", items: [] },
  });
  
  const [newItemInputs, setNewItemInputs] = useState({ todo: '', inprogress: '', done: '' });
  const [isAdding, setIsAdding] = useState({ todo: false, inprogress: false, done: false });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalColumn, setModalColumn] = useState<keyof Columns | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "tasks"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allTasks: Task[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task));
      
      setColumns({
        todo: { name: "To Do", items: allTasks.filter(t => t.status === 'todo') },
        inprogress: { name: "In Progress", items: allTasks.filter(t => t.status === 'inprogress') },
        done: { name: "Completed", items: allTasks.filter(t => t.status === 'done') },
      });
    });
    return () => unsubscribe();
  }, []);

  const openAddModal = (columnId: keyof Columns) => {
    setModalColumn(columnId);
    setIsAddModalOpen(true);
  };

  const handleAddItem = async () => {
    if (!newCardTitle.trim() || !modalColumn) return;

    const itemsInColumn = columns[modalColumn].items;
    const newOrder = itemsInColumn.length > 0 ? Math.max(...itemsInColumn.map(t => t.order)) + 1 : 0;
    
    await addDoc(collection(db, "tasks"), {
      content: newCardTitle,
      description: newCardDescription,
      status: modalColumn,
      order: newOrder,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    setNewCardTitle('');
    setNewCardDescription('');
    setIsAddModalOpen(false);
    setModalColumn(null);

    toast({
      title: "Card Added",
      description: `"${newCardTitle}" has been added to the board.`,
    });
  };

  const onDragEnd: OnDragEndResponder = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceColId = source.droppableId as keyof Columns;
    const destColId = destination.droppableId as keyof Columns;

    if (sourceColId === destColId) {
      // Reordering within the same column
      const column = columns[sourceColId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);

      setColumns(prev => ({ ...prev, [sourceColId]: { ...column, items: copiedItems }}));

      // Update Firestore order for all items in the column
      const updates = copiedItems.map((item, index) => 
        updateDoc(doc(db, "tasks", item.id), { order: index, updatedAt: serverTimestamp() })
      );
      await Promise.all(updates);

    } else {
      // Moving to a different column
      const sourceCol = columns[sourceColId];
      const destCol = columns[destColId];
      const sourceItems = [...sourceCol.items];
      const destItems = [...destCol.items];
      const [removed] = sourceItems.splice(source.index, 1);
      
      destItems.splice(destination.index, 0, removed);
      
      setColumns(prev => ({
        ...prev,
        [sourceColId]: { ...sourceCol, items: sourceItems },
        [destColId]: { ...destCol, items: destItems },
      }));

      // Update Firestore for the moved item and re-order both columns
      const movedItemUpdate = updateDoc(doc(db, "tasks", removed.id), { status: destColId });
      const sourceUpdates = sourceItems.map((item, index) => updateDoc(doc(db, "tasks", item.id), { order: index, updatedAt: serverTimestamp() }));
      const destUpdates = destItems.map((item, index) => updateDoc(doc(db, "tasks", item.id), { order: index, updatedAt: serverTimestamp() }));
      
      await Promise.all([movedItemUpdate, ...sourceUpdates, ...destUpdates]);
    }
  };
  
  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };
  
  const handleMoveTask = async (taskId: string, newStatus: keyof Columns) => {
    const currentStatus = selectedTask?.status;
    if (!currentStatus || currentStatus === newStatus) return;

    // This logic is a simplified version of drag-and-drop. For robustness, it should also re-order.
    await updateDoc(doc(db, "tasks", taskId), { status: newStatus, updatedAt: serverTimestamp() });
    setIsDrawerOpen(false);
    toast({ title: "Task Moved", description: `Task moved to ${columns[newStatus].name}`});
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, "tasks", taskId));
    setIsDrawerOpen(false);
    toast({ title: "Task Deleted", variant: "destructive"});
  };

  return (
    <main className="min-h-screen flex-1 p-6 space-y-6 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Project</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full h-full">
          {Object.entries(columns).map(([id, column]) => (
            <div key={id} className="flex flex-col">
              <h2 className="text-lg font-semibold mb-4 px-1">{column.name} ({column.items.length})</h2>
              <div
                className={cn(
                  "rounded-xl p-3 bg-card/60 backdrop-blur-sm border border-white/10",
                  "h-[calc(100vh-14rem)] flex flex-col"
                )}
              >
                <Droppable droppableId={id} key={id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={cn(
                          "flex-grow overflow-y-auto scroll-invisible pr-1",
                          snapshot.isDraggingOver ? "bg-primary/10" : ""
                      )}
                    >
                      {column.items.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => openTaskDetails(item)}
                              className={cn(
                                  "p-3 mb-3 rounded-lg shadow-lg border backdrop-blur-sm flex items-start gap-2",
                                  "transform-gpu transition-all duration-150 ease-out",
                                  "hover:scale-[1.03] hover:shadow-primary/20 hover:border-primary/40",
                                  snapshot.isDragging ? "bg-primary/20 border-primary/50 scale-[1.03]" : "bg-muted/50 border-border/30"
                              )}
                              style={{ ...provided.draggableProps.style }}
                            >
                              <GripVertical className="h-5 w-5 text-muted-foreground/50 mt-0.5 shrink-0 cursor-grab" />
                              <span className="text-sm text-foreground flex-grow">{item.content}</span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                 <div className="mt-2 pt-2 flex-shrink-0">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      onClick={() => openAddModal(id as keyof Columns)}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add a card
                    </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
      
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-card/90 backdrop-blur-md border-border/50">
          <DialogHeader>
            <DialogTitle>Add New Card to {modalColumn ? columns[modalColumn].name : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div>
                <Label htmlFor="card-title">Title</Label>
                <Input id="card-title" value={newCardTitle} onChange={e => setNewCardTitle(e.target.value)} placeholder="Enter a title for this card..."/>
             </div>
             <div>
                <Label htmlFor="card-description">Description (optional)</Label>
                <Textarea id="card-description" value={newCardDescription} onChange={e => setNewCardDescription(e.target.value)} placeholder="Add more details..."/>
             </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleAddItem}>Add Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="bg-card/90 backdrop-blur-md border-l-border/50">
          {selectedTask && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl break-words">{selectedTask.content}</SheetTitle>
                 <SheetDescription>
                    Status: <span className="capitalize font-semibold">{selectedTask.status}</span>
                </SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedTask.description || "No description provided."}</p>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2">Details</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                        <li>Created: {selectedTask.createdAt?.toDate().toLocaleString() || 'N/A'}</li>
                        <li>Updated: {selectedTask.updatedAt?.toDate().toLocaleString() || 'N/A'}</li>
                    </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Move To</h4>
                  <div className="flex flex-col space-y-2">
                    {Object.keys(columns).map(colId => (
                      <Button
                        key={colId}
                        variant="outline"
                        disabled={selectedTask.status === colId}
                        onClick={() => handleMoveTask(selectedTask.id, colId as keyof Columns)}
                      >
                        {columns[colId as keyof Columns].name}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                   <Button variant="destructive" className="w-full" onClick={() => handleDeleteTask(selectedTask.id)}>Delete Card</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

    </main>
  );
}
