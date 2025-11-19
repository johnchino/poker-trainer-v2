import { useState } from 'react';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon } from './Icons';
import { canAddChild, getItemDepth, findItemById } from '../utils/itemHelpers';

// Recursive Sortable Item Component
const SortableItem = ({
  item,
  items, // Full items tree for depth checking
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
    id: item.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);

  const handleSave = () => {
    if (editName.trim()) {
      onRename(item.id, editName);
    }
    setIsEditing(false);
  };

  const hasChildren = item.children && item.children.length > 0;
  const isFolder = item.type === 'folder';
  const isGrid = item.type === 'grid';
  const isActive = isGrid && currentGrid === item.id;
  const canAdd = canAddChild(item.id, items);

  // Folders render as expandable folder structure
  if (isFolder) {
    return (
      <div ref={setNodeRef} style={style} className="sortable-folder">
        <div
          className={`folder-header group`}
          {...attributes}
          {...listeners}
          onClick={() => {
            if (!isEditing) {
              onToggle(item.id);
            }
          }}
        >
          {exportMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelection(item.id);
              }}
              onClick={(e) => e.stopPropagation()}
              className="export-checkbox"
            />
          )}
          <button
            onKeyDown={(e) => {
              if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
              }
            }}
            className="folder-toggle"
          >
            <Icon icon={item.expanded ? "chevron-down" : "chevron-right"} size={12} className="chevron-icon" />
            <Icon icon={item.expanded ? "folder-open" : "folder"} size={16} />
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
              <span className="folder-name">{item.name}</span>
            )}
          </button>
          <div className="folder-actions">
            {canAdd && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild(item.id);
                }}
                className="icon-btn"
                title="Add Grid"
              >
                <Icon icon="plus" size={14} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setEditName(item.name);
              }}
              className="icon-btn"
              title="Rename"
            >
              <Icon icon="pencil" size={10} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (hasChildren) {
                  const count = item.children.length;
                  const message = `This folder contains ${count} item${count > 1 ? 's' : ''}. Are you sure you want to delete it? This action cannot be undone.`;
                  if (window.confirm(message)) {
                    onDelete(item.id);
                  }
                } else {
                  onDelete(item.id);
                }
              }}
              className="icon-btn icon-btn-delete"
              title="Delete"
            >
              <Icon icon="trash-2" size={14} />
            </button>
          </div>
        </div>
        {item.expanded && hasChildren && (
          <div className="grids-list">
            <SortableContext items={item.children.map(child => child.id)} strategy={verticalListSortingStrategy}>
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
            </SortableContext>
          </div>
        )}
      </div>
    );
  }

  // Grids with children - maintain grid styling
  if (isGrid && hasChildren) {
    return (
      <div ref={setNodeRef} style={style}>
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
              <span className="grid-name">{item.name}</span>
            )}
          </div>
          <div className="grid-actions" onClick={(e) => e.stopPropagation()}>
            {canAdd && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild(item.id);
                }}
                className="icon-btn"
                title="Add Grid"
              >
                <Icon icon="plus" size={14} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setEditName(item.name);
              }}
              className="icon-btn"
              title="Rename"
            >
              <Icon icon="pencil" size={10} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const count = item.children.length;
                const message = `This grid contains ${count} item${count > 1 ? 's' : ''}. Are you sure you want to delete it? This action cannot be undone.`;
                if (window.confirm(message)) {
                  onDelete(item.id);
                }
              }}
              className="icon-btn icon-btn-delete"
              title="Delete"
            >
              <Icon icon="trash-2" size={14} />
            </button>
          </div>
        </div>
        {item.expanded && (
          <div className="grids-list">
            <SortableContext items={item.children.map(child => child.id)} strategy={verticalListSortingStrategy}>
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
            </SortableContext>
          </div>
        )}
      </div>
    );
  }

  // Leaf grid (no children)
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-grid group ${isActive ? 'active' : ''}`}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(item.id)}
    >
      <div className="grid-button">
        <span className="chevron-spacer" aria-hidden="true"></span>
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
          <span className="grid-name">{item.name}</span>
        )}
      </div>
      <div className="grid-actions" onClick={(e) => e.stopPropagation()}>
        {canAdd && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(item.id);
            }}
            className="icon-btn"
            title="Add Grid"
          >
            <Icon icon="plus" size={14} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
            setEditName(item.name);
          }}
          className="icon-btn"
          title="Rename"
        >
          <Icon icon="pencil" size={10} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
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

export const Sidebar = ({
  user,
  folders,  // Old structure (for backward compatibility)
  rootGrids,  // Old structure (for backward compatibility)
  items,  // New structure
  useNewStructure,  // Flag to switch between old and new
  currentGrid,
  onFoldersChange,
  onRootGridsChange,
  onItemsChange,  // New handler for items tree
  onCurrentGridChange,
  onAddFolder,
  onAddGrid,  // Old handler
  onAddItem,  // New handler for adding items in tree
  onDeleteFolder,
  onDeleteGrid,
  onDeleteItem,  // New handler
  onRenameFolder,
  onRenameGrid,
  onRenameItem,  // New handler
  onToggleFolder,
  onToggleItem,  // New handler
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

  // NEW STRUCTURE - Recursive rendering
  if (useNewStructure && items && items.length > 0) {
    const handleDragStart = (event) => {
      setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index
      }));

      onItemsChange(newItems);
    };

    return (
      <div className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">GTO Ranges</h2>
          <div className="sidebar-user">{user.email}</div>
        </div>

        <div className="sidebar-toolbar">
          <button onClick={() => onAddItem(null, 'folder')} className="toolbar-btn" title="New Folder">
            <Icon icon="plus" size={14} />
            <Icon icon="folder" size={16} />
          </button>
          <button onClick={() => onAddItem(null, 'grid')} className="toolbar-btn" title="New Grid">
            <Icon icon="plus" size={14} />
            <Icon icon="grid-3x3" size={16} />
          </button>
          <button
            onClick={() => {
              if (exportMode) {
                onExportData();
              } else {
                setExportMode(true);
              }
            }}
            className={`toolbar-btn ${exportMode ? 'active' : ''}`}
            title={exportMode ? "Export Selected" : "Export Mode"}
          >
            <Icon icon="upload" size={16} />
          </button>
          <button onClick={onImportData} className="toolbar-btn" title="Import Ranges">
            <Icon icon="import" size={16} />
          </button>
          {exportMode && (
            <button
              onClick={() => setExportMode(false)}
              className="toolbar-btn"
              title="Cancel Export"
            >
              <Icon icon="x" size={14} />
            </button>
          )}
          <div className="toolbar-spacer"></div>
          <button onClick={onLogout} className="toolbar-btn" title="Logout">
            <Icon icon="log-out" size={14} />
          </button>
        </div>

        <div className="sidebar-content">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
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
              {activeId ? (
                <div style={{ cursor: 'grabbing', opacity: 0.9 }}>
                  {(() => {
                    const item = findItemById(activeId, items);
                    if (!item) return null;
                    return (
                      <div className={`sortable-${item.type === 'folder' ? 'folder' : 'grid'}`} style={{ background: '#374151', borderRadius: '4px' }}>
                        <div className={item.type === 'folder' ? 'folder-header' : 'grid-button'}>
                          {item.type === 'folder' ? (
                            <>
                              <Icon icon={item.expanded ? 'chevron-down' : 'chevron-right'} size={12} />
                              <Icon icon="folder" size={16} />
                              <span className="folder-name">{item.name}</span>
                            </>
                          ) : (
                            <>
                              <Icon icon="grid-3x3" size={14} />
                              <span className="grid-name">{item.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    );
  }

  // OLD STRUCTURE - Keep existing logic for backward compatibility
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

  // Sortable Folder Component (OLD)
  const SortableFolder = ({ folder, onToggle, onRename, onDelete, onAddGrid, children, exportMode, isSelected, onToggleSelection }) => {
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
          {exportMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelection(folder.id);
              }}
              onClick={(e) => e.stopPropagation()}
              className="export-checkbox"
            />
          )}
          <button
            onKeyDown={(e) => {
              if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
              }
            }}
            className="folder-toggle"
          >
            <Icon icon={folder.expanded ? "chevron-down" : "chevron-right"} size={12} className="chevron-icon" />
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

  // Sortable Grid Component (OLD)
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

  // Sortable Root Grid Component (OLD)
  const SortableRootGrid = (props) => {
    const grid = props.grid;
    const isActive = props.isActive;
    const onSelect = props.onSelect;
    const onRename = props.onRename;
    const onDelete = props.onDelete;
    const exportMode = props.exportMode;
    const isSelected = props.isSelected;
    const onToggleSelection = props.onToggleSelection;

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
          {exportMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelection(grid.id);
              }}
              onClick={(e) => e.stopPropagation()}
              className="export-checkbox"
            />
          )}
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
        <button
          onClick={() => {
            if (exportMode) {
              onExportData();
            } else {
              setExportMode(true);
            }
          }}
          className={`toolbar-btn ${exportMode ? 'active' : ''}`}
          title={exportMode ? "Export Selected" : "Export Mode"}
        >
          <Icon icon="upload" size={16} />
        </button>
        <button onClick={onImportData} className="toolbar-btn" title="Import Ranges">
          <Icon icon="import" size={16} />
        </button>
        {exportMode && (
          <button
            onClick={() => setExportMode(false)}
            className="toolbar-btn"
            title="Cancel Export"
          >
            <Icon icon="x" size={14} />
          </button>
        )}
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
                    exportMode={exportMode}
                    isSelected={selectedForExport.has(folder.id)}
                    onToggleSelection={onToggleExportSelection}
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
                    exportMode={exportMode}
                    isSelected={selectedForExport.has(grid.id)}
                    onToggleSelection={onToggleExportSelection}
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
