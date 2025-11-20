import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Icon } from './Icons';
import { ItemActions } from './ItemActions';
import { SidebarToolbar } from './SidebarToolbar';
import { useInlineEdit } from '../hooks/useInlineEdit';
import { canAddChild, findItemById } from '../utils/itemHelpers';

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
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="export-checkbox"
    />
  );
};

// Draggable Item Component
const DraggableItem = ({
  item,
  index,
  items,
  currentGrid,
  onSelect,
  onToggle,
  onRename,
  onDelete,
  onAddChild,
  exportMode,
  isSelected,
  onToggleSelection,
  isNested = false,
  depth = 0
}) => {
  const { isEditing, editValue, setEditValue, startEdit, handleSave } = useInlineEdit(
    item.name,
    (newName) => onRename(item.id, newName)
  );

  const hasChildren = item.children && item.children.length > 0;
  const isFolder = item.type === 'folder';
  const isGrid = item.type === 'grid';
  const isActive = isGrid && currentGrid === item.id;
  const canAdd = canAddChild(item.id, items);

  // Calculate indentation based on depth (1.5rem per level)
  const indentation = depth > 0 ? `${depth * 1.5}rem` : '0';

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
    }
  };

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => {
        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            style={{
              ...provided.draggableProps.style,
              opacity: snapshot.isDragging ? 0.5 : 1,
            }}
          >
          {isFolder ? (
            <div className="sortable-folder">
              <div
                className="folder-header group"
                {...provided.dragHandleProps}
              >
                <ExportCheckbox exportMode={exportMode} isSelected={isSelected} onToggle={() => onToggleSelection(item.id)} />
                <div
                  onKeyDown={handleKeyDown}
                  className="folder-toggle"
                  onClick={() => !isEditing && onToggle(item.id)}
                >
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
                </div>
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
                <Droppable
                  droppableId={`folder-${item.id}`}
                  type="GRID"
                  renderClone={(provided, snapshot, rubric) => {
                    const cloneItem = item.children[rubric.source.index];
                    const cloneIndentation = `${(depth + 1) * 1.5}rem`;
                    const cloneHasChildren = cloneItem.children && cloneItem.children.length > 0;
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          opacity: 0.8,
                        }}
                      >
                        <div className={`sortable-grid group`}>
                          <div className="grid-button" style={{ marginLeft: cloneIndentation }}>
                            {cloneHasChildren ? (
                              <div className="chevron-toggle-btn">
                                <Icon icon="chevron-right" size={10} className="chevron-icon" />
                              </div>
                            ) : (
                              <span className="chevron-spacer" aria-hidden="true"></span>
                            )}
                            <Icon icon="grid-3x3" size={14} />
                            <span className="grid-name">{cloneItem.name}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="grids-list"
                      style={{
                        backgroundColor: snapshot.isDraggingOver ? 'rgba(93, 186, 25, 0.05)' : 'transparent',
                      }}
                    >
                      {item.children.map((child, childIndex) => (
                        <DraggableItem
                          key={child.id}
                          item={child}
                          index={childIndex}
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
                          isNested={true}
                          depth={depth + 1}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          ) : isGrid && hasChildren ? (
            // Grid with children (can be nested)
            <div className="sortable-grid-container">
              <div
                className={`sortable-grid group ${isActive ? 'active' : ''}`}
                {...provided.dragHandleProps}
                onClick={() => onSelect(item.id)}
              >
                <div className="grid-button" style={{ marginLeft: indentation }}>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(item.id);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="chevron-toggle-btn"
                    title={item.expanded ? "Collapse" : "Expand"}
                  >
                    <Icon icon={item.expanded ? "chevron-down" : "chevron-right"} size={10} className="chevron-icon" />
                  </div>
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
                <Droppable
                  droppableId={`grid-${item.id}`}
                  type="GRID"
                  renderClone={(provided, snapshot, rubric) => {
                    const cloneItem = item.children[rubric.source.index];
                    const cloneIndentation = `${(depth + 1) * 1.5}rem`;
                    const cloneHasChildren = cloneItem.children && cloneItem.children.length > 0;
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          opacity: 0.8,
                        }}
                      >
                        <div className={`sortable-grid group`}>
                          <div className="grid-button" style={{ marginLeft: cloneIndentation }}>
                            {cloneHasChildren ? (
                              <div className="chevron-toggle-btn">
                                <Icon icon="chevron-right" size={10} className="chevron-icon" />
                              </div>
                            ) : (
                              <span className="chevron-spacer" aria-hidden="true"></span>
                            )}
                            <Icon icon="grid-3x3" size={14} />
                            <span className="grid-name">{cloneItem.name}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="grids-list"
                      style={{
                        backgroundColor: snapshot.isDraggingOver ? 'rgba(93, 186, 25, 0.05)' : 'transparent',
                      }}
                    >
                      {item.children.map((child, childIndex) => (
                        <DraggableItem
                          key={child.id}
                          item={child}
                          index={childIndex}
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
                          isNested={true}
                          depth={depth + 1}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          ) : (
            // Grid without children
            <div
              className={`sortable-grid group ${isActive ? 'active' : ''}`}
              {...provided.dragHandleProps}
              onClick={() => onSelect(item.id)}
            >
              <div className="grid-button" style={{ marginLeft: indentation }}>
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
                hasChildren={hasChildren}
                childrenCount={item.children?.length || 0}
                itemType="grid"
                onAdd={() => onAddChild(item.id)}
                onRename={startEdit}
                onDelete={() => onDelete(item.id)}
              />
            </div>
          )}
        </div>
      );
      }}
    </Draggable>
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
  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // Dropped in same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Helper to reorder array
    const reorder = (list, startIndex, endIndex) => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    };

    // Case 1: Reordering at root level (folders and root grids)
    if (source.droppableId === 'root' && destination.droppableId === 'root') {
      const reordered = reorder(items, source.index, destination.index).map((item, index) => ({
        ...item,
        order: index
      }));
      onItemsChange(reordered);
      return;
    }

    // Case 2: Reordering within a folder
    if (source.droppableId === destination.droppableId && source.droppableId.startsWith('folder-')) {
      const folderId = source.droppableId.replace('folder-', '');

      const updateTree = (items) => {
        return items.map(item => {
          if (item.id === folderId) {
            const reorderedChildren = reorder(item.children, source.index, destination.index).map((child, index) => ({
              ...child,
              order: index
            }));
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

    // Case 3: Moving between different droppables (future enhancement)
    // For now, we'll ignore cross-folder moves to keep it simple
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="root" type="ROOT">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  backgroundColor: snapshot.isDraggingOver ? 'rgba(93, 186, 25, 0.05)' : 'transparent',
                  minHeight: '100px',
                }}
              >
                {items.map((item, index) => (
                  <DraggableItem
                    key={item.id}
                    item={item}
                    index={index}
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
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};
