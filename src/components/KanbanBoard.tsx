import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { ticketService, type Ticket } from '../services/ticketService';
import { Link } from 'react-router-dom';

interface KanbanBoardProps {
  tickets: Ticket[];
  onTicketUpdate: (ticketId: string, updates: Partial<Ticket>) => void;
  projects?: Array<{ _id: string; name: string }>;
  showProjectName?: boolean;
}

interface Column {
  id: string;
  title: string;
  color: string;
  bgColor: string;
}

const columns: Column[] = [
  { id: 'OPEN', title: 'Open', color: 'text-red-800', bgColor: 'bg-red-100' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
  { id: 'RESOLVED', title: 'Resolved', color: 'text-green-800', bgColor: 'bg-green-100' },
  { id: 'CLOSED', title: 'Closed', color: 'text-gray-800', bgColor: 'bg-gray-100' },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-100 text-red-800';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800';
    case 'LOW':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const DraggableTicket: React.FC<{ ticket: Ticket; projects: Array<{ _id: string; name: string }>; showProjectName: boolean; isUpdating: string | null }> = ({ 
  ticket, 
  projects, 
  showProjectName, 
  isUpdating 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket._id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p._id === projectId);
    return project?.name || 'Unknown Project';
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`mb-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200 cursor-move transition-all hover:shadow-md ${
        isUpdating === ticket._id ? 'opacity-50' : ''
      } ${isDragging ? 'shadow-lg rotate-2' : ''}`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
            {ticket.title}
          </h4>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
            {ticket.priority}
          </span>
        </div>
        
        <p className="text-gray-600 text-xs line-clamp-2">
          {ticket.description}
        </p>
        
        {showProjectName && (
          <div className="text-xs text-gray-500">
            {getProjectName(ticket.projectId)}
          </div>
        )}
        
        {ticket.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {ticket.labels.slice(0, 2).map((label, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {label}
              </span>
            ))}
            {ticket.labels.length > 2 && (
              <span className="text-xs text-gray-500">
                +{ticket.labels.length - 2} more
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
          <Link
            to={`/tickets/${ticket._id}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            View →
          </Link>
        </div>
      </div>
    </div>
  );
};

const DroppableColumn: React.FC<{ 
  id: string; 
  title: string; 
  color: string; 
  bgColor: string; 
  tickets: Ticket[]; 
  projects: Array<{ _id: string; name: string }>; 
  showProjectName: boolean; 
  isUpdating: string | null; 
}> = ({ 
  id, 
  title, 
  color, 
  bgColor, 
  tickets, 
  projects, 
  showProjectName, 
  isUpdating 
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${color}`}>
          {title}
        </h3>
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${bgColor} ${color}`}>
          {tickets.length}
        </span>
      </div>
      
      <div 
        ref={setNodeRef}
        className={`min-h-[200px] p-3 rounded-lg border-2 border-dashed transition-colors ${
          isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'
        }`}
      >
        <SortableContext
          items={tickets.map(t => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tickets.map((ticket) => (
            <div key={ticket._id} className="mb-3">
              <DraggableTicket 
                ticket={ticket} 
                projects={projects} 
                showProjectName={showProjectName} 
                isUpdating={isUpdating} 
              />
            </div>
          ))}
        </SortableContext>
        
        {tickets.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-sm">No tickets</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  tickets, 
  onTicketUpdate, 
  projects = [], 
  showProjectName = false 
}) => {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const ticket = tickets.find(t => t._id === event.active.id);
    setActiveTicket(ticket || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);

    if (!over) return;

    const ticketId = active.id as string;
    const newStatus = over.id as Ticket['status'];

    const ticket = tickets.find(t => t._id === ticketId);
    if (!ticket || ticket.status === newStatus) return;

    try {
      setIsUpdating(ticketId);
      await ticketService.updateTicket(ticketId, { status: newStatus });
      onTicketUpdate(ticketId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const getTicketsForColumn = (status: string) => {
    return tickets.filter(ticket => ticket.status === status);
  };

 

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <DroppableColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            bgColor={column.bgColor}
            tickets={getTicketsForColumn(column.id)}
            projects={projects}
            showProjectName={showProjectName}
            isUpdating={isUpdating}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeTicket ? (
          <div className="p-4 bg-white rounded-lg shadow-lg border border-gray-200 opacity-80">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                  {activeTicket.title}
                </h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(activeTicket.priority)}`}>
                  {activeTicket.priority}
                </span>
              </div>
              <p className="text-gray-600 text-xs line-clamp-2">
                {activeTicket.description}
              </p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
         </DndContext>
   );
};
