import { Icon } from './Icons';

/**
 * Reusable action buttons for sidebar items
 */
export const ItemActions = ({
  canAdd,
  hasChildren,
  childrenCount,
  itemType = 'item',
  onAdd,
  onRename,
  onDelete
}) => {
  const handleDelete = (e) => {
    e.stopPropagation();

    if (hasChildren && childrenCount > 0) {
      const message = `This ${itemType} contains ${childrenCount} item${childrenCount > 1 ? 's' : ''}. Are you sure you want to delete it? This action cannot be undone.`;
      if (window.confirm(message)) {
        onDelete();
      }
    } else {
      onDelete();
    }
  };

  return (
    <div
      className={`${itemType}-actions`}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {canAdd && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="icon-btn"
          title="Add Grid"
        >
          <Icon icon="plus" size={14} />
        </button>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRename();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="icon-btn"
        title="Rename"
      >
        <Icon icon="pencil" size={10} />
      </button>
      <button
        onClick={handleDelete}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="icon-btn icon-btn-delete"
        title="Delete"
      >
        <Icon icon="trash-2" size={14} />
      </button>
    </div>
  );
};
