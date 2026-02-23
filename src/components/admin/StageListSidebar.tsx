import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, GripVertical, Check, X } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Stage {
  id: string;
  name: string;
  position: number;
  color: string | null;
}

interface StageListSidebarProps {
  stages: Stage[];
  selectedStageId: string;
  onSelectStage: (id: string) => void;
  isLoading: boolean;
  onCreateStage?: (name: string) => void;
  onUpdateStage?: (id: string, name: string) => void;
  onDeleteStage?: (id: string) => void;
  onReorderStages?: (orderedIds: string[]) => void;
}

function SortableStageItem({
  stage,
  idx,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  editMode,
}: {
  stage: Stage;
  idx: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  editMode: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stage.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group">
      <button
        onClick={onSelect}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-all text-left',
          'hover:bg-muted/60',
          isSelected
            ? 'bg-primary/8 text-primary border border-primary/20'
            : 'text-muted-foreground border border-transparent'
        )}
      >
        {editMode && (
          <span {...attributes} {...listeners} className="cursor-grab shrink-0">
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40" />
          </span>
        )}
        <div
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: stage.color ?? 'hsl(var(--muted-foreground))' }}
        />
        <span className="truncate flex-1">{stage.name}</span>
        {editMode && (
          <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-1 rounded hover:bg-muted"
              >
                <Pencil className="h-3 w-3" />
              </span>
            )}
            {onDelete && (
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1 rounded hover:bg-destructive/10 text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </span>
            )}
          </span>
        )}
        {!editMode && (
          <span className="ml-auto text-[10px] text-muted-foreground/60">{idx + 1}</span>
        )}
      </button>
    </div>
  );
}

export function StageListSidebar({
  stages,
  selectedStageId,
  onSelectStage,
  isLoading,
  onCreateStage,
  onUpdateStage,
  onDeleteStage,
  onReorderStages,
}: StageListSidebarProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const editMode = !!(onCreateStage || onUpdateStage || onDeleteStage);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorderStages) return;
    const oldIdx = stages.findIndex(s => s.id === active.id);
    const newIdx = stages.findIndex(s => s.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = [...stages];
    const [moved] = reordered.splice(oldIdx, 1);
    reordered.splice(newIdx, 0, moved);
    onReorderStages(reordered.map(s => s.id));
  };

  const handleAddStage = () => {
    if (!newName.trim() || !onCreateStage) return;
    onCreateStage(newName.trim());
    setNewName('');
    setAdding(false);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim() || !onUpdateStage) return;
    onUpdateStage(editingId, editName.trim());
    setEditingId(null);
    setEditName('');
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Etapas</p>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    );
  }

  const stageItems = stages.map(s => s.id);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Etapas do Funil
        </p>
        {editMode && onCreateStage && (
          <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => setAdding(true)}>
            <Plus className="h-3 w-3" /> Nova
          </Button>
        )}
      </div>

      {adding && (
        <div className="flex items-center gap-1 mb-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome da etapa"
            className="h-8 text-xs"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
          />
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleAddStage}>
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => { setAdding(false); setNewName(''); }}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {editingId && (
        <div className="flex items-center gap-1 mb-2 bg-muted/50 rounded-md px-2 py-1.5">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="h-7 text-xs"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
          />
          <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleSaveEdit}>
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => setEditingId(null)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stageItems} strategy={verticalListSortingStrategy}>
          {stages.map((stage, idx) => (
            <SortableStageItem
              key={stage.id}
              stage={stage}
              idx={idx}
              isSelected={selectedStageId === stage.id}
              onSelect={() => onSelectStage(stage.id)}
              editMode={editMode}
              onEdit={onUpdateStage ? () => {
                setEditingId(stage.id);
                setEditName(stage.name);
              } : undefined}
              onDelete={onDeleteStage ? () => onDeleteStage(stage.id) : undefined}
            />
          ))}
        </SortableContext>
      </DndContext>

      {stages.length === 0 && (
        <p className="text-xs text-muted-foreground py-4 text-center">
          Nenhuma etapa encontrada
        </p>
      )}
    </div>
  );
}
