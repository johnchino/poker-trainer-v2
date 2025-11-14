import { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon } from './Icons';

// Sortable Folder Component
const SortableFolder = ({ folder, onToggle, onRename, onDelete, onAddGrid, onGridsReorder, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: folder.id 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);

  const handleSave = () => {
    if (editName.trim()) {
      onRename(folder.id, editName);
    }
    setIsEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="sortable-folder">
      <div
        className="folder-header group"
        {...attributes}
        {...listeners}
        onClick={() => { if (!isEditing) onToggle(folder.id); }}
      >
        <button
          onKeyDown={(e) => {
            if (e.key === ' ' || e.code === 'Space') {
              e.preventDefault();
            }
          }}
          className="folder-toggle"
        >
          <Icon icon={folder.expanded ? "chevron-down" : "chevron-right"} size={12} />
          <Icon icon={folder.expanded ? "folder-open" : "folder"} size={16} />
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              onKeyDown={(e) => e.stopPropagation()}
              onBlur={handleSave}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              data-no-dnd="true"
              className="folder-name-input"
              autoFocus
            />
          ) : (
            <span className="folder-name">{folder.name}</span>
          )}
        </button>
        <div className="folder-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddGrid(folder.id);
            }}
            className="icon-btn"
            title="Add Grid"
          >
            <Icon icon="plus" size={14} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
              setEditName(folder.name);
            }} 
            className="icon-btn" 
            title="Rename"
          >
            <Icon icon="pencil" size={10} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const hasGrids = folder.grids && folder.grids.length > 0;
              if (hasGrids) {
                const gridCount = folder.grids.length;
                const message = 'This folder contains ' + gridCount + ' grid' + (gridCount > 1 ? 's' : '') + '. Are you sure you want to delete it? This action cannot be undone.';
                if (window.confirm(message)) {
                  onDelete(folder.id);
                }
              } else {
                onDelete(folder.id);
              }
            }}
            className="icon-btn icon-btn-delete"
            title="Delete"
          >
            <Icon icon="trash-2" size={14} />
          </button>
        </div>
      </div>
      {folder.expanded && children}
    </div>
  );
};

