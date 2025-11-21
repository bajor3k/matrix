// src/app/project/page.tsx
"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import { GripVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ProjectPage() {
  const [columns, setColumns] = useState({
    todo: {
      name: "To Do",
      items: [
        { id: "1", content: "Finalize Q3 investment strategy document" },
        { id: "2", content: "Schedule portfolio review with the Smith family" },
        { id: "3", content: "Prepare materials for the upcoming compliance audit" },
      ],
    },
    inprogress: {
      name: "In Progress",
      items: [
        { id: "4", content: "Drafting new client onboarding workflow" },
        { id: "5", content: "Analyzing performance of the tech-focused growth fund" },
      ],
    },
    done: {
      name: "Completed",
      items: [{ id: "6", content: "Rebalance the Johnson's retirement portfolio" }],
    },
  });

  const [newItemInputs, setNewItemInputs] = useState({
    todo: '',
    inprogress: '',
    done: ''
  });

  const [isAdding, setIsAdding] = useState({
    todo: false,
    inprogress: false,
    done: false
  });

  const handleInputChange = (columnId: keyof typeof newItemInputs, value: string) => {
    setNewItemInputs(prev => ({ ...prev, [columnId]: value }));
  };

  const handleAddItem = (columnId: keyof typeof columns) => {
    const content = newItemInputs[columnId].trim();
    if (content) {
      const newItem = {
        id: crypto.randomUUID(),
        content: content,
      };
      setColumns(prev => ({
        ...prev,
        [columnId]: {
          ...prev[columnId],
          items: [...prev[columnId].items, newItem],
        },
      }));
      handleInputChange(columnId, '');
      setIsAdding(prev => ({ ...prev, [columnId]: false }));
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same column
      const column = columns[source.droppableId as keyof typeof columns];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      });
    } else {
      // Moving from one column to another
      const sourceCol = columns[source.droppableId as keyof typeof columns];
      const destCol = columns[destination.droppableId as keyof typeof columns];
      const sourceItems = [...sourceCol.items];
      const destItems = [...destCol.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceCol,
          items: sourceItems,
        },
        [destination.droppableId]: {
          ...destCol,
          items: destItems,
        },
      });
    }
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
                              className={cn(
                                  "p-3 mb-3 rounded-lg shadow-lg border backdrop-blur-sm flex items-start gap-2",
                                  snapshot.isDragging ? "bg-primary/20 border-primary/50" : "bg-muted/50 border-border/30"
                              )}
                              style={{
                                ...provided.draggableProps.style,
                              }}
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
                  {isAdding[id as keyof typeof isAdding] ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Enter a title for this card..."
                        className="bg-muted/70 border-border/50 text-sm"
                        value={newItemInputs[id as keyof typeof newItemInputs]}
                        onChange={(e) => handleInputChange(id as keyof typeof newItemInputs, e.target.value)}
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => handleAddItem(id as keyof typeof columns)}>Add Card</Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsAdding(prev => ({...prev, [id]: false}))}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      onClick={() => setIsAdding(prev => ({...prev, [id]: true}))}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add a card
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    </main>
  );
}
