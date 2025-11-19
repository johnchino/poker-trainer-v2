import { useState } from 'react';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, MeasuringStrategy } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon } from './Icons';
import { ItemActions } from './ItemActions';
import { SidebarToolbar } from './SidebarToolbar';
import { useInlineEdit } from '../hooks/useInlineEdit';
import { canAddChild, findItemById, findParentItem } from '../utils/itemHelpers';

// Reusable inline edit input component
const InlineEditInput = ({ value, onChange, onSave, onKeyDown, className }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    onKeyPress={(e) => e.key === 'Enter' && onSave()}
    onKeyDown={onKeyDown}
    onBlur={onSave}
    onClick={(e) => e.stopPropagation()}
    onPointerDown={(e) => e.stopPropagation()}
    data-no-dnd="true"
    className={className}
    autoFocus
  />
);

// Reusable export checkbox component
const ExportCheckbox = ({ exportMode, isSelected, onToggle }) => {
  if (!exportMode) return null;

  return (
    <input
      type="checkbox"
      checked={isSelected}
      onChange={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onClick={(e) => e.stopPropagation()}
      className="export-checkbox"
    />
  );
};

// Unified Sortable Item Component
const SortableItem = ({
  item,
  items,
  currentGrid,
  onSelect,
  onToggle,
  onRename,
  onDelete,
  onAddChild,
  exportMode,
  isSelected,
  onToggleSelection
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : (transition || undefined),
    opacity: isDragging ? 0 : 1,
  };

  const { isEditing, editValue, setEditValue, startEdit, handleSave } = useInlineEdit(
    item.name,
    (newName) => onRename(item.id, newName)
  );

  const hasChildren = item.children && item.children.length > 0;
  const isFolder = item.type === 'folder';
  const isGrid = item.type === 'grid';
  const isActive = isGrid && currentGrid === item.id;
  const canAdd = canAddChild(item.id, items);

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
    }
  };

  // Render folder
  if (isFolder) {
    return (
      <div ref={setNodeRef} style={style} className="sortable-folder">
        <div
          className="folder-header group"
          {...attributes}
          {...listeners}
          onClick={() => !isEditing && onToggle(item.id)}
        >
          <ExportCheckbox exportMode={exportMode} isSelected={isSelected} onToggle={() => onToggleSelection(item.id)} />
          <button onKeyDown={handleKeyDown} className="folder-toggle">
            <Icon icon={item.expanded ? "chevron-down" : "chevron-right"} size={12} className="chevron-icon" />
            <Icon icon={item.expanded ? "folder-open" : "folder"} size={16} />
            {isEditing ? (
              <InlineEditInput
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onSave={handleSave}
                onKeyDown={handleKeyDown}
                className="folder-name-input"
              />
            ) : (
              <span className="folder-name">{item.name}</span>
            )}
          </button>
          <ItemActions
            canAdd={canAdd}
            hasChildren={hasChildren}
            childrenCount={item.children?.length || 0}
            itemType="folder"
            onAdd={() => onAddChild(item.id)}
            onRename={startEdit}
            onDelete={() => onDelete(item.id)}
          />
        </div>
        {item.expanded && hasChildren && (
          <div className="grids-list">
            {item.children.map(child => (
              <SortableItem
                key={child.id}
                item={child}
                items={items}
                currentGrid={currentGrid}
                onSelect={onSelect}
                onToggle={onToggle}
                onRename={onRename}
                onDelete={onDelete}
                onAddChild={onAddChild}
                exportMode={exportMode}
                isSelected={isSelected}
                onToggleSelection={onToggleSelection}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render grid with children (match folder structure for smooth dragging)
  if (isGrid && hasChildren) {
    return (
      <div ref={setNodeRef} style={style} className="grid-with-children-container">
        <div
          className={`sortable-grid group grid-with-children ${isActive ? 'active' : ''}`}
          {...attributes}
          {...listeners}
          onClick={() => onSelect(item.id)}
        >
          <div className="grid-button">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(item.id);
              }}
              className="chevron-toggle-btn"
              title={item.expanded ? "Collapse" : "Expand"}
            >
              <Icon icon={item.expanded ? "chevron-down" : "chevron-right"} size={10} className="chevron-icon" />
            </button>
            <Icon icon="grid-3x3" size={14} />
            {isEditing ? (
              <InlineEditInput
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onSave={handleSave}
                onKeyDown={handleKeyDown}
                className="grid-name-input"
              />
            ) : (
              <span className="grid-name">{item.name}</span>
            )}
          </div>
          <ItemActions
            canAdd={canAdd}
            hasChildren={hasChildren}
            childrenCount={item.children?.length || 0}
            itemType="grid"
            onAdd={() => onAddChild(item.id)}
            onRename={startEdit}
            onDelete={() => onDelete(item.id)}
          />
        </div>
        {item.expanded && (
          <div className="grids-list">
            {item.children.map(child => (
              <SortableItem
                key={child.id}
                item={child}
                items={items}
                currentGrid={currentGrid}
                onSelect={onSelect}
                onToggle={onToggle}
                onRename={onRename}
                onDelete={onDelete}
                onAddChild={onAddChild}
                exportMode={exportMode}
                isSelected={isSelected}
                onToggleSelection={onToggleSelection}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render leaf grid (no children) - match folder structure for smooth dragging
  return (
    <div ref={setNodeRef} style={style} className="sortable-grid-wrapper">
      <div
        className={`sortable-grid group ${isActive ? 'active' : ''}`}
        {...attributes}
        {...listeners}
        onClick={() => onSelect(item.id)}
      >
        <div className="grid-button">
          <span className="chevron-spacer" aria-hidden="true"></span>
          <Icon icon="grid-3x3" size={14} />
          {isEditing ? (
            <InlineEditInput
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onSave={handleSave}
              onKeyDown={handleKeyDown}
              className="grid-name-input"
            />
          ) : (
            <span className="grid-name">{item.name}</span>
          )}
        </div>
        <ItemActions
          canAdd={canAdd}
          hasChildren={false}
          childrenCount={0}
          itemType="grid"
          onAdd={() => onAddChild(item.id)}
          onRename={startEdit}
          onDelete={() => onDelete(item.id)}
        />
      </div>
    </div>
  );
};

// Drag overlay component
const DragOverlayContent = ({ item, isNested }) => {
  if (!item) return null;

  const isFolder = item.type === 'folder';

  // Add indentation for nested grids
  const overlayStyle = {
    cursor: 'grabbing',
    opacity: 0.95,
    paddingLeft: isNested && !isFolder ? '1.5rem' : '0',
  };

  const itemStyle = {
    background: 'linear-gradient(135deg, #374151 0%, #2d3748 100%)',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    minWidth: '200px',
  };

  return (
    <div style={overlayStyle}>
      <div style={itemStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isFolder ? (
            <>
              <Icon icon={item.expanded ? 'chevron-down' : 'chevron-right'} size={12} />
              <Icon icon="folder" size={16} />
              <span style={{ color: 'white', fontSize: '0.875rem' }}>{item.name}</span>
            </>
          ) : (
            <>
              <Icon icon="grid-3x3" size={14} />
              <span style={{ color: 'white', fontSize: '0.875rem' }}>{item.name}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Sidebar Component
export const Sidebar = ({
  user,
  items,
  currentGrid,
  onItemsChange,
  onCurrentGridChange,
  onAddItem,
  onDeleteItem,
  onRenameItem,
  onToggleItem,
  onLogout,
  exportMode,
  setExportMode,
  selectedForExport,
  onToggleExportSelection,
  onExportData,
  onImportData
}) => {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
      onActivation: (event) => {
        const target = event.event.target;
        if (target.closest && target.closest('[data-no-dnd="true"]')) {
          return false;
        }
      },
    })
  );

  // Custom measuring configuration to prevent snap-back during drag
  const measuring = {
    droppable: {
      strategy: MeasuringStrategy.Always,
    },
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // Custom collision detection to prevent folder interference
  const customCollisionDetection = (args) => {
    const activeItem = findItemById(activeId, items);
    if (!activeItem) return closestCenter(args);

    const activeParent = findParentItem(activeId, items);

    // If dragging a grid inside a folder, filter out the parent folder as a collision target
    if (activeParent) {
      const filteredRects = args.droppableRects.filter(([id]) => {
        return id !== activeParent.id;
      });

      return closestCenter({
        ...args,
        droppableRects: new Map(filteredRects),
      });
    }

    return closestCenter(args);
  };

  const handleDragEnd = (event) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeItem = findItemById(active.id, items);
    const overItem = findItemById(over.id, items);

    if (!activeItem || !overItem) return;

    const activeParent = findParentItem(active.id, items);
    const overParent = findParentItem(over.id, items);

    // Case 1: Both items are at root level
    if (!activeParent && !overParent) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index
      }));

      onItemsChange(newItems);
      return;
    }

    // Case 2: Both items have the same parent (reordering within folder)
    if (activeParent && overParent && activeParent.id === overParent.id) {
      const oldIndex = activeParent.children.findIndex(child => child.id === active.id);
      const newIndex = activeParent.children.findIndex(child => child.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      // Reorder children
      const reorderedChildren = arrayMove(activeParent.children, oldIndex, newIndex).map((child, index) => ({
        ...child,
        order: index
      }));

      // Update the parent with reordered children
      const updateTree = (items) => {
        return items.map(item => {
          if (item.id === activeParent.id) {
            return { ...item, children: reorderedChildren };
          }
          if (item.children && item.children.length > 0) {
            return { ...item, children: updateTree(item.children) };
          }
          return item;
        });
      };

      const newItems = updateTree(items);
      onItemsChange(newItems);
      return;
    }

    // Case 3: Moving between different parents or levels
    // For now, we'll just prevent cross-parent moves to keep it simple
    // You could implement move logic here if needed
  };

  // Determine if active item is nested (has a parent)
  const getActiveItemInfo = () => {
    if (!activeId) return { item: null, isNested: false };
    const item = findItemById(activeId, items);
    const parent = findParentItem(activeId, items);
    return { item, isNested: !!parent };
  };

  // Flatten all items for single SortableContext (prevents nested context conflicts)
  const flattenAllItemIds = (items) => {
    const ids = [];
    const flatten = (itemList) => {
      itemList.forEach(item => {
        ids.push(item.id);
        if (item.children && item.children.length > 0) {
          flatten(item.children);
        }
      });
    };
    flatten(items);
    return ids;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">GTO Ranges</h2>
        <div className="sidebar-user">{user.email}</div>
      </div>

      <SidebarToolbar
        onAddFolder={() => onAddItem(null, 'folder')}
        onAddGrid={() => onAddItem(null, 'grid')}
        exportMode={exportMode}
        setExportMode={setExportMode}
        onExportData={onExportData}
        onImportData={onImportData}
        onLogout={onLogout}
      />

      <div className="sidebar-content">
        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          measuring={measuring}
        >
          <SortableContext items={flattenAllItemIds(items)} strategy={verticalListSortingStrategy}>
            {items.map(item => (
              <SortableItem
                key={item.id}
                item={item}
                items={items}
                currentGrid={currentGrid}
                onSelect={onCurrentGridChange}
                onToggle={onToggleItem}
                onRename={onRenameItem}
                onDelete={onDeleteItem}
                onAddChild={onAddItem}
                exportMode={exportMode}
                isSelected={selectedForExport.has(item.id)}
                onToggleSelection={onToggleExportSelection}
              />
            ))}
          </SortableContext>
          <DragOverlay>
            {(() => {
              const { item, isNested } = getActiveItemInfo();
              return item ? <DragOverlayContent item={item} isNested={isNested} /> : null;
            })()}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