// Sortable Grid Component
const SortableGrid = ({ grid, folderId, isActive, onSelect, onRename, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: grid.id 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(grid.name);

  const handleSave = () => {
    if (editName.trim()) {
      onRename(folderId, grid.id, editName);
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-grid group ${isActive ? 'active' : ''}`}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(grid.id)}
    >
      <div className="grid-button">
        <Icon icon="grid-3x3" size={14} />
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            onKeyDown={(e) => e.stopPropagation()}
            onBlur={handleSave}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            data-no-dnd="true"
            className="grid-name-input"
            autoFocus
          />
        ) : (
          <span className="grid-name">{grid.name}</span>
        )}
      </div>
      <div className="grid-actions" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
            setEditName(grid.name);
          }}
          className="icon-btn" 
          title="Rename"
        >
          <Icon icon="pencil" size={10} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(folderId, grid.id);
          }}
          className="icon-btn icon-btn-delete" 
          title="Delete"
        >
          <Icon icon="trash-2" size={14} />
        </button>
      </div>
    </div>
  );
};

// Sortable Root Grid Component (renders at folder level)
const SortableRootGrid = (props) => {
  const grid = props.grid;
  const isActive = props.isActive;
  const onSelect = props.onSelect;
  const onRename = props.onRename;
  const onDelete = props.onDelete;

  const sortable = useSortable({ id: grid.id });
  const attributes = sortable.attributes;
  const listeners = sortable.listeners;
  const setNodeRef = sortable.setNodeRef;
  const transform = sortable.transform;
  const transition = sortable.transition;
  const isDragging = sortable.isDragging;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const editingState = useState(false);
  const isEditing = editingState[0];
  const setIsEditing = editingState[1];

  const nameState = useState(grid.name);
  const editName = nameState[0];
  const setEditName = nameState[1];

  const handleSave = () => {
    if (editName.trim()) {
      onRename(null, grid.id, editName);
    }
    setIsEditing(false);
  };

  const folderHeaderClass = 'folder-header group' + (isActive ? ' active' : '');

  return (
    <div ref={setNodeRef} style={style} className="sortable-folder">
      <div
        className={folderHeaderClass}
        {...attributes}
        {...listeners}
        onClick={() => onSelect(grid.id)}
      >
        <div className="folder-toggle">
          <Icon icon="grid-3x3" size={16} />
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              onKeyDown={(e) => e.stopPropagation()}
              onBlur={handleSave}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              data-no-dnd="true"
              className="folder-name-input"
              autoFocus
            />
          ) : (
            <span className="folder-name">{grid.name}</span>
          )}
        </div>
        <div className="folder-actions" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
              setEditName(grid.name);
            }}
            className="icon-btn"
            title="Rename"
          >
            <Icon icon="pencil" size={10} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(null, grid.id);
            }}
            className="icon-btn icon-btn-delete"
            title="Delete"
          >
            <Icon icon="trash-2" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const Sidebar = ({ 
  user, 
  folders, 
  rootGrids,
  currentGrid,
  onFoldersChange,
  onRootGridsChange,
  onCurrentGridChange,
  onAddFolder,
  onAddGrid,
  onDeleteFolder,
  onDeleteGrid,
  onRenameFolder,
  onRenameGrid,
  onToggleFolder,
  onLogout
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
      // Custom activation to prevent drag from inputs
      onActivation: (event) => {
        // Don't start drag if clicking on an element with data-no-dnd attribute
        const target = event.event.target;
        if (target.closest && target.closest('[data-no-dnd="true"]')) {
          return false;
        }
      },
    })
  );


  // Create unified sidebar items (folders + root grids) sorted by order
  const sidebarItems = [
    ...folders.map(f => ({ type: 'folder', data: f })),
    ...rootGrids.map(g => ({ type: 'rootGrid', data: g }))
  ].sort((a, b) => a.data.order - b.data.order);

  const handleUnifiedDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sidebarItems.findIndex(item => item.data.id === active.id);
    const newIndex = sidebarItems.findIndex(item => item.data.id === over.id);

    const newItems = arrayMove(sidebarItems, oldIndex, newIndex);

    // Separate back into folders and root grids with new order
    const updatedFolders = [];
    const updatedRootGrids = [];

    newItems.forEach((item, index) => {
      if (item.type === 'folder') {
        updatedFolders.push({ ...item.data, order: index });
      } else {
        updatedRootGrids.push({ ...item.data, order: index });
      }
    });

    onFoldersChange(updatedFolders);
    onRootGridsChange(updatedRootGrids);
  };

  const handleGridDragEnd = (folderId, event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const folder = folders.find(f => f.id === folderId);
      const oldIndex = folder.grids.findIndex(g => g.id === active.id);
      const newIndex = folder.grids.findIndex(g => g.id === over.id);

      const newGrids = arrayMove(folder.grids, oldIndex, newIndex);
      const newFolders = folders.map(f =>
        f.id === folderId ? { ...f, grids: newGrids } : f
      );
      onFoldersChange(newFolders);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">GTO Ranges</h2>
        <div className="sidebar-user">{user.email}</div>
      </div>

      <div className="sidebar-toolbar">
        <button onClick={onAddFolder} className="toolbar-btn" title="New Folder">
          <Icon icon="plus" size={14} />
          <Icon icon="folder" size={16} />
        </button>
        <button onClick={() => onAddGrid()} className="toolbar-btn" title="New Grid">
          <Icon icon="plus" size={14} />
          <Icon icon="grid-3x3" size={16} />
        </button>
        <button className="toolbar-btn" title="Upload">
          <Icon icon="upload" size={14} />
        </button>
        <button className="toolbar-btn" title="Download">
          <Icon icon="download" size={14} />
        </button>
        <div className="toolbar-spacer"></div>
        <button onClick={onLogout} className="toolbar-btn" title="Logout">
          <Icon icon="log-out" size={14} />
        </button>
      </div>

      <div className="sidebar-content">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleUnifiedDragEnd}
        >
          <SortableContext items={sidebarItems.map(item => item.data.id)} strategy={verticalListSortingStrategy}>
            {sidebarItems.map(item => {
              if (item.type === 'folder') {
                const folder = item.data;
                return (
                  <SortableFolder
                    key={folder.id}
                    folder={folder}
                    onToggle={onToggleFolder}
                    onRename={onRenameFolder}
                    onDelete={onDeleteFolder}
                    onAddGrid={onAddGrid}
                  >
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(e) => handleGridDragEnd(folder.id, e)}
                    >
                      <SortableContext items={folder.grids.map(g => g.id)} strategy={verticalListSortingStrategy}>
                        <div className="grids-list">
                          {folder.grids.map(grid => (
                            <SortableGrid
                              key={grid.id}
                              grid={grid}
                              folderId={folder.id}
                              isActive={currentGrid === grid.id}
                              onSelect={onCurrentGridChange}
                              onRename={onRenameGrid}
                              onDelete={onDeleteGrid}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </SortableFolder>
                );
              } else {
                const grid = item.data;
                return (
                  <SortableRootGrid
                    key={grid.id}
                    grid={grid}
                    isActive={currentGrid === grid.id}
                    onSelect={onCurrentGridChange}
                    onRename={onRenameGrid}
                    onDelete={onDeleteGrid}
                  />
                );
              }
            })}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
